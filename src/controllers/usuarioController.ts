import UsuarioService from "../services/usuarioService";
import Usuario from "../models/usuarioModel";
import Jogo from "../models/jogoModel";
import Trofeu from "../models/trofeuModel";

class UsuarioController {
  private usuarioService: UsuarioService;
  constructor() {
    this.usuarioService = new UsuarioService();
  }

  async teste(sso: string) {
    try {
      const userTitlesResponse = await this.usuarioService.teste(sso);
      return userTitlesResponse;
    } catch (error) {
      console.error("Erro ao carregar os títulos do usuário:", error);
      throw error;
    }
  }
  async atualizarToken(){
    try {
      this.usuarioService.atualizarToken
    } catch (error) {
      console.error("Erro ao atualizar token do usuário:", error);
      throw error;
    }
  }


}
export default UsuarioController;