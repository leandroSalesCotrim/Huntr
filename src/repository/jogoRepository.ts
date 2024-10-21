import { collection, getDocs, query, where, addDoc} from 'firebase/firestore';
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
    iconeUrl: string;
    tempoParaPlatinar: number;
    bundle: boolean;
    serialJogo: string;
    jogos?: JogoData[]; // Para jogos dentro de um bundle
}

class JogoRepository {
    private collectionName = 'jogos';

    async verificarJogoExiste(nomeJogo: string): Promise<boolean> {
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

                        //foreach para cado jogo dentro do bundle
                        dataBundle.jogos.forEach(jogo => {
                            const trofeus = jogo.trofeus.map((trofeuData: TrofeuData) => new Trofeu(
                                trofeuData.idTrofeu,
                                trofeuData.nome,
                                trofeuData.descricao,
                                "NECESSARIO CORRIGIR APOS RESGATAR O VALOR DO BANCO",
                                trofeuData.tipo,
                                trofeuData.oculto,
                                trofeuData.iconeUrl,
                                trofeuData.tags,
                                true,//campo "obtido", deve ser atualizado após ser resgatado 
                                trofeuData.taxaConquistado,
                                trofeuData.raridade
                            ));

                            const jogoDoBundle = new Jogo(
                                jogo.nome,
                                jogo.tempoParaPlatinar,
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
                            dataBundle.tempoParaPlatinar,
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
                        "NECESSARIO CORRIGIR APOS RESGATAR O VALOR DO BANCO",
                        trofeuData.tipo,
                        trofeuData.oculto,
                        trofeuData.iconeUrl,
                        trofeuData.tags,
                        true,//campo "obtido", deve ser atualizado após ser resgatado 
                        trofeuData.taxaConquistado,
                        trofeuData.raridade
                    ));

                    const jogo = new Jogo(
                        dataJogo.nome,
                        dataJogo.tempoParaPlatinar,
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


}

export default JogoRepository;
