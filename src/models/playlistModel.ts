import Jogo from "./jogoModel";

class Playlist {
    private idPlaylist: number = 0;
    private categoria: string;
    private plataforma: string;
    private jogos: Jogo[];
    private idUsuario: number;

    constructor( categoria: string, plataforma: string, jogos: Jogo[], idUsuario: number) {
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