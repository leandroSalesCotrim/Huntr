import Jogo from '../models/jogoModel';
import Playlist from '../models/playlistModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import JogoService from './jogoService';
import JogoRepository from '../repository/jogoRepository';
import { meuScript } from '../../scripts/popular_dados';


class PlaylistService {
    private jogoService: JogoService;
    private jogoRepository: JogoRepository;
    constructor() {
        this.jogoService = new JogoService();
        this.jogoRepository = new JogoRepository();
    }

    async listarPlaylists(): Promise<Playlist[] | null> {
        try {
            let playlists: Array<Playlist> = [];
            const playlistsJSON = await AsyncStorage.getItem('playlists');
            if (playlistsJSON) {
                //primeiro verifica no cache se existe alguma playlist definida
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
                console.log("Foi encontrado uma playlist em cache")
                return playlists;
            }
            //depois verifica se existe alguma playlist no banco
            //então caso nada retorne, retorn undefined
            console.log("Não foi encontrado nenhuma playlist em cache ")
            return null;
        } catch (error) {
            console.error("Deu algo errado ao tentar listar as playlists " + error)
            throw error;
        }
    }
    async executarScript() {
        const resultado = meuScript();
        console.log(resultado);
    };
    async definirPlaylistsIniciais(): Promise<Playlist[] | undefined> {
        try {
            let playlists: Array<Playlist> = [];
            let authorization = await AsyncStorage.getItem('authToken');
            if (authorization) {
                // se não tiver dados em cache, será criado novas playlists, que posteriormente serão enviadas ao banco
                const categorias: string[] = ["Para platinar", "Platinados", "Jogados recentemente"];
                let executarScript = false;
                let authToken = JSON.parse(authorization);
                let jogosPlaylist: Jogo[] = [];
                const jogadosRecentementeResponse = await this.jogoService.obterJogadosRecentemente(authToken);

                if (jogadosRecentementeResponse) {
                    for (let i = 0; i < jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games.length; i++) {
                        let nomeJogoRecente = jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[i].name;
                        let jogoEncontradoNoBanco = await this.jogoRepository.buscarJogoPorNome(
                            this.jogoService.organizarNomeJogo(
                                this.jogoService.limpaNomeJogo(
                                    this.jogoService.organizarNomeJogo(nomeJogoRecente)
                                )
                            )
                        );

                        console.log("DWAHIDAWHDUHAWUHDUAWD");
                        console.log(jogoEncontradoNoBanco?.getNome());

                        if (jogoEncontradoNoBanco) {
                            const todosJogosResponse = await this.jogoService.obterTodosJogos(authToken);

                            if (todosJogosResponse) {
                                // Filtra os jogos pelo nome exato ou parte do nome
                                const jogoEncontrado = todosJogosResponse.trophyTitles.find(
                                    jogo => this.jogoService.organizarNomeJogo(
                                        this.jogoService.limpaNomeJogo(
                                            this.jogoService.organizarNomeJogo(
                                                jogo.trophyTitleName.toLowerCase()
                                            )
                                        )
                                    )
                                        ===
                                        this.jogoService.organizarNomeJogo(
                                            this.jogoService.limpaNomeJogo(
                                                this.jogoService.organizarNomeJogo(
                                                    nomeJogoRecente.toLowerCase()
                                                )
                                            )
                                        )
                                );
                                console.log("O jogo a seguir recebera o progresso");
                                console.log(jogoEncontradoNoBanco.getNome());

                                if (jogoEncontrado) {
                                    console.log("223ndnawduianwddn");
                                    console.log(jogoEncontrado.progress);
                                    // Aqui, 'setProgresso' agora recebe o progresso do jogo encontrado
                                    jogoEncontradoNoBanco.setProgresso(jogoEncontrado.progress);

                                    //definindo plataforma
                                    if (jogoEncontrado.trophyTitlePlatform.toLowerCase() != "unknown") {
                                        jogoEncontradoNoBanco.setPlataforma(jogoEncontrado.trophyTitlePlatform);
                                    } else {
                                        jogoEncontradoNoBanco.setPlataforma("PSX");
                                    }
                                } else {
                                    // Caso o jogo não seja encontrado
                                    console.log("Jogo não encontrado!");
                                }
                            }

                            console.log("Jogo " + jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[i].name + " encontrado no banco: ");
                            if (jogoEncontradoNoBanco) {
                                console.log(jogoEncontradoNoBanco.getBundle());
                                // console.log("Jogo montado com dados do banco: " + JSON.stringify(jogoEncontradoNoBanco));
                                if (jogoEncontradoNoBanco.getBundle()) {
                                    console.log("Identificado como bundle");
                                    console.log("Imprimindo o primeiro jogo do bundle " + jogoEncontradoNoBanco.getJogos()[0]);
                                }
                                jogosPlaylist.push(jogoEncontradoNoBanco);
                            } else {
                                console.log("Não foi possivel montar o jogo com os dados do banco")
                            }

                        } else {
                            console.log("Não foi possivel encontrar o jogo," + jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[i].name + " no banco")
                            executarScript = true;
                        }
                    }
                }

                // if(executarScript){
                //     await this.executarScript();
                // }

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

        } catch (error) {
            console.error('Erro ao definir playlists:', error);
        }
    }

    // async definirPlaylistsIniciais(): Promise<Playlist[] | undefined> {
    //     try {
    //         let playlists: Array<Playlist> = [];
    //         let authorization = await AsyncStorage.getItem('authToken');
    //         if (authorization) {
    //             // se não tiver dados em cache, será criado novas playlists, que posteriormente serão enviadas ao banco
    //             const categorias: string[] = ["Para platinar", "Platinados", "Jogados recentemente"];
    //             let authToken = JSON.parse(authorization);
    //             let jogosPlaylist: Jogo[] = [];
    //             const jogadosRecentementeResponse = await this.jogoService.obterJogadosRecentemente(authToken);

    //             if (jogadosRecentementeResponse) {
    //                 for (let i = 0; i < jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games.length; i++) {
    //                     // let existeNoBanco = await this.jogoRepository.verificarJogoExiste(jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[i].name);

    //                     // if (existeNoBanco) {
    //                     //     console.log("Jogo "+jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[i].name+" encontrado no banco: " );
    //                     //     const jogo = await this.jogoRepository.obterJogoPorSerial(jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[i].titleId)
    //                     //     if (jogo) {
    //                     //         console.log(jogo.getBundle());
    //                     //         console.log("Jogo montado com dados do banco: " + JSON.stringify(jogo));
    //                     //         if (jogo.getBundle()) {
    //                     //             console.log("Identificado como bundle");
    //                     //             console.log("Imprimindo o primeiro jogo do bundle " + jogo.getJogos()[0]);
    //                     //         }
    //                     //         jogosPlaylist.push(jogo);
    //                     //     } else {
    //                     //         console.log("Não foi possivel resgatar o jogo do banco")
    //                     //     }
    //                     // } else {
    //                         const todosJogosResponse = await this.jogoService.obterTodosJogos(authToken);
    //                         if (todosJogosResponse) {

    //                             let titleId = jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[i].titleId;

    //                             // Variavel jogosNpwr possui resgatados os valores NPWR na função obterNpwrJogos 
    //                             // baseado no serialID do jogo listado, se retornar mais 1 valor, é bundle, pois cada npwr
    //                             // pertence a um jogo diferente
    //                             let jogosNpwr: string[] = await this.jogoService.obterNpwrJogos(titleId);

    //                             if (jogosNpwr.length > 1) {
    //                                 const jogo = await this.jogoService.criarBundleComJogosComTrofeus(jogadosRecentementeResponse, todosJogosResponse, jogosNpwr, i, titleId);
    //                                 if (jogo) {
    //                                     jogosPlaylist.push(jogo);
    //                                 } else {
    //                                     console.error("deu algo errado na criação da classe jogoBundle");
    //                                 }

    //                             } else {
    //                                 let cenarioCritico: boolean = false;

    //                                 for (let c = 0; c < todosJogosResponse.totalItemCount; c++) {

    //                                     //se for encontrado um jogo na lista completa com o mesmo id do jogo, será criado uma instancia
    //                                     //do jogo para posteriormente inserir no banco
    //                                     if (todosJogosResponse.trophyTitles[c].npCommunicationId.replace(/^NPWR(\d{5}).*/, 'NPWR-$1') == jogosNpwr[0]) {
    //                                         console.log("Foi encontrado um jogo na sua lista de jogos completa que bate com o mesmo npwr encontrado no Serial Station");
    //                                         // console.log("Comparando " + todosJogosResponse.trophyTitles[c].npCommunicationId.replace(/^NPWR(\d{5}).*/, 'NPWR-$1') + "Com o " + jogosNpwr)

    //                                         const jogo = await this.jogoService.criarJogoComTrofeus(jogadosRecentementeResponse, jogosNpwr[0].replace('-', '') + '_00', i);
    //                                         if (jogo) {
    //                                             jogosPlaylist.push(jogo);
    //                                         } else {
    //                                             console.error("deu algo errado na criação da classe jogo");
    //                                         }

    //                                     } else if (jogosNpwr.length < 1) {

    //                                         console.log("Não foi possivel resgatar o npwr pelo site Serial Station");

    //                                         if (todosJogosResponse.trophyTitles[c].trophyTitleName.includes(jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[i].name)) {

    //                                             console.log("Encontrado um jogo");
    //                                             let testeNpwr = todosJogosResponse.trophyTitles[c].npCommunicationId
    //                                             //vou criar um jogo mesmo caso não tenha encontrado o NPWR, pois existem alguns jogos que não encontra mesmo
    //                                             const jogo = await this.jogoService.criarJogoComTrofeus(jogadosRecentementeResponse, testeNpwr, i);

    //                                             if (jogo) {
    //                                                 console.log("Jogo criado:" + jogo);
    //                                                 jogosPlaylist.push(jogo);
    //                                             } else {
    //                                                 console.error("deu algo errado na criação da classe jogo");
    //                                             }

    //                                         } else {
    //                                             cenarioCritico = true;
    //                                         }
    //                                     }
    //                                 }

    //                                 if (cenarioCritico) {
    //                                     console.log("Não foi encontrado o NPWR no Serial station e não foi encontrado nenhum jogo com o mesmo nome na lista de jogos completos do usuário ");
    //                                     const jogo = await this.jogoService.criarJogoSemTrofeus(jogadosRecentementeResponse, i);

    //                                     if (jogo) {
    //                                         console.log("Jogo criado:" + jogo);
    //                                         jogosPlaylist.push(jogo);
    //                                     } else {
    //                                         console.error("deu algo errado na criação da classe jogo");
    //                                     }
    //                                 }
    //                             }
    //                         }
    //                     // }
    //                 }
    //                 categorias.forEach(categoria => {
    //                     const playlist = new Playlist(
    //                         categoria,
    //                         "Playstation",
    //                         jogosPlaylist,
    //                         1
    //                     );
    //                     playlists.push(playlist);
    //                 });
    //             }
    //             return playlists;
    //         }



    //     } catch (error) {
    //         console.error('Erro ao definir playlists:', error);
    //     }
    // }

    async reorganizarPlaylist() {
    }
    async abrirJogoDaPlaylist(idJogo: string) {
    }
    async adicionarJogoNaPlaylist(idJogo: string) {
    }
    async removerJogoDaPlaylist(idJogo: string) {
    }

}
export default PlaylistService;