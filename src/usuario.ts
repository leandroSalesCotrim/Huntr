class Usuario {
    private idUsuario: number;
    private login: string;
    private senha: string;
    private email: string;
    private iconeUrl: string;

    constructor(idUsuario: number, login: string, senha: string, email: string, iconeUrl: string) {
        this.idUsuario = idUsuario;
        this.login = login;
        this.senha = senha;
        this.email = email;
        this.iconeUrl = iconeUrl;
    }
    getIdUsuario(): number {
        return this.idUsuario;
    }
    getLogin(): string {
        return this.login;
    }
    getSenha(): string {
        return this.senha;
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
    setEmail(email: string): void {
        this.email = email;
    }
    setIconeUrl(iconeUrl: string): void {
        this.iconeUrl = iconeUrl;
    }


}
export default Usuario;