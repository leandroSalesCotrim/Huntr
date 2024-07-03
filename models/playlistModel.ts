import Jogo from "./jogoModel";

class Playlist {
    private idPlaylist: number;
    private categoria: string;
    private plataforma: string;
    private jogos: Jogo[];
    private idUsuario: number;

    constructor(idPlaylist: number, categoria: string, plataforma: string, jogos: Jogo[], idUsuario: number) {
        this.idPlaylist = idPlaylist;
        this.categoria = categoria;
        this.plataforma = plataforma;
        this.jogos = jogos;
        this.idUsuario = idUsuario;
    }
    getIdPlaylist(): number {
        return this.idPlaylist;
    }
    getCategoria(): string {
        return this.categoria;
    }
    getPlataforma(): string {
        return this.plataforma;
    }
    getJogos(): Jogo[] {
        return this.jogos;
    }
    getIdUsuario(): number {
        return this.idUsuario;
    }


    setIdPlaylist(idPlaylist: number): void {
        this.idPlaylist = idPlaylist;
    }
    setCategoria(categoria: string): void {
        this.categoria = categoria;
    }
    setPlataforma(plataforma: string): void {
        this.plataforma = plataforma;
    }
    setJogo(jogo: Jogo,pos:number): void {
        this.jogos[pos] = jogo;
    }
    setJogos(jogo: Jogo): void {
        this.jogos.push(jogo);
    }
    setIdUsuario(idUsuario: number): void {
        this.idUsuario = idUsuario;
    }


}
export default Playlist;