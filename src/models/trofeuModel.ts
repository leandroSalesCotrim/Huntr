class Trofeu {
    private idTrofeu: number;
    private nome: string;
    private descricao: string;
    private guia: string;
    private tipo: string;
    private oculto: boolean;
    private conquistado: boolean;
    private dataConquistado: Date | null;
    private taxaConquistado: number;
    private raridade: number;
    private iconeUrl: string;
    private tags: string[];

    constructor(idTrofeu: number, nome: string, descricao: string, guia: string, tipo: string, oculto: boolean, iconeUrl: string, tags: string[]);
    constructor(idTrofeu: number, nome: string, descricao: string, guia: string, tipo: string, oculto: boolean, iconeUrl: string, tags: string[], conquistado: boolean, dataConquistado: string, taxaConquistado: number, raridade: number);

    constructor
        (
            idTrofeu: number,
            nome: string,
            descricao: string,
            guia: string,
            tipo: string,
            oculto: boolean,
            iconeUrl: string,
            tags: string[],
            conquistado?: boolean,
            dataConquistado: string | null = null,
            taxaConquistado?: number,
            raridade?: number,
        ) {

        this.idTrofeu = idTrofeu;
        this.nome = nome;
        this.descricao = descricao;
        this.guia = guia;
        this.tipo = tipo;
        this.oculto = oculto;
        this.iconeUrl = iconeUrl;
        this.tags = tags;
        this.conquistado = conquistado || false;
        this.dataConquistado = dataConquistado ? new Date(dataConquistado) : null;
        this.taxaConquistado = taxaConquistado || 0;
        this.raridade = raridade || 0;
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
    getGuia(): string {
        return this.guia;
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
    getDataConquistado(): Date | null {
        return this.dataConquistado;
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
    getTags(): string[] {
        return this.tags;
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
    setGuia(guia: string): void {
        this.guia = guia;
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
    setDataConquistado(dataConquistado: Date | null): void {
        this.dataConquistado = dataConquistado;
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
    setTags(tags: string[]): void {
        this.tags = tags;
    }


    toJSON(): object {
        return {
            idTrofeu: this.idTrofeu,
            nome: this.nome,
            descricao: this.descricao,
            guia: this.guia,
            tipo: this.tipo,
            oculto: this.oculto,
            conquistado: this.conquistado,
            dataConquistado: this.dataConquistado?.toISOString() || null,
            taxaConquistado: this.taxaConquistado,
            raridade: this.raridade,
            iconeUrl: this.iconeUrl,
            tags: this.tags,
        };
    }

    static fromJSON(data: any): Trofeu {
        return new Trofeu(
            data.idTrofeu,
            data.nome,
            data.descricao,
            data.guia,
            data.tipo,
            data.oculto,
            data.iconeUrl,
            data.tags,
            data.conquistado,
            data.dataConquistado,
            data.taxaConquistado,
            data.raridade
        );
    }

}
export default Trofeu;