class Trofeu {
    private idTrofeu: number;
    private nome: string;
    private descricao: string;
    private tipo: string;
    private oculto: boolean;
    private conquistado: boolean;
    private taxaConquistado: number;
    private raridade: number;
    private iconeUrl: string;
    private categoria: string;

    constructor
    (
        idTrofeu: number, nome: string, descricao: string, tipo: string,oculto: boolean,
        conquistado: boolean, taxaConquistado: number, raridade: number, iconeUrl: string, categoria: string
    ){

        this.idTrofeu = idTrofeu;
        this.nome = nome;
        this.descricao = descricao;
        this.tipo = tipo;
        this.oculto = oculto;
        this.conquistado = conquistado;
        this.taxaConquistado = taxaConquistado;
        this.raridade = raridade;
        this.iconeUrl = iconeUrl;
        this.categoria = categoria;
    }
    getIdTrofeu(): number {
        return this.idTrofeu;
    }
    getNome(): string {
        return this.nome;
    }
    getDescricao(): string {
        return this.descricao;
    }
    getTipo(): string {
        return this.tipo;
    }
    getOculto(): boolean {
        return this.oculto;
    }
    getConquistado(): boolean {
        return this.conquistado;
    }
    getTaxaConquistado(): number {
        return this.taxaConquistado;
    }
    getRaridade(): number {
        return this.raridade;
    }
    getIconeUrl(): string {
        return this.iconeUrl;
    }
    getCategoria(): string {
        return this.categoria;
    }


    setIdTrofeu(idTrofeu: number): void {
        this.idTrofeu = idTrofeu;
    }
    setNome(nome: string): void {
        this.nome = nome;
    }
    setDescricao(descricao: string): void {
        this.descricao = descricao;
    }
    setTipo(tipo: string): void {
        this.tipo = tipo;
    }
    setOculto(oculto: boolean): void {
        this.oculto = oculto;
    }
    setConquistado(conquistado: boolean): void {
        this.conquistado = conquistado;
    }
    setTaxaConquistado(TaxaConquistado: number): void {
        this.taxaConquistado = TaxaConquistado;
    }
    setRaridade(raridade: number): void {
        this.raridade = raridade;
    }
    setIconeUrl(iconeUrl: string): void {
        this.iconeUrl = iconeUrl;
    }
    setCategoria(categoria: string): void {
        this.categoria = categoria;
    }


}
export default Trofeu;