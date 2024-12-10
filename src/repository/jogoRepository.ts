import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../../src/database/firebaseConfig';
import Jogo from '../models/jogoModel';
import Trofeu from '../models/trofeuModel';
interface TrofeuData {
    idTrofeu: number;
    nome: string;
    descricao: string;
    guia: string;
    tipo: string;
    oculto: boolean;
    taxaConquistado: number;
    raridade: number;
    iconeUrl: string;
    tags: string[];
}

interface JogoData {
    nome: string;
    plataforma: string;
    tempoParaPlatinar: number;
    iconeUrl: string;
    bundle: boolean;
    serialJogo: string;
    trofeus: TrofeuData[];
    guiaUrl?: string;
    dificuldade?: number;
    progresso?: number;
    npwr?: string;
}
interface BundleData {
    nome: string;
    plataforma: string;
    tags: string[];
    iconeUrl: string;
    tempoParaPlatinar: number;
    bundle: boolean;
    serialJogo: string;
    jogos?: JogoData[]; // Para jogos dentro de um bundle
}

class JogoRepository {
    private collectionName = 'jogos';

    async buscaJogoNoBanco(nomeJogo: string): Promise<boolean> {
        try {
            const jogosCollection = collection(db, this.collectionName);
            const q = query(jogosCollection, where('nome', '==', nomeJogo));
            const querySnapshot = await getDocs(q);

            return !querySnapshot.empty;
        } catch (error) {
            console.error('Erro ao verificar se o jogo existe: ', error);
            throw error;
        }
    }

    async inserirJogoNoBanco(jogo: Jogo): Promise<void> {
        try {
            // Supondo que getTrofeus retorna um array de objetos Trofeu
            const trofeusArray = jogo.getTrofeus().map(trofeu => ({
                idTrofeu: trofeu.getIdTrofeu(),
                nome: trofeu.getNome(),
                descricao: trofeu.getDescricao(),
                tipo: trofeu.getTipo(),
                iconeUrl: trofeu.getIconeUrl(),
                guiaUrl: trofeu.getGuia(),
                oculto: trofeu.getOculto(),
                raridade: trofeu.getRaridade(),
                taxaConquistado: trofeu.getTaxaConquistado(),
                tags: trofeu.getTags(),
            }));


            const jogosCollection = collection(db, this.collectionName);
            await addDoc(jogosCollection, {
                npwr: jogo.getNpwr(),
                serialJogo: jogo.getSerialJogo(),
                nome: jogo.getNome(),
                trofeus: trofeusArray,
                iconeUrl: jogo.getIconeUrl(),
                guiaUrl: jogo.getGuiaUrl(),
                bundle: jogo.getBundle(),
                dificuldade: jogo.getDificuldade(),
                tempoParaPlatinar: jogo.getTempoParaPlatinar(),
            });
        } catch (error) {
            console.error('Erro ao inserir jogo: ', error);
            throw error;
        }
    }


    async inserirBundleNoBanco(jogo: Jogo): Promise<void> {
        try {
            // Supondo que getTrofeus retorna um array de objetos Trofeu
            const jogosArray = jogo.getJogos().map(jogo => ({
                npwr: jogo.getNpwr(),
                serialJogo: jogo.getSerialJogo(),
                nome: jogo.getNome(),
                iconeUrl: jogo.getIconeUrl(),
                guiaUrl: jogo.getGuiaUrl(),
                dificuldade: jogo.getDificuldade(),
                tempoParaPlatinar: jogo.getTempoParaPlatinar(),
                trofeus: jogo.getTrofeus().map(trofeu => ({
                    idTrofeu: trofeu.getIdTrofeu(),
                    nome: trofeu.getNome(),
                    descricao: trofeu.getDescricao(),
                    tipo: trofeu.getTipo(),
                    iconeUrl: trofeu.getIconeUrl(),
                    guiaUrl: trofeu.getGuia(),
                    oculto: trofeu.getOculto(),
                    raridade: trofeu.getRaridade(),
                    taxaConquistado: trofeu.getTaxaConquistado(),
                    tags: trofeu.getTags(),
                }))
            }));

            const jogosCollection = collection(db, this.collectionName);
            await addDoc(jogosCollection, {
                serialJogo: jogo.getSerialJogo(),
                nome: jogo.getNome(),
                iconeUrl: jogo.getIconeUrl(),
                bundle: jogo.getBundle(),
                tempoParaPlatinar: jogo.getTempoParaPlatinar(),
                jogos: jogosArray
            });
        } catch (error) {
            console.error('Erro ao inserir Bundle: ', error);
            throw error;
        }
    }

    async obterJogoPorSerial(serialJogo: string): Promise<Jogo | undefined> {
        const jogosCollection = collection(db, 'jogos'); // Substitua 'jogos' pelo nome da sua coleção
        const q = query(jogosCollection, where('serialJogo', '==', serialJogo));
        try {
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const docSnapshot = querySnapshot.docs[0];
                let queryData = docSnapshot.data();
                if (queryData.bundle) {
                    const dataBundle = queryData as BundleData


                    // Convertendo os dados em uma instância da classe Trofeu
                    if (dataBundle.jogos) {
                        const jogosBundle: Array<Jogo> = [];
                        let tagsDoBundle: string[] = [];

                        //foreach para cado jogo dentro do bundle
                        dataBundle.jogos.forEach(jogo => {

                            // Adicionar as tags do jogo atual ao array geral de tags
                            const tagsDoJogo = jogo
                                .trofeus
                                .flatMap(trofeu => trofeu.tags);
                            tagsDoBundle = Array.from(new Set([...tagsDoBundle, ...tagsDoJogo]));


                            const trofeus = jogo.trofeus.map((trofeuData: TrofeuData) => new Trofeu(
                                trofeuData.idTrofeu,
                                trofeuData.nome,
                                trofeuData.descricao,
                                "",
                                trofeuData.tipo,
                                trofeuData.oculto,
                                trofeuData.iconeUrl,
                                trofeuData.tags,
                                true,//campo "obtido", deve ser atualizado após ser resgatado 
                                "",
                                trofeuData.taxaConquistado,
                                trofeuData.raridade
                            ));

                            const jogoDoBundle = new Jogo(
                                jogo.nome,
                                jogo.plataforma,
                                jogo.tempoParaPlatinar,
                                tagsDoJogo,
                                jogo.iconeUrl,
                                false,
                                jogo.serialJogo,
                                trofeus,
                                jogo.guiaUrl || '',
                                jogo.dificuldade || 0,
                                999,
                                jogo.npwr || ''
                            );
                            jogosBundle.push(jogoDoBundle);
                        });

                        const bundleJogo = new Jogo(
                            dataBundle.nome,
                            dataBundle.plataforma,
                            dataBundle.tempoParaPlatinar,
                            tagsDoBundle,
                            dataBundle.iconeUrl,
                            true,
                            dataBundle.serialJogo,
                            jogosBundle
                        );

                        return bundleJogo

                    }


                } else {
                    const dataJogo = queryData as JogoData

                    const trofeus = dataJogo.trofeus.map((trofeuData: TrofeuData) => new Trofeu(
                        trofeuData.idTrofeu,
                        trofeuData.nome,
                        trofeuData.descricao,
                        "",
                        trofeuData.tipo,
                        trofeuData.oculto,
                        trofeuData.iconeUrl,
                        trofeuData.tags,
                        true,//campo "obtido", deve ser atualizado após ser resgatado 
                        "",
                        trofeuData.taxaConquistado,
                        trofeuData.raridade
                    ));

                    const jogo = new Jogo(
                        dataJogo.nome,
                        dataJogo.plataforma,
                        dataJogo.tempoParaPlatinar,
                        [],
                        dataJogo.iconeUrl,
                        dataJogo.bundle,
                        dataJogo.serialJogo || '',
                        trofeus,
                        dataJogo.guiaUrl || '',
                        dataJogo.dificuldade || 0,
                        dataJogo.progresso || 0,
                        dataJogo.npwr || ''
                    );

                    return jogo

                }
            } else {
                console.log('Nenhum documento encontrado com o serialJogo fornecido!');
                return undefined;
            }
        } catch (error) {
            console.error('Erro ao recuperar o jogo: ', error);
            throw error;
        }
    }

    //função que trás uma lista de jogos encontrado no banco com o nome informado
    async buscarJogoPorNome(nomeJogo: string): Promise<Jogo | undefined> {
        try {
            const collectionName = 'jogos';
            const jogosCollection = collection(db, collectionName);

            // Query usando o prefixo nome_normalizado com startAt() e endAt()
            const q = query(jogosCollection, where('nome', '==', nomeJogo));

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                let jogoEncontrado: Jogo;
                if (querySnapshot.docs.length == 1) {
                    let queryData = querySnapshot.docs[0].data();

                    //verificando se é bundle ou não
                    if (queryData.bundle) {
                        const dataBundle = queryData as BundleData

                        // Convertendo os dados em uma instância da classe Trofeu
                        if (dataBundle.jogos) {
                            const jogosBundle: Array<Jogo> = [];
                            let tagsDoBundle: string[] = [];

                            //foreach para cado jogo dentro do bundle
                            dataBundle.jogos.forEach(jogo => {
                                // Adicionar as tags do jogo atual ao array geral de tags
                                const tagsDoJogo = Array.from(new Set(jogo.trofeus.flatMap(trofeu => trofeu.tags)));

                                // Atualizar as tags do bundle com as tags únicas do jogo
                                tagsDoBundle = Array.from(new Set([...tagsDoBundle, ...tagsDoJogo]));

                                const trofeus = jogo.trofeus.map((trofeuData: TrofeuData) => new Trofeu(
                                    trofeuData.idTrofeu,
                                    trofeuData.nome,
                                    trofeuData.descricao,
                                    trofeuData.guia,
                                    trofeuData.tipo,
                                    trofeuData.oculto,
                                    trofeuData.iconeUrl,
                                    trofeuData.tags,
                                    false,//campo "obtido", deve ser atualizado após ser resgatado 
                                    "",
                                    trofeuData.taxaConquistado,
                                    trofeuData.raridade
                                ));

                                const jogoDoBundle = new Jogo(
                                    jogo.nome,
                                    jogo.plataforma, // url do guia de troféus
                                    jogo.tempoParaPlatinar,
                                    tagsDoJogo,
                                    jogo.iconeUrl,
                                    false,
                                    jogo.serialJogo,
                                    trofeus,
                                    jogo.guiaUrl || '',
                                    jogo.dificuldade || 0,
                                    0,
                                    jogo.npwr || ''
                                );
                                jogosBundle.push(jogoDoBundle);
                            });

                            const bundleJogo = new Jogo(
                                dataBundle.nome,
                                dataBundle.plataforma, // url do guia de troféus
                                dataBundle.tempoParaPlatinar,
                                tagsDoBundle,
                                dataBundle.iconeUrl,
                                true,
                                dataBundle.serialJogo,
                                jogosBundle
                            );

                            jogoEncontrado = bundleJogo;
                            return jogoEncontrado;
                        }
                    } else {
                        const dataJogo = queryData as JogoData

                        const trofeus = dataJogo.trofeus.map((trofeuData: TrofeuData) => new Trofeu(
                            trofeuData.idTrofeu,
                            trofeuData.nome,
                            trofeuData.descricao,
                            trofeuData.guia,
                            trofeuData.tipo,
                            trofeuData.oculto,
                            trofeuData.iconeUrl,
                            trofeuData.tags,
                            false,//campo "obtido", deve ser atualizado após ser resgatado 
                            "",
                            trofeuData.taxaConquistado,
                            trofeuData.raridade
                        ));

                        const jogo = new Jogo(
                            dataJogo.nome,
                            dataJogo.plataforma,
                            dataJogo.tempoParaPlatinar,
                            [],
                            dataJogo.iconeUrl,
                            dataJogo.bundle,
                            dataJogo.serialJogo || '',
                            trofeus,
                            dataJogo.guiaUrl || '',
                            dataJogo.dificuldade || 0,
                            0,
                            dataJogo.npwr || ''
                        );

                        jogoEncontrado = jogo;
                        return jogoEncontrado;
                    }
                }

            } else {
                console.log('Nenhum documento encontrado com o serialJogo fornecido!');
                return undefined;
            }
        } catch (error) {
            console.error('Erro ao buscar os jogos: ', error);
            throw error;
        }
    }

}

export default JogoRepository;
