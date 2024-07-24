import Jogo from '../models/jogoModel';
import Playlist from '../models/playlistModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecentlyPlayedGamesResponse, UserTitlesResponse } from 'psn-api';
import JogoService from './jogoService';


class PlaylistService {
    private jogoService: JogoService;
    constructor() {
        this.jogoService = new JogoService();
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

    async definirPlaylistsIniciais(
        jogadosRecentementeResponse: RecentlyPlayedGamesResponse,
        todosJogosResponse: UserTitlesResponse,
    ): Promise<Playlist[] | undefined> {
        try {
            let playlists: Array<Playlist> = [];

            // se não tiver dados em cache, será criado novas playlists, que posteriormente serão enviadas ao banco
            const categorias: string[] = ["Para platinar", "Platinados", "Jogados recentemente"];

            let jogosPlaylist: Jogo[] = [];

            if (jogadosRecentementeResponse && todosJogosResponse) {

                for (let i = 0; i < jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games.length; i++) {
                    console.log(jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games.length);
                    let titleId = JSON.stringify(jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[i].titleId);

                    // Variavel jogosNpwr possui resgatados os valores NPWR na função obterNpwrJogos 
                    // baseado no serialID do jogo listado, se retornar mais 1 valor, é bundle, pois cada npwr
                    // pertence a um jogo diferente
                    let jogosNpwr: string[] = await this.jogoService.obterNpwrJogos(titleId);

                    if (jogosNpwr.length > 1) {
                        const jogo = await this.jogoService.criarBundleComJogosComTrofeus(jogadosRecentementeResponse, todosJogosResponse, jogosNpwr, i, titleId);
                        if (jogo) {
                            jogosPlaylist.push(jogo);
                        } else {
                            console.error("deu algo errado na criação da classe jogoBundle");
                        }

                    } else {
                        let cenarioCritico: boolean = false;

                        for (let c = 0; c < todosJogosResponse.totalItemCount; c++) {

                            //se for encontrado um jogo na lista completa com o mesmo id do jogo, será criado uma instancia
                            //do jogo para posteriormente inserir no banco
                            console.log("Inicio do loop, vamos para o " + todosJogosResponse.trophyTitles[c].trophyTitleName);
                            if (todosJogosResponse.trophyTitles[c].npCommunicationId.replace(/^NPWR(\d{5}).*/, 'NPWR-$1') == jogosNpwr[0]) {
                                console.log("Foi encontrado um jogo na sua lista de jogos completa que bate com o mesmo npwr encontrado no Serial Station");
                                console.log("Comparando " + todosJogosResponse.trophyTitles[c].npCommunicationId.replace(/^NPWR(\d{5}).*/, 'NPWR-$1') + "Com o " + jogosNpwr)

                                const jogo = await this.jogoService.criarJogoComTrofeus(jogadosRecentementeResponse, jogosNpwr[0].replace('-', '') + '_00', i);
                                if (jogo) {
                                    jogosPlaylist.push(jogo);
                                } else {
                                    console.error("deu algo errado na criação da classe jogo");
                                }

                            } else if (jogosNpwr.length < 1) {

                                console.log("Não foi possivel resgatar o npwr pelo site Serial Station");

                                if (todosJogosResponse.trophyTitles[c].trophyTitleName.includes(jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[i].name)) {

                                    console.log("Encontrado um jogo");
                                    let testeNpwr = todosJogosResponse.trophyTitles[c].npCommunicationId
                                    //vou criar um jogo mesmo caso não tenha encontrado o NPWR, pois existem alguns jogos que não encontra mesmo
                                    const jogo = await this.jogoService.criarJogoComTrofeus(jogadosRecentementeResponse, testeNpwr, i);

                                    if (jogo) {
                                        console.log("Jogo criado:" + jogo);
                                        jogosPlaylist.push(jogo);
                                    } else {
                                        console.error("deu algo errado na criação da classe jogo");
                                    }

                                } else {
                                    cenarioCritico = true;
                                }
                            }
                        }
                        
                        if (cenarioCritico) {
                            console.log("Não foi encontra o NPWR no Serial station e não foi encontrado nenhum jogo com o mesmo nome na lista de jogos completos do usuário ");
                            const jogo = await this.jogoService.criarJogoSemTrofeus(jogadosRecentementeResponse, i);

                            if (jogo) {
                                console.log("Jogo criado:" + jogo);
                                jogosPlaylist.push(jogo);
                            } else {
                                console.error("deu algo errado na criação da classe jogo");
                            }
                        }
                    }
                }
            }


            if (jogadosRecentementeResponse) {
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