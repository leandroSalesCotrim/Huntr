// user.service.ts
import { exchangeNpssoForCode, exchangeCodeForAccessToken, getUserTitles, exchangeRefreshTokenForAuthTokens, AuthTokensResponse, UserTitlesResponse } from 'psn-api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class UsuarioService {

    async criarConta(usuario: string, senha: string,) {
    }
    async login(usuario: string, senha: string) {
    }
    async logout(idUsuario: number) {
    }

    async obterPsnAuthorization(sso: string): Promise<boolean> {
        try {
            console.log(sso + " em obterPsnAuthorization");

            // Chame a função do script externo passando o SSO token
            const accessCode = await exchangeNpssoForCode(sso);

            // Use o accessCode para obter o token de acesso
            const authorization = await exchangeCodeForAccessToken(accessCode);

            // Armazene o token de autorização
            await AsyncStorage.setItem('authToken', JSON.stringify(authorization));

            const authorizationTeste = await AsyncStorage.getItem('authToken');
            if (authorizationTeste) {
                console.log("Token armazenado com sucesso");
                return true;
            } else {
                console.log("Token não armazenado com sucesso");
                return false;
            }
        } catch (error) {
            console.error('Erro ao tentar obter o código de autorização da PSN:', error);
            if ((error as Error).message.includes('There was a problem retrieving your PSN access code')) {
                console.log('Erro ao tentar autenticar. Tentando limpar o estado de autenticação...');
            }
            throw new Error('Erro ao tentar fazer requisição');
        }
    }

    async validarToken(): Promise<void> {
        try {
            let tokenString = await AsyncStorage.getItem('authToken');
            if (tokenString) {
                let authToken: AuthTokensResponse = JSON.parse(tokenString);

                //Chamando uma requisição basica apenas para validar se o token esta valido ainda
                const userTitlesResponse: UserTitlesResponse | Error = await getUserTitles(
                    { accessToken: authToken.accessToken },
                    "me"
                );

                //se existir um campo chamado error na userTitlesResponse, provavelmente é por conta do token não estar valido
                //então ele chama a renovação de token
                if ('error' in userTitlesResponse) {
                    await this.atualizarToken(authToken);
                } else if ('trophyTitles' in userTitlesResponse) {
                    console.log("Requisição realizada com sucesso. Token valido!");
                    // console.log("Retorno da validação de token: " + JSON.stringify(userTitlesResponse));
                }
            }
        } catch (error) {
            console.error("Erro ao tentar validar o token");
            throw error;
        }
    }

    async atualizarToken(authToken: AuthTokensResponse): Promise<void> {
        try {
            const updatedAuthorization = await exchangeRefreshTokenForAuthTokens(
                authToken.refreshToken
            );
            await AsyncStorage.setItem('authToken', JSON.stringify(updatedAuthorization));
            console.log("Token de usuário atualizado");

        } catch (error) {
            if ((error as Error).message.includes('There was a problem retrieving your PSN access code')) {
                console.error('Erro ao tentar realizar a autenticação do SSO na PSN ao renovar o token:', (error as Error).message);
                await AsyncStorage.removeItem('authToken');
            } else {
                console.error('Erro inesperado:', error);
            }

            throw new Error('Erro ao tentar fazer renovaçao do token');
        }

    }

    // async teste(sso: string) {
    //     //rthis.resgatarUrlDoGuia();
    //     try {
    //         await this.validarToken()//validando que o token esta valido e caso não esteja renovando o token
    //         let authorization = await AsyncStorage.getItem('authToken');

    //         if (!authorization) {
    //             await this.obterPsnAuthorization(sso);
    //             this.teste(sso);
    //         } else {
    //             console.log("este é o valor de tokenString = " + authorization);

    //             let authToken = JSON.parse(authorization);

    //             return this.obterPlaylists();
    //         }

    //     } catch (error) {
    //         console.error('falha ao construir as classes jogo e/ou troféu:', error);

    //         throw new Error('Erro:');
    //     }
    // }

}
export default UsuarioService;
