import AsyncStorage from '@react-native-async-storage/async-storage';
import Trofeu from '../models/trofeuModel';
import { UserTrophiesEarnedForTitleResponse, TitleTrophiesResponse, getTitleTrophies, getUserTrophiesEarnedForTitle } from 'psn-api';


class TrofeuService {

    async obterTrofeusPeloNpwr(npwr: string): Promise<Trofeu[]> {
        try {
            let authorization = await AsyncStorage.getItem('authToken');
            const trofeus: Array<Trofeu> = []
            if (authorization) {
                let authToken = JSON.parse(authorization);

                let titleTrophys = await this.obterInformacoesTrofeusDoJogo(npwr, authToken);
                let titleTrophysUser = await this.obterInformacoesTrofeusDoJogoUsuario(npwr, authToken);

                if (titleTrophys && titleTrophysUser) {
                    for (let i = 0; i < titleTrophys.totalItemCount; i++) {

                        const trofeu = new Trofeu(
                            titleTrophys.trophies[i].trophyId,
                            String(titleTrophys.trophies[i].trophyName),
                            String(titleTrophys.trophies[i].trophyDetail),
                            "Guia url",
                            titleTrophys.trophies[i].trophyType,
                            titleTrophys.trophies[i].trophyHidden,
                            String(titleTrophys.trophies[i].trophyIconUrl),
                            [],
                            Boolean(titleTrophysUser.trophies[i].earned),
                            String(titleTrophysUser.trophies[i].earnedDateTime),
                            Number(titleTrophysUser.trophies[i].trophyEarnedRate),
                            Number(titleTrophysUser.trophies[i].trophyRare),

                        )
                        trofeus.push(trofeu);

                    }

                } else if (titleTrophys) {
                    for (let i = 0; i < titleTrophys.totalItemCount; i++) {

                        const trofeu = new Trofeu(
                            titleTrophys.trophies[i].trophyId,
                            String(titleTrophys.trophies[i].trophyName),
                            String(titleTrophys.trophies[i].trophyDetail),
                            "Guia url",
                            titleTrophys.trophies[i].trophyType,
                            titleTrophys.trophies[i].trophyHidden,
                            String(titleTrophys.trophies[i].trophyIconUrl),
                            [],
                        )
                        trofeus.push(trofeu);

                    }
                } else {
                    console.error("Não foi possivel criar a lista de troféus");
                }

            }
            return trofeus;
        } catch (error) {
            console.error('Falha ao buscar os trofeus na psn api', error);
            console.log("NPWR recebido:" + npwr);
            throw new Error('Erro:');
        }
    }

    //Esta função obtem as informações dos troféus de um jogo resgatando pelo npwr
    async obterInformacoesTrofeusDoJogo(npwr: string, authToken: any): Promise<TitleTrophiesResponse | undefined> {
        try {
            const storedLanguageTag = JSON.stringify(await AsyncStorage.getItem('languageTag')).replaceAll('"','');
            let idioma: string = "en-us";

            if (storedLanguageTag.length == 5) {
                idioma = storedLanguageTag;
            }

            const titleTrophys = await getTitleTrophies(
                authToken,
                npwr,
                "all",
                {
                    npServiceName: "trophy",
                    headerOverrides: { "Accept-Language": idioma }
                });
            return titleTrophys;

        } catch (error) {
            console.log("Erro ao obter informações dos trofeus obtidos do titulo");
            throw error;
        }

    }

    //Esta função também obtem as informações dos troféus de um jogo resgatando pelo npwr, porém ele trás as informações
    //baseadas no usuário que esta resgatando, podendo obter informações como a taxa de conquista, se já foi obtido o trofeu e etc.
    async obterInformacoesTrofeusDoJogoUsuario(npwr: string, authToken: any): Promise<UserTrophiesEarnedForTitleResponse | undefined> {
        try {
            const storedLanguageTag = JSON.stringify(await AsyncStorage.getItem('languageTag'));
            let idioma: string = "en-us";

            if (storedLanguageTag.length == 5) {
                idioma = storedLanguageTag;
            }

            const titleTrophysUser = await getUserTrophiesEarnedForTitle(
                authToken,
                "me",
                npwr,
                "all",
                {
                    npServiceName: "trophy",
                    headerOverrides: { "Accept-Language": idioma }

                }
            );
            return titleTrophysUser

        } catch (error) {
            console.log("Erro ao obter informações dos trofeus obtidos do usuário");
            throw error;
        }
    }

}
export default TrofeuService;