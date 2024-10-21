import Trofeu from "./trofeuModel";


class Jogo {
    private idJogo?: number;// vai ser necessário este id pois alguns jogos não possuem o serial, e alguns jogos possuem npwr que são
    // mais dificeis/impossiveis de conseguir sem uma boa base de dados
    private npwr: string = ""; //mesmo que o jogo possua diferentes versões/serialId em diferentes regiões a lista de troféus
    // aparenta ser sempre a mesma, por exemplo, minecraft na versão americana (CUSA) e japonesa (PCJS) compartilham da mesma
    // lista de troféus NPWR_05706 não sei se isso pode ser influenciado também pela conta da psn em que vc joga o jogo

    private serialJogo: string = "";
    // cada versão do jogo possui um serial do produto, que pode mudar dependendo se for midia fisica
    // digital, e principalmente pode ser afetado pela região do produto
    // alguns jogos não possuem este serial por pertencerem a um bundle como acontece como devil may cry 1 2 3 da HD collection,
    // neste caso o serial seria o mesmo do bundle, o que não é uma regra como acontece na colletanea de naruto ultimate ninja storm,
    // acredito que seja assim pois no caso de naruto cada jogo pode ser vendido individuamente na psn, 
    // diferente de devil may cry 1 2 3 que só podem ser adiquiridos através da hd collection
    // o que torna o serial inviavel para se tornar um indentifcador dos jogos

    private nome: string;
    private progresso: number = 0;
    private trofeus: Trofeu[] = [];
    private iconeUrl: string;
    private guiaUrl: string = "";
    private plataforma: string = "";
    private bundle: boolean;
    private jogos: Jogo[] = [];
    private dificuldade: number = 0;
    private tempoParaPlatinar: number;


    // Assinaturas de sobrecarga dos construtores
    constructor(nome: string, plataforma: string, tempoParaPlatinar: number, iconeUrl: string, bundle: boolean, serialJogo: string, jogos: Jogo[]);
    constructor(nome: string, plataforma: string, tempoParaPlatinar: number, iconeUrl: string, bundle: boolean, serialJogo: string, trofeus: Trofeu[], guiaUrl: string, dificuldade: number, progresso: number, npwr: string);
    //se for do tipo bundle vai ser assim
    // Construtor real
    constructor(
        nome: string,
        plataforma: string,
        tempoParaPlatinar: number,
        iconeUrl: string,
        bundle: boolean,
        serialJogo?: string,
        jogosOuTrofeus?: Jogo[] | Trofeu[],
        guiaUrl?: string,
        dificuldade?: number,
        progresso?: number,
        npwr?: string,
    ) {
        this.nome = nome;
        this.plataforma = plataforma || "";
        this.tempoParaPlatinar = tempoParaPlatinar;
        this.iconeUrl = iconeUrl;
        this.bundle = bundle;
        this.serialJogo = serialJogo || "";

        if (Array.isArray(jogosOuTrofeus)) {
            // Verificar se o array contém objetos de tipo Jogos ou Trofeu
            if (bundle) {
                // Se for do tipo bundle, inicializa com jogos
                if (Array.isArray(jogosOuTrofeus)) {
                    this.jogos = jogosOuTrofeus as Jogo[];
                }
            } else {
                // Se não for do tipo bundle, inicializa com troféus
                if (Array.isArray(jogosOuTrofeus)) {
                    this.trofeus = jogosOuTrofeus as Trofeu[];
                    this.guiaUrl = guiaUrl || "";
                    this.dificuldade = dificuldade || 0;
                    this.progresso = progresso || 0;
                    this.npwr = npwr || "";
                }
            }
        }
    }
    getIdJogo(): number | undefined {
        return this.idJogo;
    }
    getSerialJogo(): string {
        return this.serialJogo;
    }
    getNpwr(): string {
        return this.npwr;
    }
    getNome(): string {
        return this.nome;
    }
    getProgresso(): number {
        return this.progresso;
    }
    getTrofeus(): Trofeu[] {
        return this.trofeus;
    }
    getIconeUrl(): string {
        return this.iconeUrl;
    }
    getGuiaUrl(): string {
        return this.guiaUrl;
    }
    getPlataforma(): string {
        return this.plataforma;
    }
    getBundle(): boolean {
        return this.bundle;
    }
    getJogos(): Jogo[] {
        return this.jogos;
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
    setSerialJogo(serialJogo: string): void {
        this.serialJogo = serialJogo;
    }
    setNpwr(npwr: string): void {
        this.npwr = npwr;
    }
    setNome(nome: string): void {
        this.nome = nome;
    }
    setProgresso(progresso: number): void {
        this.progresso = progresso;
    }
    setTrofeu(trofeu: Trofeu, pos: number): void {
        this.trofeus[pos] = trofeu;
    }
    setTrofeus(trofeu: Trofeu): void {
        this.trofeus.push(trofeu);
    }
    setIconeUrl(iconeUrl: string): void {
        this.iconeUrl = iconeUrl;
    }
    setGuiaUrl(guiaUrl: string): void {
        this.guiaUrl = guiaUrl;
    }
    setPlataforma(plataforma: string): void {
        this.plataforma = plataforma;
    }
    setBundle(bundle: boolean): void {
        this.bundle = bundle;
    }
    setJogos(jogos: Jogo): void {
        this.jogos.push(jogos);
    }
    setDificuldade(dificuldade: number): void {
        this.dificuldade = dificuldade;
    }
    setTempoParaPlatinar(tempoParaPlatinar: number): void {
        this.tempoParaPlatinar = tempoParaPlatinar;
    }



}
export default Jogo;