import UsuarioService from "../services/usuarioService";
import PlaylistService from "../services/playlistService";
import Playlist from "../models/playlistModel";
import JogoService from "../services/jogoService";
import AsyncStorage from '@react-native-async-storage/async-storage';

class UsuarioController {
  private usuarioService: UsuarioService;
  private playlistService: PlaylistService;
  private jogoService: JogoService;
  constructor() {
    this.usuarioService = new UsuarioService();
    this.playlistService = new PlaylistService();
    this.jogoService = new JogoService();
  }

  //Ainda não sei bem como funcionará, mas a ideia é que quando um usuário queira os dados mais recentes da psn em sua playlist
  //esta função seja chamada renovando a playlist atual
  async sincronizarPlaylists(sso: string) {
  }

  async criarNovasPlaylistUsuario(): Promise<Playlist[] | undefined> {
    if (await this.playlistService.listarPlaylists() == null) {
      //vou burlar a validação de token para testes mas deveria ser verificado de alguma forma
      await this.usuarioService.validarToken();
      let authorization = await AsyncStorage.getItem('authToken');

      if (!authorization) {
        console.log("Não tinha nada definido de token no cache");
        await this.usuarioService.obterPsnAuthorization("INSERIR TOKEN AQUI");
        authorization = await AsyncStorage.getItem('authToken');

      }

      if (authorization) {
        let authToken = JSON.parse(authorization);


        return this.playlistService.definirPlaylistsIniciais();

      } else {
        console.log("authorization não deu certo " + authorization)
      }
    }
  }

  async atualizarToken() {
    this.usuarioService.atualizarToken
  }


}
export default UsuarioController;