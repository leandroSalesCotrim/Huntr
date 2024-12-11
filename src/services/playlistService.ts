import Jogo from '../models/jogoModel';
import Playlist from '../models/playlistModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import JogoService from './jogoService';
import JogoRepository from '../repository/jogoRepository';
// import { meuScript } from '../../scripts/popular_dados';
import TrofeuService from './trofeuService';
import { UserTitlesResponse } from 'psn-api';


class PlaylistService {
    private trofeuService: TrofeuService;
    private jogoService: JogoService;
    private jogoRepository: JogoRepository;
    constructor() {
        this.trofeuService = new TrofeuService();
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
            console.log("Não foi encontrado nenhuma playlist em cache")
            return null;
        } catch (error) {
            console.error("Deu algo errado ao tentar listar as playlists " + error)
            throw error;
        }
    }
    // async executarScript() {
    //     const resultado = meuScript();
    //     console.log(resultado);
    // };
    async definirPlaylistsIniciais(): Promise<Playlist[] | undefined> {
        try {
            let playlists: Array<Playlist> = [];
            let authorization = await AsyncStorage.getItem('authToken');
            if (authorization) {
                // se não tiver dados em cache, será criado novas playlists, que posteriormente devem ser enviadas ao banco
                let executarScript = false;
                let authToken = JSON.parse(authorization);

                let jogosRecentesPlaylist: Jogo[] = [];
                let jogosPlatinadosPlaylist: Jogo[] = [];

                const jogadosRecentementeResponse = await this.jogoService.obterJogadosRecentemente(authToken);

                if (jogadosRecentementeResponse) {
                    for (let i = 0; i < jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games.length; i++) {
                        let nomeJogoRecente = jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[i].name;
                        let jogoEncontradoNoBanco = await this.jogoRepository.buscarJogoPorNome(
                            this.jogoService.organizarNomeJogo(
                                this.jogoService.limpaNomeJogo(
                                    this.jogoService.organizarNomeJogo(nomeJogoRecente), false
                                )
                            )
                        );

                        //caso jogo não for encontrado no banco pode ser por conta de alguns caracteres especiais ou por ser bundle
                        //então tenta procurar o jogo novamente como bundle true
                        if (!jogoEncontradoNoBanco) {
                            jogoEncontradoNoBanco = await this.jogoRepository.buscarJogoPorNome(
                                this.jogoService.organizarNomeJogo(
                                    this.jogoService.limpaNomeJogo(
                                        this.jogoService.organizarNomeJogo(nomeJogoRecente), true
                                    )
                                )
                            );
                        }


                        if (jogoEncontradoNoBanco) {
                            const todosJogosResponse = await this.jogoService.obterTodosJogos(authToken);
                            if (todosJogosResponse) {

                                if (jogoEncontradoNoBanco.getBundle()) {
                                    let progressoTotalBundle: number = 0;
                                    let progressoBundle: number = 0;

                                    let dificuldadeTotalBundle: number = 0;
                                    let dificuldadeBundle: number = 0;

                                    console.log("Jogo " + jogoEncontradoNoBanco.getNome() + " identificado como bundle fazendo atualizações de informações");

                                    for (let i = 0; i < jogoEncontradoNoBanco.getJogos().length; i++) {
                                        let jogoEncontradoNoBancoAtualizado = await this.includeUserInfoToJogo(todosJogosResponse, jogoEncontradoNoBanco.getJogos()[i].getNome(), jogoEncontradoNoBanco.getJogos()[i])

                                        progressoTotalBundle += jogoEncontradoNoBancoAtualizado.getProgresso()
                                        dificuldadeTotalBundle += jogoEncontradoNoBancoAtualizado.getDificuldade()


                                        //plataforma é atualizada assim porque os dados do jogoEncontradoNoBanco não tem plataforma quando é bundle
                                        //por conta de que alguns bundles possuem a plataforma como UNKNOW
                                        //então eu pego qualquer plataforma do jogo atualizado que possui as informações do usuário
                                        jogoEncontradoNoBanco.setPlataforma(jogoEncontradoNoBancoAtualizado.getPlataforma());
                                        jogoEncontradoNoBanco.getJogos()[i] = jogoEncontradoNoBancoAtualizado;

                                        if (jogoEncontradoNoBancoAtualizado.getTrofeus()[0].getTipo() == "platinum" && jogoEncontradoNoBancoAtualizado.getTrofeus()[0].getConquistado()) {
                                            jogosPlatinadosPlaylist.push(jogoEncontradoNoBancoAtualizado)
                                        }

                                    }

                                    progressoBundle = progressoTotalBundle / jogoEncontradoNoBanco.getJogos().length
                                    dificuldadeBundle = dificuldadeTotalBundle / jogoEncontradoNoBanco.getJogos().length

                                    jogoEncontradoNoBanco.setProgresso(progressoBundle);
                                    jogoEncontradoNoBanco.setDificuldade(dificuldadeBundle);

                                    jogosRecentesPlaylist.push(jogoEncontradoNoBanco);

                                } else {
                                    this.includeUserInfoToJogo(todosJogosResponse, nomeJogoRecente, jogoEncontradoNoBanco)
                                    if (jogoEncontradoNoBanco.getTrofeus()[0].getTipo() == "platinum" && jogoEncontradoNoBanco.getTrofeus()[0].getConquistado()) {
                                        jogosPlatinadosPlaylist.push(jogoEncontradoNoBanco)
                                    }
                                    jogosRecentesPlaylist.push(jogoEncontradoNoBanco);

                                }
                            }
                            console.log("Jogo " + jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[i].name + " encontrado no banco: ");

                        } else {
                            console.log("Não foi possivel encontrar o jogo " + jogadosRecentementeResponse.data.gameLibraryTitlesRetrieve.games[i].name + " no banco")
                            executarScript = true;
                        }
                    }
                }

                // if(executarScript){
                //     await this.executarScript();
                // }

                const playlistJogosRecentes = new Playlist(
                    "Jogados recentemente",
                    "Playstation",//não sei se vai ter mais utilidade mas aqui era pra separar caso fosse listar playlist de outras plataformas como xbox ou steam
                    jogosRecentesPlaylist,
                    1// id usuário, não sei se vai ser utilizado mais pois estou pensando em remover o cadastro de usuário
                );
                const playlistJogosConcluidos = new Playlist(
                    "Concluidos",
                    "Playstation",//não sei se vai ter mais utilidade mas aqui era pra separar caso fosse listar playlist de outras plataformas como xbox ou steam
                    jogosPlatinadosPlaylist,
                    1// id usuário, não sei se vai ser utilizado mais pois estou pensando em remover o cadastro de usuário
                );
                const playlistJogosPlatinando = new Playlist(
                    "Platinando",
                    "Playstation",//não sei se vai ter mais utilidade mas aqui era pra separar caso fosse listar playlist de outras plataformas como xbox ou steam
                    [],
                    1// id usuário, não sei se vai ser utilizado mais pois estou pensando em remover o cadastro de usuário
                );
                playlists.push(playlistJogosRecentes);
                playlists.push(playlistJogosConcluidos);
                playlists.push(playlistJogosPlatinando);

                // categorias.forEach(categoria => {
                //     const playlist = new Playlist(
                //         categoria,
                //         "Playstation",
                //         jogosPlaylist,
                //         1// id usuário, não sei se vai ser utilizado mais pois estou pensando em remover o cadastro de usuário
                //     );
                //     playlists.push(playlist);
                // });
            }
            return playlists;

        } catch (error) {
            console.error('Erro ao definir playlists:', error);
        }
    }

    async includeUserInfoToJogo(todosJogosResponse: UserTitlesResponse, nomeJogoRecente: string, jogoEncontradoNoBanco: Jogo): Promise<Jogo> {
        console.log("Nome do jogo a ser procurado na lista completa: " + nomeJogoRecente)
        // Filtra os jogos pelo nome exato ou parte do nome
        const jogoEncontrado = todosJogosResponse.trophyTitles.find(
            jogo => this.jogoService.organizarNomeJogo(
                this.jogoService.limpaNomeJogo(
                    this.jogoService.organizarNomeJogo(
                        jogo.trophyTitleName.toLowerCase()
                    ), false
                )
            )
                ===
                this.jogoService.organizarNomeJogo(
                    this.jogoService.limpaNomeJogo(
                        this.jogoService.organizarNomeJogo(
                            nomeJogoRecente.toLowerCase()
                        ), false
                    )
                )
        );

        if (jogoEncontrado) {
            const userTrophyData = await this.trofeuService.obterTrofeusPeloNpwr(jogoEncontrado.npCommunicationId);

            // Aqui, 'setProgresso' agora recebe o progresso do jogo encontrado
            jogoEncontradoNoBanco.setProgresso(jogoEncontrado.progress);

            userTrophyData.map((trofeu, index) => (
                //definindo novamente para atualizar a linguagem de acordo com o idioma do SO
                jogoEncontradoNoBanco?.getTrofeus()[index].setNome(trofeu.getNome()),
                jogoEncontradoNoBanco?.getTrofeus()[index].setDescricao(trofeu.getDescricao()),

                //definindo novamente para atualizar o progresso do usuário
                jogoEncontradoNoBanco?.getTrofeus()[index].setConquistado(trofeu.getConquistado()),
                jogoEncontradoNoBanco?.getTrofeus()[index].setDataConquistado(trofeu.getDataConquistado())
            ))

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

        return jogoEncontradoNoBanco;
    }

    async adicionarJogoNaPlaylist(idJogo: string) {
    }
    async removerJogoDaPlaylist(idJogo: string) {
    }

}
export default PlaylistService;