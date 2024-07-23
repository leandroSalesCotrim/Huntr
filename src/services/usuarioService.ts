// user.service.ts

import axios from 'axios';
import { exchangeNpssoForCode, getRecentlyPlayedGames, exchangeCodeForAccessToken, getUserTitles, getTitleTrophies, getUserTrophiesEarnedForTitle, exchangeRefreshTokenForAuthTokens, AuthTokensResponse, UserTitlesResponse } from 'psn-api';
import Usuario from '../models/usuarioModel';
import Jogo from '../models/jogoModel';
import Playlist from '../models/playlistModel';
import Trofeu from '../models/trofeuModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import cheerio, { CheerioAPI, Element as CheerioElement } from 'cheerio';
import levenshtein from 'fast-levenshtein';
// Definir uma interface para o objeto closestMatch
interface GuideMatch {
    title: string;
    author: string;
    views: string;
    url: string;
}

class UsuarioService {


    async resgatarUrlDoGuia(): Promise<string | null> {
        const gameTitle = "minecraft legends" + " trophy guide";
        const queryUrlToGetGuide = "https://psnprofiles.com/search/guides?q=" + gameTitle;
        console.log("url final da pesquisa:" + queryUrlToGetGuide);

        try {
            const response = await axios.get(queryUrlToGetGuide);
            const html = response.data;
            const $: CheerioAPI = cheerio.load(html);

            let closestMatch: GuideMatch | null = null; // Usar a interface GuideMatch
            let smallestDistance = Infinity;

            $('.guide-page-info').each((i: number, element: CheerioElement) => {
                const title = $(element).find('h3.ellipsis span').text().trim();
                const distance = levenshtein.get(gameTitle.toLowerCase(), title.toLowerCase());

                if (distance < smallestDistance) {
                    smallestDistance = distance;
                    closestMatch = {
                        title,
                        author: $(element).find('.author.ellipsis').text().trim(),
                        views: $(element).find('.stats .col-xs-4.stat').last().text().trim(),
                        url: $(element).find('a').attr('href') || '' // Adicionar fallback para string vazia
                    };
                }
            });

            if (closestMatch !== null) { // Verificação explícita de nulidade
                // Type assertion para garantir que closestMatch é do tipo GuideMatch
                const match: GuideMatch = closestMatch;

                console.log(`Closest match to ${gameTitle}: ${match.title}`);
                console.log(`Author: ${match.author}`);
                console.log(`Views: ${match.views}`);
                console.log(`URL: ${match.url}`);

                return match.url;
            }

            return null;
        } catch (error) {
            console.error('Erro ao resgatar a URL do Guia:', error);
            return null;
        }
    }


    async criarConta(usuario: string, senha: string,) {
    }
    async login(usuario: string, senha: string) {
    }
    async logout(idUsuario: number) {
    }

    async obterPsnAuthorization(sso: string) {
        try {
            console.log(sso);

            let accessCode = await exchangeNpssoForCode(sso);
            console.log(accessCode);

            let authorization = await exchangeCodeForAccessToken(accessCode);
            console.log(authorization);

            await AsyncStorage.setItem('authToken', JSON.stringify(authorization));

        } catch (error) {
            if ((error as Error).message.includes('There was a problem retrieving your PSN access code')) {
                console.error('Erro ao tentar realizar a autenticação do SSO na PSN:', (error as Error).message);
                await AsyncStorage.removeItem('authToken');
            } else {
                console.error('Erro inesperado:', error);
            }

            throw new Error('Erro ao tentar fazer requisição');
        }
    }
    async validarToken() {
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
                this.atualizarToken(authToken);
            } else if ('trophyTitles' in userTitlesResponse) {
                console.log("Requisição realizada com sucesso. Token valido!");
                console.log("Retorno da validação de token: " + JSON.stringify(userTitlesResponse));
            }
        }


        return true;
    }

    async atualizarToken(authToken: AuthTokensResponse) {
        try {
            const updatedAuthorization = await exchangeRefreshTokenForAuthTokens(
                authToken.refreshToken
            );
            await AsyncStorage.setItem('authToken', JSON.stringify(updatedAuthorization));
            console.log("Token de usuário atualizado");

        } catch (error) {
            if ((error as Error).message.includes('There was a problem retrieving your PSN access code')) {
                console.error('Erro ao tentar realizar a autenticação do SSO na PSN:', (error as Error).message);
                await AsyncStorage.removeItem('authToken');
            } else {
                console.error('Erro inesperado:', error);
            }

            throw new Error('Erro ao tentar fazer renovaçao do token');
        }

    }
    // async isBundle(gameSerialId: string): Promise<boolean> {
    //     //coloquei CUSA pois é a identificação utilizada nos jogos da américa do sul, porém para maior acessibilidade seria interessante
    //     //criar um separador que recebe o serial completo e após receber divide corretamente o serial para a url
    //     const queryUrlToGetGuide = "https://serialstation.com/titles/CUSA/" + gameSerialId;
    //     console.log("url final da pesquisa:" + queryUrlToGetGuide);

    //     try {
    //         const response = await axios.get(queryUrlToGetGuide);
    //         const html = response.data;
    //         const $: CheerioAPI = cheerio.load(html);

    //         // Seleciona a seção de Trophies
    //         const trophyLinks = $('dt:contains("Trophies")').next('dd').find('a');
    //         const npwrCount = trophyLinks.length;

    //         console.log(`Number of NPWR values found: ${npwrCount}`);

    //         // Retorna true se houver mais de um valor NPWR
    //         return npwrCount > 1;
    //     } catch (error) {
    //         console.error('Erro:', error);
    //         return false;
    //     }
    // }
    async obterNpwrJogos(gameSerialId: string): Promise<string[]> {
        console.log("valor recebido no obterNpwrJogos: " + gameSerialId)
        // Dividir a string usando o caractere de sublinhado
        const [prefixo] = gameSerialId.split('_');
        console.log(prefixo)
        // Dividir o prefixo em letras e números
        const serialRegionMatch = prefixo.match(/[A-Za-z]+/);
        const serialNumberMatch = prefixo.match(/\d+/);
        
        if (serialRegionMatch && serialNumberMatch) {
            const serialRegion = serialRegionMatch[0]; // Captura a parte alfabética
            const serialNumber = serialNumberMatch[0]; // Captura a parte numérica


            const queryUrlToGetGuide = `https://serialstation.com/titles/${serialRegion}/${serialNumber}`;
            console.log("URL final da pesquisa:", queryUrlToGetGuide);

            try {
                // Faz a requisição HTTP para obter o HTML da página
                const response = await axios.get(queryUrlToGetGuide);
                const html = response.data;
                const $: CheerioAPI = cheerio.load(html);

                // Seleciona todos os links de troféus
                const trophyLinks = $('dt:contains("Trophies")').next('dd').find('a');

                // Extrai todos os valores NPWR dos links
                const trophies = trophyLinks.map((i, el) => $(el).text().trim()).get();

                console.log(`lista de troféus encontrados: ${trophies.length}`);
                console.log("Exibindo npwr " + trophies);

                // Se precisar retornar uma lista de objetos Jogo
                // Aqui você precisa construir a lógica para criar instâncias de Jogo
                // Exemplo: return trophies.map(trophy => new Jogo(/* parâmetros necessários */));

                // Exemplo simplificado retornando apenas os troféus
                return trophies;
            } catch (error) {
                console.error('Erro obter NPWR dos Jogos:', error);
                return [];
            }
        } else {
            console.log("Algo deu errado na divisão da variavel gameSerial" + prefixo)
        }
        return [""];
    }


    async listarPlaylists() {
    }
    async obterPlaylists(): Promise<Playlist[] | undefined> {
        console.log("Chegou no Obter Playlists");
        let playlists: Array<Playlist> = [];

        try {
            const playlistsJSON = await AsyncStorage.getItem('playlists');

            // se ja tiver dados das playlists ja definidos no cache, então resgata do cache e retorna as playlists
            if (playlistsJSON) {
                const parsedArray = JSON.parse(playlistsJSON);
                // Certifique-se de que o vetor contém objetos Playlist
                playlists = parsedArray.map((item: any) =>
                    new Playlist(
                        item.categoria,
                        item.plataforma,
                        item.jogos,
                        item.idUsuario
                    )
                );
                console.log("Foi encontrado uma playlist")
            } else {
                // se não tiver dados em cache, será criado novas playlists, que posteriormente serão enviadas ao banco
                const categorias: string[] = ["Para platinar", "Platinados", "Jogados recentemente"]
                let jogosRecentesResponse = await this.obterJogadosRecentemente();
                let jogosPlaylist: Jogo[] = [];

                if (jogosRecentesResponse) {
                    console.log("jogosRecentes retornou valor")

                    for (let i = 0; i < jogosRecentesResponse.data.gameLibraryTitlesRetrieve.games.length; i++) {
                        let titleId = JSON.stringify(jogosRecentesResponse.data.gameLibraryTitlesRetrieve.games[i].titleId);
                        //obtendo todos NPWR (id do jogo) que fazem parte do bundle/jogo encontrado, ou seja, os jogos de uma coleção 
                        //se retornar mais 1 npwr na função, é bundle, pois cada npwr pertence a um jogo diferente
                        let jogosNpwr: string[] = await this.obterNpwrJogos(titleId);

                        console.log("verificando se jogosNprwr é maior que 1");
                        if (jogosNpwr.length > 1) {
                            console.log("jogosNprwr maior que 1");

                            //para cada id encontrado dentro do bundle será realizado uma consulta dentro da lista de jogos do jogador
                            //para encontrar as informações necessárias para a criação da classe
                            const jogosBundle: Array<Jogo> = []

                            for (let j = 0; j < jogosNpwr.length; j++) {

                                //obtendo a lista com todos os jogos do jogador
                                const todosJogos = await this.obterTodosJogos();
                                console.log("Exibindo todos os jogos: " + JSON.stringify(todosJogos));
                                if (todosJogos) {
                                    for (let c = 0; c < todosJogos.totalItemCount; c++) {
                                        //se for encontrado um jogo na lista completa com o mesmo id do bundle, será criado uma instancia
                                        //do jogo para posteriormente inserir
                                        if (todosJogos.trophyTitles[c].npCommunicationId.replace(/^NPWR(\d{5}).*/, 'NPWR-$1').includes(jogosNpwr[j])) {

                                            console.log("Jogos encontrado na lista completa: " + todosJogos.trophyTitles[c].trophyTitleName);
                                            console.log("Jogos comparado: " + jogosRecentesResponse.data.gameLibraryTitlesRetrieve.games[i].name);
                                            console.log("\n");
                                            console.log("\n");
                                            console.log("\n");
                                            console.log("\n");
                                            console.log("\n");
                                            //precisa ser definido antes os trofeús do jogo para poder preenhcer corretamente a classe jogo

                                            console.log("Enviando este valor:" + todosJogos.trophyTitles[c].npCommunicationId)
                                            let trofeus = await this.obterTrofeusPeloNpwr(todosJogos.trophyTitles[c].npCommunicationId);
                                            console.log("Resultado da PSN API dos troféus do jogo com npw" + JSON.stringify(trofeus))
                                            const jogo = new Jogo(
                                                todosJogos.trophyTitles[c].trophyTitleName,
                                                10,//tempo para platinar, coloquei um tempo aleatorio
                                                todosJogos.trophyTitles[c].trophyTitleIconUrl,
                                                false,
                                                titleId,
                                                trofeus,
                                                "",//url do guia de trofeus
                                                0,//dificuldade
                                                1,//progresso
                                                jogosNpwr[j],
                                            );

                                            //inserindo na lista o jogo encontrado
                                            jogosBundle.push(jogo);
                                            console.log("Este é o valor de jogosBundel agora:" + JSON.stringify(jogosBundle))
                                        }

                                    }
                                }
                            }


                            //criando o jogo do tipo Bundle, com os jogos que pertecem ao bundle, cada jogo contendo a lista de troféus
                            const jogo = new Jogo(
                                jogosRecentesResponse.data.gameLibraryTitlesRetrieve.games[i].name,
                                10,//tempo para platinar, coloquei um tempo aleatorio
                                jogosRecentesResponse.data.gameLibraryTitlesRetrieve.games[i].image.url,
                                true,
                                titleId,
                                jogosBundle,
                            );
                            //imprimindo o bundle com os jogos e troféus respectivos
                            console.log("Jogo Encontrado: " + jogo)
                            jogosPlaylist.push(jogo);

                        } else {

                            //obtendo a lista com todos os jogos do jogador
                            const todosJogos = await this.obterTodosJogos();
                            if (todosJogos) {
                                for (let c = 0; c < todosJogos.totalItemCount; c++) {
                                    //se for encontrado um jogo na lista completa com o mesmo id do jogo, será criado uma instancia
                                    //do jogo para posteriormente inserir no banco
                                    if (todosJogos.trophyTitles[c].npCommunicationId.replace(/^NPWR(\d{5}).*/, 'NPWR-$1') == jogosNpwr[0]) {

                                        //precisa ser definido antes os trofeús do jogo para poder preencher corretamente a classe jogo
                                        let trofeus = await this.obterTrofeusPeloNpwr(todosJogos.trophyTitles[c].npCommunicationId);

                                        const jogo = new Jogo(
                                            jogosRecentesResponse.data.gameLibraryTitlesRetrieve.games[c].name,
                                            10,//tempo para platinar, coloquei um tempo aleatorio
                                            jogosRecentesResponse.data.gameLibraryTitlesRetrieve.games[c].image.url,
                                            false,
                                            titleId,
                                            trofeus,
                                            "",//url do guia de trofeus
                                            0,//dificuldade
                                            1,//progresso
                                            jogosNpwr[0],
                                        );

                                        //imprimindo o jogo com seus troféus respectivos
                                        jogosPlaylist.push(jogo);
                                        console.log("Este é o valor de jogosPlaylist: " + JSON.stringify(jogosPlaylist));
                                    }

                                }
                            }
                        }
                    }
                }


                if (jogosRecentesResponse) {
                    categorias.forEach(categoria => {
                        const playlist = new Playlist(
                            categoria,
                            "Playstation",
                            jogosPlaylist,
                            1
                        );
                        playlists.push(playlist);
                    });
                }
                return playlists;

            }
        } catch (error) {
            console.error('Erro ao definir playlists:', error);
        }

        // Aqui você pode fazer algo com a variável playlists
        console.log("Exibindo a playlist dentro da função" + playlists);
    }

    async reorganizarPlaylist() {
    }
    async abrirJogoDaPlaylist(idJogo: string) {
    }
    async adicionarJogoNaPlaylist(idJogo: string) {
    }
    async removerJogoDaPlaylist(idJogo: string) {
    }
    async obterTrofeusPeloNpwr(npwr: string): Promise<Trofeu[]> {
        try {
            let authorization = await AsyncStorage.getItem('authToken');
            const trofeus: Array<Trofeu> = []
            if (authorization) {
                let authToken = JSON.parse(authorization);
                const titleTrophys = await getTitleTrophies(authToken, npwr, "all", {
                    npServiceName: "trophy"
                });

                const titleTrophys2 = await getUserTrophiesEarnedForTitle(
                    authToken,
                    "me",
                    npwr,
                    "all",
                    { npServiceName: "trophy" }
                );

                for (let i = 0; i < titleTrophys.totalItemCount; i++) {

                    const trofeu = new Trofeu(
                        titleTrophys.trophies[i].trophyId,
                        String(titleTrophys.trophies[i].trophyName),
                        String(titleTrophys.trophies[i].trophyDetail),
                        "blablablandanwdnawdauw8dnawu9dnabwd9udbnwu9dnaiuwnw",
                        titleTrophys.trophies[i].trophyType,
                        titleTrophys.trophies[i].trophyHidden,
                        Boolean(titleTrophys2.trophies[i].earned),
                        Number(titleTrophys2.trophies[i].trophyEarnedRate),
                        Number(titleTrophys2.trophies[i].trophyRare),
                        String(titleTrophys.trophies[i].trophyIconUrl),
                        ["Story", "Buggy", "Example"],

                    )
                    trofeus.push(trofeu);

                }
            }
            return trofeus;
        } catch (error) {
            console.error('Falha ao buscar os trofeus na psn api', error);
            console.log("NPWR recebido:" + npwr);


            throw new Error('Erro:');
        }
    }

    // async obterIdJogoPorNome(nome: string) {
    //     let authorization = await AsyncStorage.getItem('authToken');
    //     if (authorization) {
    //         let authToken = JSON.parse(authorization);
    //         const response = await getUserTitles(
    //             { accessToken: authToken.accessToken },
    //             "me"
    //         );

    //         for (let i = 0; i < response.totalItemCount; i++) {
    //             if (response.trophyTitles[i].trophyTitleName == nome){

    //             }

    //           }
    //     }

    // }
    async obterJogadosRecentemente() {
        let authorization = await AsyncStorage.getItem('authToken');
        if (authorization) {
            let authToken = JSON.parse(authorization);

            const response = await getRecentlyPlayedGames(authToken, {
                limit: 5,
                categories: ["ps4_game", "ps5_native_game"]
            });
            console.log("Exibindo jogados recentemente" + JSON.stringify(response));
            return response;
        }

    }
    async obterTodosJogos() {
        let authorization = await AsyncStorage.getItem('authToken');
        if (authorization) {
            let authToken = JSON.parse(authorization);
            // This returns a list of all the games you've earned trophies for.
            const response = await getUserTitles(
                { accessToken: authToken.accessToken },
                "me",
                {
                    limit: 800
                }
            );

            return response;
        }

    }




    async teste(sso: string) {
        //rthis.resgatarUrlDoGuia();
        try {
            await this.validarToken()//validando que o token esta valido e caso não esteja renovando o token

            let authorization = await AsyncStorage.getItem('authToken');

            if (!authorization) {
                await this.obterPsnAuthorization(sso);
                this.teste(sso);

            } else {
                console.log("este é o valor de tokenString = " + authorization);

                let authToken = JSON.parse(authorization);

                return this.obterPlaylists();


            }


        } catch (error) {
            console.error('falha ao construir as classes jogo e/ou troféu:', error);


            throw new Error('Erro:');
        }
    }

}
export default UsuarioService;
