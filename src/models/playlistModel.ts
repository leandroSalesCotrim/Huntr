import Jogo from "./jogoModel";

class Playlist {
    private idPlaylist?: number;
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
    getIdPlaylist(): number | undefined {
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
    pushJogo(jogo: Jogo): void {
        const index = this.jogos.findIndex(j => j.getNome() === jogo.getNome());
        if (index !== -1) {
            console.log("Não é possível adicionar um jogo repetido na playlist");
        } else {
            this.jogos.push(jogo);
        }
    }
    removeJogo(jogo: Jogo): void {
        const index = this.jogos.findIndex(j => j === jogo);
        if (index !== -1) {
            this.jogos.splice(index, 1); // Remove o jogo no índice encontrado
        }
    }
    setIdUsuario(idUsuario: number): void {
        this.idUsuario = idUsuario;
    }

    // toJSON(): object {
    //     console.log("teste toJSON")
    //     console.log("toJSON de playlist chamado: "+
    //         this.idPlaylist,
    //         this.categoria,
    //         this.plataforma,
    //         this.jogos.map(j => j.toJSON()),
    //         this.idUsuario,
    //     )
    //     return {
    //         idPlaylist: this.idPlaylist,
    //         categoria: this.categoria,
    //         plataforma: this.plataforma,
    //         jogos: this.jogos.map(j => j.toJSON()),
    //         idUsuario: this.idUsuario,
    //     };
    // }

    // static fromJSON(data: any): Playlist {
    //     console.log("fromJSON Playlist valores : "+ data);
    //     const playlist = new Playlist(data.categoria, data.plataforma, data.jogos.map((j: any) => Jogo.fromJSON(j)), data.idUsuario);
    //     playlist.idPlaylist = data.idPlaylist;
    //     return playlist;
    // }


}
export default Playlist;