import levenshtein from 'fast-levenshtein';
import cheerio from 'cheerio';
import axios from 'axios';
import Jogo from '../models/jogoModel';
import { RecentlyPlayedGamesResponse, getUserTitles, UserTitlesResponse, getRecentlyPlayedGames } from 'psn-api';
import TrofeuService from './trofeuService';
import JogoRepository from '../repository/jogoRepository';

// Definir uma interface para o objeto closestMatch
interface GuiaResponse {
    title: string;
    author: string;
    views: string;
    url: string;
}
//caracteres especiais que as vezes fazem parte do nome do jogo mas também são pouluintes, como a separação do nome do jogo para
// o nome da versão do jogo, por exemplo "Mafia - definitive edition"
//outro exemplo é "Rocket league®", as vezes o caracter especial pode estar colado com alguma palavras no nome do jogo
const caracteresEspeciaisSujos = [
    ":", "®", "™", "℠", "-", "–", "_",
]
//palavras que geralmente são jogadas de forma alatoria no nome do produto, que atrapalham na hora de fazer buscas sobre guia e etc.
const palavrasSujas = [
    "bundle", "collection", "edition", "set", "compilation", "remaster", "remastered", "deluxe",
    "anthology", "ultimate", "season pass", "anniversary", "classic", "legacy", "gold", "enhanced",
    "hd", "playstation4", "warmastered", "definitive", "deathinitive", "trophy", "Trophy", "pack.", "Pack.", "pack",
    "trophies", "1/3", "2/3", "3/3", "complete", "console"
];
//frases que pode estar no titulo dos produtos mas que não necessáriamente são palavras do nome do jogo, pode ser um indicativo da versão
//do produto ou erro de desenvolvedora na hora de registrar no banco da sony
const frasesSujas = [
    "ultimate edition", "game of the year", "special edition", "the game", "the complete edition", "the definitive edition", "single player", "return to arkham",
]

const palavrasIndicadorasDeBundle = [
    "bundle", "trilogy", "collection", "compilation",
];

class JogoService {
    private trofeuService: TrofeuService;
    private jogoRepository: JogoRepository;
    constructor() {
        this.trofeuService = new TrofeuService();
        this.jogoRepository = new JogoRepository();
    }

    limpaNomeJogo(nomeJogo: string, isBundle: boolean) {
        //separando o nome do jogo para comparar e limpar cada palavra
        const nomeJogoSeparado = nomeJogo.split(" ");
        let nomeJogoLimpo = '';

        if (isBundle) {

            for (let j = 0; j < nomeJogoSeparado.length; j++) {
                //limpeza de caracteres especiais
                for (let l = 0; l < caracteresEspeciaisSujos.length; l++) {
                    if (nomeJogoSeparado[j].includes(caracteresEspeciaisSujos[l])) {
                        //se a palavra que foi separada e esta sendo verificada é identica ao caracter especial
                        //faz o replace por um espaço vazio, se não acrescenta um espaço no lugar
                        //isto é para casos onde o caracter especial é colado com o nome do jogo, por exemplo:
                        //final fantasy type-0 HD = type 0 e não type0
                        //o replace não ocorre no else caso não seja encontrado o caracter
                        if (nomeJogoSeparado[j] == caracteresEspeciaisSujos[l]) {
                            nomeJogoSeparado[j] = nomeJogoSeparado[j].replace(caracteresEspeciaisSujos[l], "")
                        } else {
                            nomeJogoSeparado[j] = nomeJogoSeparado[j].replace(caracteresEspeciaisSujos[l], " ")
                        }
                    }
                }
            }

        } else {
            //limpando todas as frases sujas que possam estar nome completo do jogo
            for (let i = 0; i < frasesSujas.length; i++) {
                if (nomeJogo.includes(frasesSujas[i])) {
                    nomeJogo = nomeJogo.replace(frasesSujas[i], "");
                }
            }


            for (let j = 0; j < nomeJogoSeparado.length; j++) {

                //limpeza de palavras sujas
                for (let k = 0; k < palavrasSujas.length; k++) {
                    if (palavrasSujas[k] == nomeJogoSeparado[j]) {
                        nomeJogoSeparado[j] = nomeJogoSeparado[j].replace(palavrasSujas[k], "");
                    }
                }

                //limpeza de caracteres especiais
                for (let l = 0; l < caracteresEspeciaisSujos.length; l++) {
                    if (nomeJogoSeparado[j].includes(caracteresEspeciaisSujos[l])) {
                        //se a palavra que foi separada e esta sendo verificada é identica ao caracter especial
                        //faz o replace por um espaço vazio, se não acrescenta um espaço no lugar
                        //isto é para casos onde o caracter especial é colado com o nome do jogo, por exemplo:
                        //final fantasy type-0 HD = type 0 e não type0
                        if (nomeJogoSeparado[j] == caracteresEspeciaisSujos[l]) {
                            nomeJogoSeparado[j] = nomeJogoSeparado[j].replace(caracteresEspeciaisSujos[l], "")
                        } else {
                            nomeJogoSeparado[j] = nomeJogoSeparado[j].replace(caracteresEspeciaisSujos[l], " ")
                        }
                    }
                }

                //concatenação das palavras em uma var onde o nome do jogo está limpo
                if (nomeJogoLimpo != undefined) {
                    nomeJogoLimpo = nomeJogoLimpo + " " + nomeJogoSeparado[j]
                } else {
                    nomeJogoLimpo = nomeJogoSeparado[0];
                }
            }
        }


        // Faz as últimas limpezas e ajustes no nome
        return nomeJogoLimpo
            .replace(/\s\d+\/\d+$/, "") // Remove números finais no formato "X/Y"
            .replace(/\s{2,}/g, " ")    // Remove múltiplos espaços
            .replace("'", "'")          // Substitui apóstrofe
            .replace("’", "'")          // Substitui apóstrofe
            .trim();                    // Limpa os espaços que restaram
    }

    //funcão para organizar o nome de alguns jogos que vem mal estruturados e escritos na requisição da psn
    //NÃO PODE ser utilizado o lower case aqui pois essa função também é utilizada para cadastrar os nomes dos jogos no banco
    //e ao ir para o banco precisa ser exatamente como a requisição tras ou alterado como no código abaixo
    //obs: talvez isso seja alterado futuramente
    organizarNomeJogo(nomeJogo: string): string {
        if (nomeJogo == "efootball2024") {
            nomeJogo = "efootball 2024"
        } else if (
            nomeJogo == "Minecraft: PlayStation®4 Edition" ||
            nomeJogo == "Minecraft: PlayStation®4 Edition Set 2" ||
            nomeJogo == "Minecraft PlayStation 4 Edition" ||
            nomeJogo == "Minecraft PlayStation 4 Edition  2") {

            nomeJogo = "Minecraft"
        } else if (nomeJogo == "Skyrim") {
            nomeJogo = "Elder Scrolls V Skyrim"
        } else if (nomeJogo == "Endling" || nomeJogo == "endling") {
            nomeJogo = nomeJogo.replace("Endling", "Endling extinction is forever");
            nomeJogo = nomeJogo.replace("endling", "Endling extinction is forever").toLocaleLowerCase();
        } else if (nomeJogo == "GTA IV") {
            nomeJogo = nomeJogo.replace("GTA IV", "Grand Theft Auto IV");
        } else if (nomeJogo == "batman") {
            nomeJogo = nomeJogo.replace("Batman", "Batman The Telltale Series");
        } else if (nomeJogo == "How to Survive ゾンビアイランド2" || nomeJogo == "how to survive ゾンビアイランド2") {
            nomeJogo = nomeJogo.replace("How to Survive ゾンビアイランド2", "How to Survive 2");
            nomeJogo = nomeJogo.replace("how to survive ゾンビアイランド2", "How to Survive 2");
        } else if (nomeJogo.includes("PvZ Garden Warfare")) {
            nomeJogo = nomeJogo.replace("PvZ Garden Warfare", "Plants vs. Zombies Garden Warfare");
        } else if (nomeJogo == "DIRT5") {
            nomeJogo = nomeJogo.replace("DIRT5", "Dirt 5");
        } else if (nomeJogo == "SOULCALIBUR Ⅵ") {
            nomeJogo = nomeJogo.replace("SOULCALIBUR Ⅵ", "Soulcalibur VI");
        } else if (nomeJogo == "[PROTOTYPE 2]" || nomeJogo == "[prototype 2]") {
            nomeJogo = nomeJogo.replace("[PROTOTYPE 2]", "Prototype 2");
            nomeJogo = nomeJogo.replace("[prototype 2]", "Prototype 2");
        } else if (nomeJogo == "SUPER STREET FIGHTER Ⅳ") {
            nomeJogo = nomeJogo.replace("[PROTOTYPE 2]", "Prototype 2");
        } else if (nomeJogo == "KINGDOM HEARTS Birth by Sleep FINAL MIX" || nomeJogo == "kingdom hearts birth by sleep final mix") {
            nomeJogo = nomeJogo.replace("KINGDOM HEARTS Birth by Sleep FINAL MIX", "KINGDOM HEARTS Birth by Sleep");
            nomeJogo = nomeJogo.replace("kingdom hearts birth by sleep final mix", "kingdom hearts birth by sleep");
        } else if (nomeJogo == "DCUO") {
            nomeJogo = "DC Universe Online";
        } else if (nomeJogo == "Wolverine") {
            nomeJogo = "X Men Origins Wolverine"
        } else if (nomeJogo == "HUMANITY Pack.") {
            nomeJogo = "HUMANITY"
        }

        return nomeJogo;
    }

    async verificarJogoNoFirebase(nomeJogo: string): Promise<boolean> {
        try {
            let jogoExiste = await this.jogoRepository.buscaJogoNoBanco(nomeJogo);
            if (jogoExiste) {
                console.log('Jogo encontrando no banco');
                return true;
            } else {
                console.log('Jogo não existe no banco ainda');
                return false;
            }
        } catch (error) {
            console.error('Erro ao verificar e inserir jogo: ', error);
            throw error;
        }
    }


    async resgatarUrlDoGuia(): Promise<string | undefined> {
        try {
            const gameTitle = "minecraft legends" + " trophy guide";
            const queryUrlToGetGuide = "https://psnprofiles.com/search/guides?q=" + gameTitle;

            console.log("url final da pesquisa:" + queryUrlToGetGuide);
            const response = await axios.get(queryUrlToGetGuide);
            const html = response.data;
            const $ = cheerio.load(html);

            let closestMatch: GuiaResponse | null = null; // Usar a interface GuideMatch
            let smallestDistance = Infinity;

            $('.guide-page-info').each((i, element) => {
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
                const match: GuiaResponse = closestMatch;

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

    // async obterNpwrJogos(gameSerialId: string): Promise<string[]> {
    //     try {
    //         console.log("valor recebido no obterNpwrJogos: " + gameSerialId)
    //         // Dividir a string usando o caractere de sublinhado
    //         const [prefixo] = gameSerialId.split('_');
    //         // Dividir o prefixo em letras e números
    //         const serialRegionMatch = prefixo.match(/[A-Za-z]+/);
    //         const serialNumberMatch = prefixo.match(/\d+/);

    //         if (serialRegionMatch && serialNumberMatch) {
    //             const serialRegion = serialRegionMatch[0]; // Captura a parte alfabética
    //             const serialNumber = serialNumberMatch[0]; // Captura a parte numérica


    //             const queryUrlToGetGuide = `https://serialstation.com/titles/${serialRegion}/${serialNumber}`;
    //             console.log("URL final da pesquisa:", queryUrlToGetGuide);
    //             // Faz a requisição HTTP para obter o HTML da página
    //             const response = await axios.get(queryUrlToGetGuide);
    //             const html = response.data;
    //             const $: CheerioAPI = cheerio.load(html);

    //             // Seleciona todos os links de troféus
    //             const trophyLinks = $('dt:contains("Trophies")').next('dd').find('a');

    //             // Extrai todos os valores NPWR dos links
    //             const trophies = trophyLinks.map((i, el) => $(el).text().trim()).get();

    //             console.log(`lista de troféus encontrados: ${trophies.length}`);
    //             console.log("Exibindo npwr " + trophies);

    //             return trophies;
    //         } else {
    //             console.log("Algo deu errado na divisão da variavel gameSerial" + prefixo)
    //         }
    //         return [];
    //     } catch (error) {
    //         console.error('Erro ao obter NPWR dos Jogos:', error);
    //         throw error;
    //     }

    // }
    async obterJogadosRecentemente(authToken: any): Promise<RecentlyPlayedGamesResponse | undefined> {
        try {
            const response = await getRecentlyPlayedGames(authToken, {
                limit: 10,
                categories: ["ps4_game", "ps5_native_game"]
            });
            // console.log("Exibindo jogados recentemente" + JSON.stringify(response));
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

            if (await this.verificarJogoNoFirebase(jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].name) == false) {

                //precisa ser definido antes os trofeús do jogo para poder preencher corretamente a classe jogo
                let trofeus = await this.trofeuService.obterTrofeusPeloNpwr(npwr);

                const jogo = new Jogo(
                    jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].name,
                    jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].platform,
                    10,//tempo para platinar, coloquei um tempo aleatorio por não ter no momento como pegar o tempo real
                    [],
                    jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].image.url,
                    false,
                    jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].titleId,
                    trofeus,
                    "URL DO GUIA DE TROFÈUS",//url do guia de trofeus
                    0,//dificuldade
                    0,//progresso PRECISO VALIDAR COMO RECEBER O PROGRESSO AQUI POIS ELE ESTA DISPONIVEL NA LISTA COMPLETA DE JOGOS
                    npwr,
                );

                await this.jogoRepository.inserirJogoNoBanco(jogo);
                return jogo;
            }

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
            if (await this.verificarJogoNoFirebase(jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].name) == false) {
                const jogo = new Jogo(
                    jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].name,
                    jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].platform,
                    10,//tempo para platinar, coloquei um tempo aleatorio
                    [],
                    jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].image.url,
                    false,
                    jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].titleId,
                    [],
                    "",//url do guia de trofeus
                    0,//dificuldade
                    1,//progresso PRECISO VALIDAR COMO RECEBER O PROGRESSO AQUI POIS ELE ESTA DISPONIVEL NA LISTA COMPLETA DE JOGOS
                    "Nao encontrado",
                );

                await this.jogoRepository.inserirJogoNoBanco(jogo);
                return jogo;
            }
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

            if (await this.verificarJogoNoFirebase(jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].name) == false) {
                for (let j = 0; j < jogosNpwr.length; j++) {
                    for (let c = 0; c < todosJogosResponse.totalItemCount; c++) {
                        //se for encontrado um jogo na lista completa com o mesmo id do bundle, será criado uma instancia
                        //do jogo para posteriormente inserir no banco
                        if (todosJogosResponse.trophyTitles[c].npCommunicationId.replace(/^NPWR(\d{5}).*/, 'NPWR-$1').includes(jogosNpwr[j])) {

                            let trofeus = await this.trofeuService.obterTrofeusPeloNpwr(todosJogosResponse.trophyTitles[c].npCommunicationId);
                            const jogo = new Jogo(
                                todosJogosResponse.trophyTitles[c].trophyTitleName,
                                todosJogosResponse.trophyTitles[c].trophyTitlePlatform,
                                10,//tempo para platinar, coloquei um tempo aleatorio
                                [],
                                todosJogosResponse.trophyTitles[c].trophyTitleIconUrl,
                                false,
                                "",
                                trofeus,
                                "",//url do guia de trofeus
                                0,//dificuldade
                                todosJogosResponse.trophyTitles[c].progress,//progresso
                                jogosNpwr[j],
                            );

                            if (await this.verificarJogoNoFirebase(todosJogosResponse.trophyTitles[c].trophyTitleName) == false) {
                                await this.jogoRepository.inserirJogoNoBanco(jogo);
                            }
                            jogosBundle.push(jogo);
                        }
                    }
                }
            }

            //criando o jogo do tipo Bundle, com os jogos que pertecem ao bundle, cada jogo contendo a lista de troféus
            const bundle = new Jogo(
                jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].name,
                jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].platform,
                10,//tempo para platinar, coloquei um tempo aleatorio
                [],
                jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].image.url,
                true,
                titleId,
                jogosBundle,
            );
            await this.jogoRepository.inserirBundleNoBanco(bundle);

            return bundle;

        } catch (error) {
            console.error(error);
            return undefined;
        }
    }

}


export default JogoService;