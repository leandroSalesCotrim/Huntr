class Adm {
    private idAdm: number;
    private login: string;
    private senha: string;
    private email: string;

    constructor(idAdm: number, login: string, senha: string, email: string) {
        this.idAdm = idAdm;
        this.login = login;
        this.senha = senha;
        this.email = email;
    }
    getIdAdm(): number {
        return this.idAdm;
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


    setIdAdm(idAdm: number): void {
        this.idAdm = idAdm;
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


}
export default Adm;