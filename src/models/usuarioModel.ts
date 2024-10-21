class Usuario {
    private idUsuario?: number;
    private login: string;
    private senha: string;
    private nascimento: Date;
    private pais: string;
    private email: string;
    private iconeUrl: string;

    constructor( login: string, senha: string, nascimento: Date, pais: string, email: string, iconeUrl: string) {
        this.login = login;
        this.senha = senha;
        this.nascimento = nascimento;
        this.pais = pais;
        this.email = email;
        this.iconeUrl = iconeUrl;
    }
    getIdUsuario(): number | undefined {
        return this.idUsuario;
    }
    getLogin(): string {
        return this.login;
    }
    getSenha(): string {
        return this.senha;
    }
    getNascimento(): Date {
        return this.nascimento;
    }
    getPais(): string {
        return this.pais;
    }
    getEmail(): string {
        return this.email;
    }
    getIconeUrl(): string {
        return this.iconeUrl;
    }


    setIdUsuario(idUsuario: number): void {
        this.idUsuario = idUsuario;
    }
    setLogin(login: string): void {
        this.login = login;
    }
    setSenha(senha: string): void {
        this.senha = senha;
    }
    setNascimento(nascimento: Date): void {
        this.nascimento = nascimento;
    }
    setPais(pais: string): void {
        this.pais = pais;
    }
    setEmail(email: string): void {
        this.email = email;
    }
    setIconeUrl(iconeUrl: string): void {
        this.iconeUrl = iconeUrl;
    }


}
export default Usuario;