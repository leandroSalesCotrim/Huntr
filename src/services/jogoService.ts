import levenshtein from 'fast-levenshtein';
import cheerio, { CheerioAPI, Element as CheerioElement } from 'cheerio';
import axios from 'axios';
import Jogo from '../models/jogoModel';
import { RecentlyPlayedGamesResponse, getUserTitles, UserTitlesResponse, getRecentlyPlayedGames } from 'psn-api';
import TrofeuService from './trofeuService';


// Definir uma interface para o objeto closestMatch
interface GuideMatch {
    title: string;
    author: string;
    views: string;
    url: string;
}

class JogoService {
    private trofeuService: TrofeuService;
    constructor() {
        this.trofeuService = new TrofeuService();
    }

    async resgatarUrlDoGuia(): Promise<string | undefined> {
        try {
            const gameTitle = "minecraft legends" + " trophy guide";
            const queryUrlToGetGuide = "https://psnprofiles.com/search/guides?q=" + gameTitle;

            console.log("url final da pesquisa:" + queryUrlToGetGuide);
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

            return undefined;
        } catch (error) {
            console.error('Erro ao resgatar a URL do Guia');
            throw error;
        }
    }

    async obterNpwrJogos(gameSerialId: string): Promise<string[]> {
        try {
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

                return trophies;
            } else {
                console.log("Algo deu errado na divisão da variavel gameSerial" + prefixo)
            }
            return [];
        } catch (error) {
            console.error('Erro obter NPWR dos Jogos:', error);
            throw error;
        }

    }
    async obterJogadosRecentemente(authToken: any): Promise<RecentlyPlayedGamesResponse | undefined> {
        try {
            const response = await getRecentlyPlayedGames(authToken, {
                limit: 5,
                categories: ["ps4_game", "ps5_native_game"]
            });
            console.log("Exibindo jogados recentemente" + JSON.stringify(response));
            return response;
        } catch (error) {
            console.error("Erro ao tentar obter jogados recentemente");
            throw error;
        }

    }

    async obterTodosJogos(authToken: any): Promise<UserTitlesResponse | undefined> {
        try {
            // This returns a list of all the games you've earned trophies for.
            const response = await getUserTitles(
                { accessToken: authToken.accessToken },
                "me",
                {
                    limit: 800
                }
            );

            return response;
        } catch (error) {
            console.error('Erro ao obter todos os Jogos:', error);
            throw error;
        }

    }

    async criarJogoComTrofeus(
        jogadosRecentementeResponse: RecentlyPlayedGamesResponse,
        npwr: string,
        indexJogo: number
    ): Promise<Jogo | undefined> {
        try {
            //precisa ser definido antes os trofeús do jogo para poder preencher corretamente a classe jogo
            let trofeus = await this.trofeuService.obterTrofeusPeloNpwr(npwr);

            const jogo = new Jogo(
                jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].name,
                10,//tempo para platinar, coloquei um tempo aleatorio
                jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].image.url,
                false,
                jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].titleId,
                trofeus,
                "",//url do guia de trofeus
                0,//dificuldade
                1,//progresso PRECISO VALIDAR COMO RECEBER O PROGRESSO AQUI POIS ELE ESTA DISPONIVEL NA LISTA COMPLETA DE JOGOS
                npwr,
            );

            return jogo;
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }

    async criarJogoSemTrofeus(
        jogadosRecentementeResponse: RecentlyPlayedGamesResponse,
        indexJogo: number
    ): Promise<Jogo | undefined> {
        try {

            const jogo = new Jogo(
                jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].name,
                10,//tempo para platinar, coloquei um tempo aleatorio
                jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].image.url,
                false,
                jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].titleId,
                [],
                "",//url do guia de trofeus
                0,//dificuldade
                1,//progresso PRECISO VALIDAR COMO RECEBER O PROGRESSO AQUI POIS ELE ESTA DISPONIVEL NA LISTA COMPLETA DE JOGOS
                "Nao encontrado",
            );

            return jogo;
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }
    async criarBundleComJogosComTrofeus(
        jogadosRecentementeResponse: RecentlyPlayedGamesResponse,
        todosJogosResponse: UserTitlesResponse,
        jogosNpwr: string[],
        indexJogo: number,
        titleId: string
    ): Promise<Jogo | undefined> {
        try {
            // para cada id encontrado dentro do bundle será realizado uma consulta dentro da lista completa de jogos
            // do jogador na PSN para encontrar as informações necessárias para a criação da classe de Jogo e Trofeu
            const jogosBundle: Array<Jogo> = [];

            for (let j = 0; j < jogosNpwr.length; j++) {
                for (let c = 0; c < todosJogosResponse.totalItemCount; c++) {
                    //se for encontrado um jogo na lista completa com o mesmo id do bundle, será criado uma instancia
                    //do jogo para posteriormente inserir no banco
                    if (todosJogosResponse.trophyTitles[c].npCommunicationId.replace(/^NPWR(\d{5}).*/, 'NPWR-$1').includes(jogosNpwr[j])) {

                        let trofeus = await this.trofeuService.obterTrofeusPeloNpwr(todosJogosResponse.trophyTitles[c].npCommunicationId);
                        const jogo = new Jogo(
                            todosJogosResponse.trophyTitles[c].trophyTitleName,
                            10,//tempo para platinar, coloquei um tempo aleatorio
                            todosJogosResponse.trophyTitles[c].trophyTitleIconUrl,
                            false,
                            titleId,
                            trofeus,
                            "",//url do guia de trofeus
                            0,//dificuldade
                            todosJogosResponse.trophyTitles[c].progress,//progresso
                            jogosNpwr[j],
                        );

                        jogosBundle.push(jogo);
                    }

                }
            }

            //criando o jogo do tipo Bundle, com os jogos que pertecem ao bundle, cada jogo contendo a lista de troféus
            const jogo = new Jogo(
                jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].name,
                10,//tempo para platinar, coloquei um tempo aleatorio
                jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].image.url,
                true,
                titleId,
                jogosBundle,
            );

            return jogo;

        } catch (error) {
            console.error(error);
            return undefined;
        }
    }
}
export default JogoService;