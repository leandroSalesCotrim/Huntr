import { collection, getDocs, updateDoc, query, where, addDoc, doc, endAt, orderBy, startAt } from 'firebase/firestore';
import { db } from './src/database/firebaseConfig';
import Jogo from './src/models/jogoModel';
import cheerio from 'cheerio';
import levenshtein from 'fast-levenshtein';
import { TrophyTitle, getRecentlyPlayedGames, getUserTitles, UserTitlesResponse, RecentlyPlayedGamesResponse, TitleTrophiesResponse, UserTrophiesEarnedForTitleResponse, getTitleTrophies, getUserTrophiesEarnedForTitle, exchangeNpssoForCode, exchangeCodeForAccessToken, AuthTokensResponse, } from "psn-api";
import Trofeu from './src/models/trofeuModel';
import axios from 'axios';
import { exchangeRefreshTokenForAuthTokens } from "psn-api";



let auth: any;

// Definir uma interface para o objeto closestMatch
interface GuiaResponse {
    title: string;
    author: string;
    views: number;
    url: string;
}
interface TrofeuData {
    idTrofeu: number;
    nome: string;
    descricao: string;
    guia: string;
    tipo: string;
    oculto: boolean;
    taxaConquistado: number;
    raridade: number;
    iconeUrl: string;
    tags: string[];
}

interface JogoData {
    nome: string;
    plataforma: string;
    tempoParaPlatinar: number;
    iconeUrl: string;
    bundle: boolean;
    serialJogo: string;
    trofeus: TrofeuData[];
    guiaUrl?: string;
    dificuldade?: number;
    npwr?: string;
}
interface BundleData {
    nome: string;
    plataforma: string;
    iconeUrl: string;
    tempoParaPlatinar: number;
    bundle: boolean;
    serialJogo: string;
    jogos?: JogoData[]; // Para jogos dentro de um bundle
}
interface PlaystationStoreJogoResponse {
    urlPage: string;
    descricao: string;
    urlImageJogo: string;
    serialJogo: string;
}
interface GuiaDataResponse {
    [trophyName: string]: GuiaData;
}
interface GuiaData {
    description: string;
    tags: string[]; // Ajuste o tipo se necessário, pode ser outro tipo de array ou objeto
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


async function obterPsnAuthorization(sso: string) {
    try {
        let accessCode = await exchangeNpssoForCode(sso);
        let authorization = await exchangeCodeForAccessToken(accessCode)
        return authorization;

    } catch (error) {
        if ((error as Error).message.includes('There was a problem retrieving your PSN access code')) {
            console.error('Erro ao tentar realizar a autenticação do SSO na PSN ao obter um novo token:', (error as Error).message);
        } else {
            console.error('Erro inesperado:', error);
        }
    }
}
async function atualizarToken(authToken: AuthTokensResponse): Promise<string | undefined> {
    try {
        const updatedAuthorization = await exchangeRefreshTokenForAuthTokens(
            authToken.refreshToken
        );
        return JSON.stringify(updatedAuthorization);

    } catch (error) {
        if ((error as Error).message.includes('There was a problem retrieving your PSN access code')) {
            console.error('Erro ao tentar realizar a renovação do SSO token:', (error as Error).message);
        } else {
            console.error('Erro inesperado:', error);
        }
    }

}
//função que apenas verifica se existe ou não um jogo com o nome informado e retorna um boolean
async function verificarJogoNoBanco(nomeJogo: string): Promise<boolean> {
    try {
        const collectionName = 'jogos';
        const jogosCollection = collection(db, collectionName);
        const q = query(jogosCollection, where('nome', '==', nomeJogo));
        const querySnapshot = await getDocs(q);

        return !querySnapshot.empty;
    } catch (error) {
        console.error('Erro ao verificar se o jogo existe: ', error);
        throw error;
    }
}

async function inserirJogoNoBanco(jogo: Jogo) {
    try {
        const collectionName = 'jogos';

        const trofeusArray = jogo.getTrofeus().map(trofeu => ({
            idTrofeu: trofeu.getIdTrofeu(),
            nome: trofeu.getNome(),
            descricao: trofeu.getDescricao(),
            tipo: trofeu.getTipo(),
            iconeUrl: trofeu.getIconeUrl(),
            guia: trofeu.getGuia(),
            oculto: trofeu.getOculto(),
            raridade: trofeu.getRaridade(),
            taxaConquistado: trofeu.getTaxaConquistado(),
            tags: trofeu.getTags(),
        }));

        const jogosCollection = collection(db, collectionName);
        await addDoc(jogosCollection, {
            npwr: jogo.getNpwr(),
            serialJogo: jogo.getSerialJogo(),
            nome: jogo.getNome(),
            nomeNormalizado: jogo.getNome().toLocaleLowerCase(),
            trofeus: trofeusArray,
            iconeUrl: jogo.getIconeUrl(),
            guiaUrl: jogo.getGuiaUrl(),
            plataforma: jogo.getPlataforma(),
            bundle: jogo.getBundle(),
            dificuldade: jogo.getDificuldade(),
            tempoParaPlatinar: jogo.getTempoParaPlatinar(),
        });
    } catch (error) {
        console.error('Erro ao inserir jogo: ', error);
        throw error;
    }
}

async function inserirBundleNoBanco(jogo: Jogo) {
    try {
        const collectionName = 'jogos';

        const jogosArray = jogo.getJogos().map(jogo => ({
            npwr: jogo.getNpwr(),
            serialJogo: jogo.getSerialJogo(),
            nome: jogo.getNome(),
            nomeNormalizado: jogo.getNome().toLocaleLowerCase(),
            iconeUrl: jogo.getIconeUrl(),
            guiaUrl: jogo.getGuiaUrl(),
            plataforma: jogo.getPlataforma(),
            dificuldade: jogo.getDificuldade(),
            tempoParaPlatinar: jogo.getTempoParaPlatinar(),
            trofeus: jogo.getTrofeus().map(trofeu => ({
                idTrofeu: trofeu.getIdTrofeu(),
                nome: trofeu.getNome(),
                descricao: trofeu.getDescricao(),
                tipo: trofeu.getTipo(),
                iconeUrl: trofeu.getIconeUrl(),
                guiaUrl: trofeu.getGuia(),
                oculto: trofeu.getOculto(),
                raridade: trofeu.getRaridade(),
                taxaConquistado: trofeu.getTaxaConquistado(),
                tags: trofeu.getTags(),
            }))
        }));

        const bundlesCollection = collection(db, collectionName);

        //somando total do tempo para platinar os jogos dentro do bundle
        let tempoTotalPlatina: number = 0;
        jogosArray.forEach(jogo => {
            tempoTotalPlatina += jogo.tempoParaPlatinar;
        });
        await addDoc(bundlesCollection, {
            serialJogo: jogo.getSerialJogo(),
            nome: jogo.getNome(),
            nomeNormalizado: jogo.getNome().toLocaleLowerCase(),
            iconeUrl: jogo.getIconeUrl(),
            bundle: jogo.getBundle(),
            tempoParaPlatinar: tempoTotalPlatina,
            jogos: jogosArray
        });

    } catch (error) {
        console.error('Erro ao inserir bundle: ', error);
        throw error;
    }
}

//função que utilizei para atualizar os dados no banco acrescentando um campo nome_normalizado onde o mesmo tem o valor
//do nome do jogo mas em lowercase, para facilitar as comparaçoes
async function normalizarNomes(): Promise<void> {
    try {
        const collectionName = 'jogos';
        const jogosCollection = collection(db, collectionName);

        // Pegar todos os documentos na coleção de jogos
        const querySnapshot = await getDocs(jogosCollection);

        // Iterar sobre cada documento
        querySnapshot.forEach(async (docSnapshot) => {
            const data = docSnapshot.data();

            if (data.nome) {
                const nomeNormalizado = data.nome.toLowerCase();  // Normalizar para minúsculas

                // Atualizar o documento com o nome normalizado
                await updateDoc(doc(db, collectionName, docSnapshot.id), {
                    nome_normalizado: nomeNormalizado
                });

                console.log(`Documento ${docSnapshot.id} atualizado com nome normalizado: ${nomeNormalizado}`);
            }
        });

        console.log('Processo de normalização concluído.');
    } catch (error) {
        console.error('Erro ao normalizar os nomes: ', error);
        throw error;
    }
}

//função que trás uma lista de jogos encontrado no banco com o nome informado
async function buscarJogosPorNome(nomeJogo: string): Promise<Jogo[] | undefined> {
    try {
        const collectionName = 'jogos';
        const jogosCollection = collection(db, collectionName);

        // Normalizar o nome do jogo para buscar sempre em minúsculas
        const nomeNormalizado = nomeJogo.toLowerCase();

        // Query usando o prefixo nome_normalizado com startAt() e endAt()
        const q = query(
            jogosCollection,
            orderBy('nome_normalizado'),  // Ordenar pela chave 'nome_normalizado'
            startAt(nomeNormalizado),     // Começar a partir do nome fornecido
            endAt(nomeNormalizado + '\uf8ff') // Finalizar no próximo valor mais alto
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            let jogosEncontrados: Jogo[] = [];
            querySnapshot.docs.forEach(querySnap => {
                let queryData = querySnap.data();
                if (queryData.bundle) {
                    const dataBundle = queryData as BundleData

                    // Convertendo os dados em uma instância da classe Trofeu
                    if (dataBundle.jogos) {
                        const jogosBundle: Array<Jogo> = [];

                        //foreach para cado jogo dentro do bundle
                        dataBundle.jogos.forEach(jogo => {
                            const trofeus = jogo.trofeus.map((trofeuData: TrofeuData) => new Trofeu(
                                trofeuData.idTrofeu,
                                trofeuData.nome,
                                trofeuData.descricao,
                                trofeuData.guia,
                                trofeuData.tipo,
                                trofeuData.oculto,
                                trofeuData.iconeUrl,
                                trofeuData.tags,
                                false,//campo "obtido", deve ser atualizado após ser resgatado 
                                trofeuData.taxaConquistado,
                                trofeuData.raridade
                            ));

                            const jogoDoBundle = new Jogo(
                                jogo.nome,
                                jogo.plataforma, // url do guia de troféus
                                jogo.tempoParaPlatinar,
                                jogo.iconeUrl,
                                false,
                                jogo.serialJogo,
                                trofeus,
                                jogo.guiaUrl || '',
                                jogo.dificuldade || 0,
                                999,
                                jogo.npwr || ''
                            );
                            jogosBundle.push(jogoDoBundle);
                        });

                        const bundleJogo = new Jogo(
                            dataBundle.nome,
                            dataBundle.plataforma, // url do guia de troféus
                            dataBundle.tempoParaPlatinar,
                            dataBundle.iconeUrl,
                            true,
                            dataBundle.serialJogo,
                            jogosBundle
                        );

                        jogosEncontrados.push(bundleJogo);
                    }
                } else {
                    const dataJogo = queryData as JogoData

                    const trofeus = dataJogo.trofeus.map((trofeuData: TrofeuData) => new Trofeu(
                        trofeuData.idTrofeu,
                        trofeuData.nome,
                        trofeuData.descricao,
                        trofeuData.guia,
                        trofeuData.tipo,
                        trofeuData.oculto,
                        trofeuData.iconeUrl,
                        trofeuData.tags,
                        true,//campo "obtido", deve ser atualizado após ser resgatado 
                        trofeuData.taxaConquistado,
                        trofeuData.raridade
                    ));

                    const jogo = new Jogo(
                        dataJogo.nome,
                        dataJogo.plataforma,
                        dataJogo.tempoParaPlatinar,
                        dataJogo.iconeUrl,
                        dataJogo.bundle,
                        dataJogo.serialJogo || '',
                        trofeus,
                        dataJogo.guiaUrl || '',
                        dataJogo.dificuldade || 0,
                        0,
                        dataJogo.npwr || ''
                    );

                    jogosEncontrados.push(jogo);
                }

            });
            return jogosEncontrados;

        } else {
            console.log('Nenhum documento encontrado com o serialJogo fornecido!');
            return undefined;
        }
    } catch (error) {
        console.error('Erro ao buscar os jogos: ', error);
        throw error;
    }
}
async function obterTrofeusPeloNpwr(npwr: string): Promise<Trofeu[]> {
    try {
        const trofeus: Array<Trofeu> = []
        let titleTrophys = await obterInformacoesTrofeusDoJogo(npwr, auth);
        let titleTrophysUser = await obterInformacoesTrofeusDoJogoUsuario(npwr, auth);

        if (titleTrophys && titleTrophysUser) {
            for (let i = 0; i < titleTrophys.totalItemCount; i++) {

                const trofeu = new Trofeu(
                    titleTrophys.trophies[i].trophyId,
                    String(titleTrophys.trophies[i].trophyName),
                    String(titleTrophys.trophies[i].trophyDetail),
                    "Guia não encontrado",
                    titleTrophys.trophies[i].trophyType,
                    titleTrophys.trophies[i].trophyHidden,
                    String(titleTrophys.trophies[i].trophyIconUrl),
                    ["Story", "Buggy", "Example"],
                    Boolean(titleTrophysUser.trophies[i].earned),
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
                    "Guia não encontrado",
                    titleTrophys.trophies[i].trophyType,
                    titleTrophys.trophies[i].trophyHidden,
                    String(titleTrophys.trophies[i].trophyIconUrl),
                    ["Story", "Buggy", "Example"],
                )
                trofeus.push(trofeu);

            }
        } else {
            console.error("Não foi possivel criar a lista de troféus");
        }

        return trofeus;
    } catch (error) {
        console.error('Falha ao buscar os trofeus na psn api', error);
        console.log("NPWR recebido:" + npwr);
        throw new Error('Erro:');
    }
}

//Esta função obtem as informações dos troféus de um jogo resgatando pelo npwr
async function obterInformacoesTrofeusDoJogo(npwr: string, authToken: any): Promise<TitleTrophiesResponse | undefined> {
    try {
        const titleTrophys = await getTitleTrophies(authToken, npwr, "all", {
            npServiceName: "trophy"
        });
        return titleTrophys;

    } catch (error) {
        console.log("Erro ao obter informações dos trofeus obtidos do titulo");
        throw error;
    }
}

//Esta função também obtem as informações dos troféus de um jogo resgatando pelo npwr, porém ele trás as informações
//baseadas no usuário que esta resgatando, podendo obter informações como a taxa de conquista, se já foi obtido o trofeu e etc.
async function obterInformacoesTrofeusDoJogoUsuario(npwr: string, authToken: any): Promise<UserTrophiesEarnedForTitleResponse | undefined> {
    try {
        const titleTrophysUser = await getUserTrophiesEarnedForTitle(
            authToken,
            "me",
            npwr,
            "all",
            { npServiceName: "trophy" }
        );
        return titleTrophysUser

    } catch (error) {
        console.log("Erro ao obter informações dos trofeus obtidos do usuário");
        throw error;
    }
}

async function obterJogadosRecentemente(authToken: any): Promise<RecentlyPlayedGamesResponse | undefined> {
    try {
        const response = await getRecentlyPlayedGames(authToken, {
            limit: 100,
            categories: ["ps4_game", "ps5_native_game"]
        });
        return response;
    } catch (error) {
        console.error("Erro ao tentar obter jogados recentemente");
        throw error;
    }

}

async function obterTodosJogos(authToken: any): Promise<UserTitlesResponse | undefined> {
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

function limpaNomeJogo(nomeJogo: string) {
    //limpando todas as frases sujas que possam estar nome completo do jogo
    for (let i = 0; i < frasesSujas.length; i++) {
        if (nomeJogo.includes(frasesSujas[i])) {
            nomeJogo = nomeJogo.replace(frasesSujas[i], "");
        }
    }

    //separando o nome do jogo para comparar e limpar cada palavra
    const nomeJogoSeparado = nomeJogo.split(" ");
    let nomeJogoLimpo = '';


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
function organizarNomeJogo(nomeJogo: string): string {
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

async function identificarNomeSaga(nomeBundle: string) {
    try {
        const palavras = nomeBundle.split(" ");

        for (let i = 1; i < palavras.length; i++) {
            //vai verificar todas as palavras do titulo do jogo a partir da segunda palavra, comparando se o titulo possui indicadores
            //que mostram se o for ja percorreu até o fim do nome do jogo ou se ainda tem mais palavras para verificar
            if (palavras.length > 1 && palavrasSujas.includes(palavras[i].toLowerCase())) {
                let saga: string = palavras.slice(0, i).join(" ");
                saga = limpaNomeJogo(saga);
                return saga;
            }
        }
        // Caso contrário, utiliza a primeira palavras como fallback
        return palavras.slice(0, palavras.length).join(" ");
    } catch (error) {
        throw error;
    }
}

async function criarJogo(
    todosJogosResponse: UserTitlesResponse,
    icone: string,
    serial: string,
    npwr: string,
    indexJogo: number
): Promise<Jogo | undefined> {
    try {
        console.log(todosJogosResponse.trophyTitles[indexJogo].trophyTitleName);
        //preciso limpar as palavras abaixo pois existem bastante casos de jogos que colocar essas palavras 
        const nomeJogo = limpaNomeJogo(organizarNomeJogo(todosJogosResponse.trophyTitles[indexJogo].trophyTitleName))
            .replace('\n', ' ')
            .replace("Set", "")
            .replace("Trophy", "")
            .replace('Trophies', '')
            .trim();
        console.log(nomeJogo);

        if (!(await verificarJogoNoBanco(nomeJogo))) {
            // Precisa ser definido antes os troféus do jogo para poder preencher corretamente a classe jogo
            let trofeus = await obterTrofeusPeloNpwr(npwr);
            const jogo = new Jogo(
                nomeJogo,
                todosJogosResponse.trophyTitles[indexJogo].trophyTitlePlatform, // url do guia de troféus
                0, // tempo para platinar, coloquei um tempo aleatório
                icone,
                false,
                serial,
                trofeus,
                "Sem guia definido", // url do guia de troféus
                0, // dificuldade
                0, // progresso PRECISO VALIDAR COMO RECEBER O PROGRESSO AQUI POIS ELE ESTA DISPONIVEL NA LISTA COMPLETA DE JOGOS
                npwr
            );
            return jogo;
        }

        return undefined;
    } catch (error) {
        console.error('Erro ao criar jogo com troféus:', error);
        return undefined;
    }
}

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function criarBundleComJogos(
    jogosNoBundle: TrophyTitle[],
    jogadosRecentementeResponse: RecentlyPlayedGamesResponse,
    indexJogo: number,
): Promise<Jogo | undefined> {
    try {
        // para cada id encontrado dentro do bundle será realizado uma consulta dentro da lista completa de jogos
        // do jogador na PSN para encontrar as informações necessárias para a criação da classe de Jogo e Trofeu
        const jogosBundle: Array<Jogo> = [];

        //verificando se já existe um bundle com o mesmo nome no banco, o nome do bundle não é limpo ou organizado para evitar
        //remover palavras importantes como bundle, special edition e etc.
        if (!(await verificarJogoNoBanco(jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].name))) {
            for (let c = 0; c < jogosNoBundle.length; c++) {
                const nomeJogo = limpaNomeJogo(organizarNomeJogo(jogosNoBundle[c].trophyTitleName))
                    .replace('\n', ' ')
                    .replace("Set", "")
                    .replace("Trophy", "")
                    .replace('Trophies', '')
                    .trim();

                //verificando no banco se já existe um jogo com mesmo nome 
                const jogosEncontradosNoBanco = await buscarJogosPorNome(nomeJogo);
                if (jogosEncontradosNoBanco) {
                    if (jogosEncontradosNoBanco.length > 1) {
                        console.log("Foi encontrado mais de um jogo com o mesmo nome :" + nomeJogo);
                        let jogoExato = false;
                        jogosEncontradosNoBanco.forEach(jogo => {
                            if (jogo.getNome() == nomeJogo) {
                                jogoExato = true;
                                let jogo = new Jogo(
                                    jogosEncontradosNoBanco[0].getNome(),
                                    jogosEncontradosNoBanco[0].getPlataforma(),
                                    jogosEncontradosNoBanco[0].getTempoParaPlatinar(),//tempo para platinar
                                    jogosEncontradosNoBanco[0].getIconeUrl(),
                                    jogosEncontradosNoBanco[0].getBundle(),
                                    jogosEncontradosNoBanco[0].getSerialJogo(),
                                    jogosEncontradosNoBanco[0].getTrofeus(),
                                    jogosEncontradosNoBanco[0].getGuiaUrl(),//url do guia de trofeus
                                    jogosEncontradosNoBanco[0].getDificuldade(),//dificuldade
                                    0,//progresso
                                    jogosEncontradosNoBanco[0].getNpwr(),
                                );
                                jogosBundle.push(jogo);
                            }
                        });
                        if (!jogoExato) {
                            console.error("Não foi encontrado nenhum jogo no banco com o exato nome buscado ao criar o bundle");
                        }
                    } else if (jogosEncontradosNoBanco.length >= 1) {
                        let jogo = new Jogo(
                            jogosEncontradosNoBanco[0].getNome(),
                            jogosEncontradosNoBanco[0].getPlataforma(),
                            jogosEncontradosNoBanco[0].getTempoParaPlatinar(),//tempo para platinar
                            jogosEncontradosNoBanco[0].getIconeUrl(),
                            jogosEncontradosNoBanco[0].getBundle(),
                            jogosEncontradosNoBanco[0].getSerialJogo(),
                            jogosEncontradosNoBanco[0].getTrofeus(),
                            jogosEncontradosNoBanco[0].getGuiaUrl(),//url do guia de trofeus
                            jogosEncontradosNoBanco[0].getDificuldade(),//dificuldade
                            0,//progresso
                            jogosEncontradosNoBanco[0].getNpwr(),
                        );
                        jogosBundle.push(jogo);
                    }
                } else {
                    await delay(7000);
                    let trofeus = await obterTrofeusPeloNpwr(jogosNoBundle[c].npCommunicationId);
                    let jogo = new Jogo(
                        limpaNomeJogo(nomeJogo),
                        jogosNoBundle[c].trophyTitlePlatform,
                        0,//tempo para platinar
                        jogosNoBundle[c].trophyTitleIconUrl,
                        false,
                        "Serial não definido",
                        trofeus,
                        "Sem guia definido",//url do guia de trofeus
                        0,//dificuldade
                        0,//progresso
                        jogosNoBundle[c].npCommunicationId,
                    );
                    jogo = await atualizarJogoComGuia(jogo, jogosNoBundle[c].trophyTitleDetail);
                    jogosBundle.push(jogo);
                }
            }
        }
        //criando o jogo do tipo Bundle, com os jogos que pertecem ao bundle, cada jogo contendo a lista de troféus
        const bundle = new Jogo(
            jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].name,
            jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].platform,
            0,//tempo para platinar, coloquei um tempo aleatorio
            jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].image.url,
            true,
            jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[indexJogo].titleId,
            jogosBundle,
        );

        return bundle;
    } catch (error) {
        console.error(error);
        return undefined;
    }
}

// antiga função de obter a descrição
async function obterDescricaoESerialJogoDaLoja(dadosJogoDaLoja: PlaystationStoreJogoResponse): Promise<PlaystationStoreJogoResponse | undefined> {
    console.log("URL utilizada na pesquisa pelos dados na ps store:", dadosJogoDaLoja.urlPage);
    try {
        if (dadosJogoDaLoja.urlPage) {
            const response = await axios.get(dadosJogoDaLoja.urlPage);
            const data = response.data;
            const descricaoEncontrada = data.long_desc;

            //tenta encontrar na request o serial baseado nos padrões de seriais existentes
            let match = dadosJogoDaLoja.urlPage.match(/CUSA\d{5}_\d{2}/);
            if (match == null) {
                match = dadosJogoDaLoja.urlPage.match(/PPSA\d{5}_\d{2}/);
            }
            if (match == null) {
                match = dadosJogoDaLoja.urlPage.match(/NPUB\d{5}_\d{2}/);
            }
            if (match == null) {
                match = dadosJogoDaLoja.urlPage.match(/PCSE\d{5}_\d{2}/)
            }

            if (data) {
                if (match) {
                    dadosJogoDaLoja.descricao = descricaoEncontrada
                    dadosJogoDaLoja.serialJogo = match[0]

                    if (dadosJogoDaLoja) {
                        return dadosJogoDaLoja;
                    } else {
                        console.log("Nenhuma descrição longa encontrada.");
                        return undefined;
                    }
                } else {
                    console.log("Nenhum id correspondente encontrado.");
                }
            } else {
                console.error("Url da loja retornou valor nulo ou invalido");
                if (match) {
                    dadosJogoDaLoja.serialJogo = match[0]
                    return dadosJogoDaLoja;
                }
            }
        } else {
            console.error("valor da urlJogo indefinida");
        }
    } catch (error) {
        console.error('Erro:', error);
        return undefined;
    }
}

//Compara os jogos resgatados que fazem parte da saga e compara quais jogos estão presentes na descrição do bundle
function verificarJogosNaDescricao(descricao: string, jogosDaListCompleta: TrophyTitle[]) {
    if (!descricao) return [];

    const jogosEncontrados = jogosDaListCompleta.filter(jogo => descricao.toLowerCase().includes(jogo.trophyTitleName.toLowerCase()));
    return jogosEncontrados;
}

async function obterDataStoreJogo(nomeJogo: string): Promise<PlaystationStoreJogoResponse | null> {
    try {
        let pais = "br";
        let linguagem = "pt";
        let baseUrl = `https://store.playstation.com/store/api/chihiro/00_09_000/search/${pais}/${linguagem}/999/`
        let queryUrl = baseUrl + encodeURIComponent(nomeJogo) + "?top_category=downloadable_game";
        let response = await axios.get(queryUrl);
        let data = response.data;
        let pageUrl;
        let imageUrl;
        let serialId;

        //algumas vezes a pesquisa pelo nome do jogo na psn não trás valor algum, então colocar ps4 no final da pesquisa
        //resolve em alguns casos
        if (data.links.length <= 0) {
            queryUrl = queryUrl + " PS4";
            response = await axios.get(queryUrl);
            data = response.data;
        }
        //caso não encontre nada na psn brasileira, tenta pesquisar na psn americana, o melhor cenário seria sempre pesquisar na
        //americana, mas eu não sei ainda se pode existir algum caso onde a brasileira funcione melhor por conta dos jogos estarem sendo
        //resgatados de uma conta br, ainda mais que o serial dos jogos costuma mudar de um país pra outro
        if (data.links.length <= 0) {
            pais = "us"
            linguagem = "en"
            baseUrl = `https://store.playstation.com/store/api/chihiro/00_09_000/search/${pais}/${linguagem}/999/`
            queryUrl = baseUrl + encodeURIComponent(nomeJogo) + "?top_category=downloadable_game";
            response = await axios.get(queryUrl);
            data = response.data;
        }

        console.log("URL final da pesquisa dos detalhes do jogo na PS Store:", queryUrl);
        // Acessa a lista de links
        if (Array.isArray(data.links) && data.links.length > 0) {
            for (let item of data.links) {
                // Verifica se o tipo de conteúdo é "Jogao completo" e etc, geralmente essas são as tags de categorias que todo
                // jogo completo tem na PSN, o que ajuda a identificar se é um jogo completo ou dlc
                if (
                    item.game_contentType === "Jogo completo" ||
                    item.game_contentType === "Full Game" ||
                    item.game_contentType === "Jogo da PSN" ||
                    item.game_contentType === "Jogo" ||
                    item.default_sku.name === "Jogo" ||
                    item.default_sku.name === "Jogo Completo" ||
                    item.default_sku.name === "Jogo para download"
                ) {
                    pageUrl = item.url;
                    imageUrl = item.images[0].url;
                    serialId = item.id;
                }

            }
            const dadosJogoDaLoja: PlaystationStoreJogoResponse = {
                descricao: 'Descrição vazia',
                urlImageJogo: imageUrl,
                serialJogo: serialId,
                urlPage: pageUrl,
            };
            console.log("URL encontrada para o jogo completo na PS Store:", pageUrl);
            return dadosJogoDaLoja;
        } else {
            console.log("A resposta não contém uma lista de links ou não é um objeto do formato esperado.");
        }

        console.log("Nenhuma URL para o jogo completo encontrada.");
        return null;
    } catch (error) {
        console.error('Erro:', error);
        return null;
    }
}

//função que verifica o nome do jogo e procura qual guia mais se aproxima do nome do jogo, quando encontrado
//retorna a url do guia encontrado, costuma funcionar bem mas existem casos muito especificos que precisam
//de mais refinamento para resgatar o guia certo, mas mesmo resgatando o guia errado, os troféus não ficam com a descrição
//errada
async function resgatarUrlDoGuia(nomeJogo: string): Promise<string | undefined> {
    try {
        nomeJogo = limpaNomeJogo(nomeJogo.toLowerCase());
        nomeJogo = organizarNomeJogo(nomeJogo);
        nomeJogo = limpaNomeJogo(nomeJogo.toLowerCase());

        console.log("Nome do jogo utilizado na função resgatarUrlDoGuia " + nomeJogo);
        const queryUrlToGetGuide = `https://psnprofiles.com/search/guides?q=${encodeURIComponent(nomeJogo + " trophy guide")}`;
        console.log("URL final da pesquisa:", queryUrlToGetGuide);

        const response = await axios.get(queryUrlToGetGuide);
        const html = response.data;
        const $ = cheerio.load(html);

        let guiaResponse: GuiaResponse | undefined; // Inicializado com undefined
        let smallestDistance = Infinity;
        let maiorQtdViews: number;

        $('.guide-page-info').each((i, element) => {
            let title = limpaNomeJogo($(element).find('h3.ellipsis span').text().trim().replace("trophy guide", "").toLowerCase());
            const distance = levenshtein.get(nomeJogo, title);
            const qtdViewsAtual = parseInt($(element).find('.stats .col-xs-4.stat').last().text().trim().replace("Views", "").replace(",", ""));

            // console.log("///////////////debug da função resgatarUrlDoGuia()///////////////")
            // console.log(nomeJogo);
            // console.log(title);
            // console.log(title.includes(nomeJogo));
            // console.log("///////////////debug da função resgatarUrlDoGuia()///////////////")

            //verifica se o titulo do guia inclui o exato nome do jogo e compara qual deles esta mais proximo do nome do jogo
            if (title.includes(nomeJogo)) {
                if (distance < smallestDistance) {
                    smallestDistance = distance;
                    if (!guiaResponse) {
                        maiorQtdViews = qtdViewsAtual
                        guiaResponse = {
                            title,
                            author: $(element).find('.author.ellipsis').text().trim(),
                            views: maiorQtdViews,
                            url: $(element).find('a').attr('href') || ''
                        };
                    } else {
                        //em casos onde um guia é mais visualizado, geralmente isso acontece por conta do guuia ser mais detalhado
                        // e facil de seguir, o que significa que existem mais chaces de ter informações importantes nesse guia como
                        //como o tempo para platinar
                        if (maiorQtdViews < qtdViewsAtual) {
                            maiorQtdViews = qtdViewsAtual
                            guiaResponse = {
                                title,
                                author: $(element).find('.author.ellipsis').text().trim(),
                                views: maiorQtdViews,
                                url: $(element).find('a').attr('href') || ''
                            };
                        }
                    }
                }
            }

        });

        // Checa se encontrou o guia e retorna a URL, ou undefined se não encontrou
        if (guiaResponse) {
            console.log(`URL mais próxima ao jogo ${nomeJogo}: ${guiaResponse.title}`);
            console.log(`Author: ${guiaResponse.author}`);
            console.log(`Views: ${guiaResponse.views}`);
            console.log(`URL: ${guiaResponse.url}`);
            return guiaResponse.url;
        }
        return undefined; // Retorna undefined se nenhum guia foi encontrado

    } catch (error) {
        console.error('Erro:', error);
        return undefined;
    }
}

//aqui pega todas as informações do guia e atualiza o jogo com as informações do guia, aqui também é
//chamado pela primeira vez a função resgatarUrlDoGuia onde caso não encontre nenhum guia pro jogo, ele tenta usar
//o nome alternativo que geralmente esta presente a todosJogosResponse
async function atualizarJogoComGuia(jogo: Jogo, nomeJogoAlternativo?: string): Promise<Jogo> {
    try {
        let relativeUrl = await resgatarUrlDoGuia(jogo.getNome());
        if (!relativeUrl && nomeJogoAlternativo) relativeUrl = await resgatarUrlDoGuia(nomeJogoAlternativo); // Se não encontrar a URL, retorna objeto sem alterações
        if (!relativeUrl) {
            jogo.setGuiaUrl("Guia não encontrado");
            return jogo; // Se não encontrar a URL, retorna objeto sem alterações
        }
        const url = 'https://psnprofiles.com' + relativeUrl;
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        let guiaDataResponse: GuiaDataResponse = {}; // Inicializado como objeto vazio

        // Para cada troféu específico, extraia a descrição
        $('.box.section-holder').each((i, element) => {
            const trophyName = $(element).find('.title').text().trim();

            // Encontre a div que contém o nome do troféu
            const trophyContainer = $('.section-holder').filter((i, el) => {
                const title = $(el).find('.title').text().trim();
                return title.toLowerCase() === trophyName.toLowerCase();
            });

            if (trophyContainer.length > 0) {
                // Encontre a descrição do troféu dentro da div com classe 'fr-view'
                const trophyDesc = trophyContainer.find('.fr-view').text().trim();
                // Inicialize o objeto guiaDataResponse[trophyName] se ainda não estiver presente
                if (!guiaDataResponse[trophyName]) {
                    guiaDataResponse[trophyName] = {
                        description: trophyDesc,
                        tags: []
                    };
                } else {
                    guiaDataResponse[trophyName].description = trophyDesc;
                }

                // Extraia as tags dentro de 'section-tags'
                const sectionTags = trophyContainer.find('.section-tags .tag');
                sectionTags.each((i, tagElement) => {
                    const tagText = $(tagElement).text().trim();
                    if (tagText) {
                        guiaDataResponse[trophyName].tags.push(tagText);
                    }
                });
            } else {
                console.log('Trophy guide not found for:', trophyName);
            }
        });

        // Obter informações adicionais, como dificuldade e horas
        const difficultySpan = $('.overview-info .tag')
            .filter((i, el) => $(el).find('.typo-bottom').text().trim() === 'Difficulty')
            .find('.typo-top')
            .text().trim();
        let hoursSpan = $('.overview-info .tag')
            .filter((i, el) => $(el).find('.typo-bottom').text().trim() === 'Hours')
            .find('.typo-top')
            .text().trim();
        //verificação para caso seja hour e não hours
        if (!hoursSpan) {
            hoursSpan = $('.overview-info .tag')
                .filter((i, el) => $(el).find('.typo-bottom').text().trim() === 'Hour')
                .find('.typo-top')
                .text().trim();
        }

        //fazendo a atualização da descrição de cada trofeu com as informações do guia
        jogo.getTrofeus().forEach(trofeu => {
            if (guiaDataResponse[trofeu.getNome()]) {
                trofeu.setGuia(guiaDataResponse[trofeu.getNome()].description);
                if (guiaDataResponse[trofeu.getNome()].tags) {
                    trofeu.getTags().push(...guiaDataResponse[trofeu.getNome()].tags);
                }
            }
        });

        jogo.setTempoParaPlatinar(Number(hoursSpan));
        jogo.setDificuldade(Number(difficultySpan.split('/')[0]));
        jogo.setGuiaUrl(url);
        return jogo;
    } catch (error) {
        console.error('Erro ao definir informações do guia:', error);
        throw error
    }
}

async function cadastrarJogosNovos(todosJogosResponse: UserTitlesResponse) {
    try {
        for (let i = 0; i < todosJogosResponse.totalItemCount; i++) {
            let npwr = todosJogosResponse.trophyTitles[i] ? todosJogosResponse.trophyTitles[i].npCommunicationId : "Não encontrado";

            console.log("Teste1: " + todosJogosResponse.trophyTitles[i].trophyTitleName);
            let nomeJogo = todosJogosResponse.trophyTitles[i].trophyTitleName
                .replace('\n', ' ')
                .replace("Set", "")
                .replace("Trophy", "")
                .replace('Trophies', '')
                .replace('Pack.', '')
                .trim();
            nomeJogo = organizarNomeJogo(nomeJogo);
            nomeJogo = limpaNomeJogo(nomeJogo);
            nomeJogo = organizarNomeJogo(nomeJogo);
            console.log("Teste2: (" + nomeJogo +")");
            console.log(!(await verificarJogoNoBanco(nomeJogo)));
            if (!(await verificarJogoNoBanco(nomeJogo))) {

                await delay(7000);
                const psStoreQueryResponse = await obterDataStoreJogo(
                    organizarNomeJogo(todosJogosResponse.trophyTitles[i].trophyTitleName)
                );
                let jogo

                if (psStoreQueryResponse) {
                    const psStoreQueryResponseAtualizado = await obterDescricaoESerialJogoDaLoja(psStoreQueryResponse);
                    if (psStoreQueryResponseAtualizado) {
                        jogo = await criarJogo(todosJogosResponse, psStoreQueryResponseAtualizado.urlImageJogo, psStoreQueryResponseAtualizado.serialJogo, npwr, i);
                    } else {
                        console.error("Foi encontrado dados de algum jogo, mas não foi possivel encontrar algo que combine com " + todosJogosResponse.trophyTitles[i].trophyTitleName);
                        jogo = await criarJogo(todosJogosResponse, todosJogosResponse.trophyTitles[i].trophyTitleIconUrl, 'Não encontrado', npwr, i);
                    }

                } else {
                    console.error("Erro ao definir informações pela ps store do jogo " + todosJogosResponse.trophyTitles[i].trophyTitleName);
                    jogo = await criarJogo(todosJogosResponse, todosJogosResponse.trophyTitles[i].trophyTitleIconUrl, 'Não encontrado', npwr, i);
                }

                if (jogo) {
                    jogo = await atualizarJogoComGuia(jogo, todosJogosResponse.trophyTitles[i].trophyTitleDetail);
                    jogo.setNome(organizarNomeJogo(jogo.getNome()))

                    console.log("Nome do Jogo que será inserido no banco: " + JSON.stringify(jogo.getNome()));
                    await inserirJogoNoBanco(jogo);
                } else {
                    console.error("Não foi possivel definir um objeto do jogo " + todosJogosResponse.trophyTitles[i].trophyTitleName);
                }
            }
        }
    } catch (e) {
        console.error("Ocorreu um erro ao tentar cadastrar um novo jogo");
        throw e;
    }
}

async function cadastrarBundleNovo(todosJogosResponse: UserTitlesResponse, jogadosRecentementeResponse: RecentlyPlayedGamesResponse) {
    try {
        for (let i = 0; i < jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games.length; i++) {
            const nomeProduto = jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[i].name;
            const isBundleName = palavrasIndicadorasDeBundle.some(prefixo => nomeProduto.toLowerCase().includes(prefixo));

            if (isBundleName) {
                if (!(await verificarJogoNoBanco(organizarNomeJogo(limpaNomeJogo(organizarNomeJogo(limpaNomeJogo(jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[i].name))))))) {
                    await delay(7000);
                    const psStoreQueryResponse = await obterDataStoreJogo(nomeProduto);

                    if (psStoreQueryResponse) {
                        const psStoreQueryResponseAtualizado = await obterDescricaoESerialJogoDaLoja(psStoreQueryResponse);
                        if (psStoreQueryResponseAtualizado) {
                            const descricao = psStoreQueryResponse.descricao;
                            const nomeSaga = await identificarNomeSaga(nomeProduto);

                            //filtra na lista de jogos em que o usuário obteve troféus pelo nome dos jogos que possuem o mesmo nome da saga
                            //Ex: nome da saga = devil may cry; lista completa filtra e trás devil may cry 1 2 3 4 e etc que o usuário tiver
                            let jogosDaSaga: TrophyTitle[]
                            if (nomeSaga.toLowerCase() == "naruto shippuden") {
                                jogosDaSaga = todosJogosResponse.trophyTitles.filter(jogo => jogo.trophyTitleName.toLowerCase().includes("ultimate ninja storm"));
                            } else {
                                jogosDaSaga = todosJogosResponse.trophyTitles.filter(jogo => jogo.trophyTitleName.includes(nomeSaga));

                            }
                            if (jogosDaSaga.length == 0) {
                                console.log("Não foi encontrado " + JSON.stringify(nomeSaga) + " na lista de todos os jogos");
                                jogosDaSaga = todosJogosResponse.trophyTitles.filter(async jogo => jogo.trophyTitleName.includes(limpaNomeJogo(nomeSaga)));
                            }
                            const jogosNoBundle = verificarJogosNaDescricao(descricao, jogosDaSaga);

                            if (jogosNoBundle.length >= 1) {
                                const bundle = await criarBundleComJogos(jogosNoBundle, jogadosRecentementeResponse, i);
                                if (bundle) {
                                    console.log("///////////////////////////////DEBUG FUNÇÃO cadastrarBundleNovo()///////////////////////////////");
                                    console.log("Bundle criado: ");
                                    console.log(bundle.getNome());
                                    console.log("com os jogos: ");
                                    bundle?.getJogos().forEach(jogo => {
                                        console.log(jogo.getNome());
                                    });
                                    console.log("///////////////////////////////DEBUG FUNÇÃO cadastrarBundleNovo()///////////////////////////////");

                                    console.log("Nome do Bundle que será inserido no banco: " + JSON.stringify(bundle.getNome()));
                                    await inserirBundleNoBanco(bundle);
                                }
                            }
                        }
                    }
                }else{
                    console.log("Oia só já tem no banco");
                }
            }

        }
    } catch (e) {
        console.error("Ocorreu um erro ao tentar cadastrar um novo bundle");
        throw e;
    }
}

async function main() {
    try {
        // console.log(!(await verificarJogoNoBanco("X Men Origins Wolverine")));

        const ssoToken: string = "INSERIR SSO TOKEN AQUI PARA TESTES";

        auth = await obterPsnAuthorization(ssoToken);
        let todosJogosResponse;
        let jogadosRecentementeResponse;

        const now = new Date();
        const expirationDate = new Date(
            now.getTime() + auth.expiresIn * 1000
        ).toISOString();

        const isAccessTokenExpired = new Date(expirationDate).getTime() < now.getTime();
        if (isAccessTokenExpired) {
            let updatedAuthorization = await exchangeRefreshTokenForAuthTokens(
                auth.refreshToken
            );
            todosJogosResponse = await obterTodosJogos(updatedAuthorization);
            jogadosRecentementeResponse = await obterJogadosRecentemente(updatedAuthorization);
        }


        todosJogosResponse = await obterTodosJogos(auth);
        jogadosRecentementeResponse = await obterJogadosRecentemente(auth);


        if (todosJogosResponse && jogadosRecentementeResponse) {
            await cadastrarJogosNovos(todosJogosResponse);
            await cadastrarBundleNovo(todosJogosResponse, jogadosRecentementeResponse);
        }
    } catch (error) {
        console.error('Erro ao executar a main:', error);
    }


    // console.log(await buscarJogosPorNome("naruto"));
    // normalizarNomes();

    // console.log("Retorno :" + limpaNomeJogo("devil may cry 2".toLowerCase())+"Teste");
    // console.log("Retorno :" + limpaNomeJogo("FINAL FANTASY TYPE-0 HD".toLowerCase()));
    // console.log("Retorno :" + await resgatarUrlDoGuia("How to Survive: ゾンビアイランド2"));


    // const dataQuery = await obterDataStoreJogo("Life is Strange True Colors");
    // if (dataQuery) {
    //     const psStoreResponse = await obterDescricaoESerialJogoDaLoja(dataQuery);
    //     console.log(psStoreResponse)
    // }
}
main();
