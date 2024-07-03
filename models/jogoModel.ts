import Trofeu from "./trofeuModel";


class Jogo {
    private idJogo: number;
    private nome: string;
    private progresso: string;
    private trofeus: Trofeu[];
    private tags: string[];
    private iconeUrl: string;
    private dificuldade: number;
    private tempoParaPlatinar: number;

    constructor(idJogo: number, nome: string, progresso: string, trofeus: Trofeu[], tags: string[], dificuldade: number, tempoParaPlatinar: number, iconeUrl: string) {
        this.idJogo = idJogo;
        this.nome = nome;
        this.progresso = progresso;
        this.trofeus = trofeus;
        this.tags = tags;
        this.iconeUrl = iconeUrl;
        this.dificuldade = dificuldade;
        this.tempoParaPlatinar = tempoParaPlatinar;
    }
    getIdJogo(): number {
        return this.idJogo;
    }
    getNome(): string {
        return this.nome;
    }
    getProgresso(): string {
        return this.progresso;
    }
    getTrofeus(): Trofeu[] {
        return this.trofeus;
    }
    getTags(): string[] {
        return this.tags;
    }
    getIconeUrl(): string {
        return this.iconeUrl;
    }
    getDificuldade(): number {
        return this.dificuldade;
    }
    getTempoParaPlatinar(): number {
        return this.tempoParaPlatinar;
    }
    
    


    setIdJogo(idJogo: number): void {
        this.idJogo = idJogo;
    }
    setNome(nome: string): void {
        this.nome = nome;
    }
    setProgresso(progresso: string): void {
        this.progresso = progresso;
    }
    setTrofeu(trofeu: Trofeu,pos:number): void {
        this.trofeus[pos] = trofeu;
    }
    setTrofeus(trofeu: Trofeu): void {
        this.trofeus.push(trofeu);
    }
    setIconeUrl(iconeUrl: string): void {
        this.iconeUrl = iconeUrl;
    }


}
export default Jogo;