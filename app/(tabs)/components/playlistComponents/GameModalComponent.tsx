// app/components/GameModalComponent.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, } from 'react-native';
import {
    useFonts,
    Inter_400Regular,
    Inter_700Bold,
} from '@expo-google-fonts/inter'
import { SplashScreen } from 'expo-router';
import Jogo from '@/src/models/jogoModel';
import Svg, { G, Circle, Path, Defs, Rect, ClipPath } from 'react-native-svg';
import GameCardTrophyComponent from './GameCardTrophyComponent';
import GameCardDefaultComponent from './GameCardDefaultComponent';
import { ScrollView } from 'react-native-gesture-handler';

interface GameModalComponentProps {
    visible: boolean;
    onClose: () => void;
    moverJogo: (jogo: Jogo) => void;
    jogo: Jogo | null; // Jogo passado como prop
    tela: string; // nome da tela que será usada a modal
}

const GameModalComponent: React.FC<GameModalComponentProps> = ({ visible, onClose, jogo, tela, moverJogo }) => {
    const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold });
    const [selectedGame, setSelectedGame] = useState<Jogo | null>(null);
    let textoBtns: string = "";
    const productType: string = jogo?.getBundle() ? "bundle" : "jogo";

    if (tela == "recentes") {
        textoBtns = "Deseja adicionar este " + productType + " a sua lista para platinar?"
    } else if (tela == "platinando") {
        textoBtns = "Deseja remover este " + productType + " da sua caçada?"
    }

    if(jogo?.getProgresso() == 100){
        textoBtns = "Este jogo já foi platinado!"
    }

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return <ActivityIndicator size="large" color="#0000ff" />; // Ou outro indicador de carregamento
    }

    if (!jogo) return null; // Se não houver jogo, não renderiza nada

    const adicionarNaPlaylistHandle = () =>{
        moverJogo(jogo)
        onClose();
    }

    const closeModal = () => {
        onClose();
        setSelectedGame(null); // Reseta o jogo selecionado ao fechar a modal
    };

    const handleGameCardPress = (jogo: Jogo) => {
        setSelectedGame(jogo);
    };

    const qtdJogos = jogo.getJogos().length
    let alturaScrollView = 450;
    if (qtdJogos == 1) {
        alturaScrollView = 230
    } else if (qtdJogos > 2) {
        alturaScrollView = 600
    }

    return (
        <Modal visible={visible} transparent={true} animationType="slide" statusBarTranslucent>
            <View style={styles.modalContainerBackground} >

            {selectedGame ? (
                    // Renderiza o componente relacionado ao jogo selecionado
                    <GameCardTrophyComponent key={selectedGame.getNome()} jogo={selectedGame} onClose={closeModal} />
                ) : jogo.getBundle() ? (
                    <>
                        <Text style={styles.title}>Escolha um jogo do bundle para continuar</Text>
                        <ScrollView style={{ width: "100%", maxHeight: alturaScrollView }}>
                            {jogo.getJogos().map((jogo) => (
                                <GameCardDefaultComponent
                                    key={jogo.getNome()}
                                    jogo={jogo}
                                    openModal={handleGameCardPress}
                                />
                            ))}
                        </ScrollView>
                    </>
                ) : (
                    // Renderiza o componente padrão se não for um bundle
                    <GameCardTrophyComponent key={jogo.getNome()} jogo={jogo} onClose={closeModal} />
                )}


                <View style={styles.containerBtn}>

                    <Text style={styles.confirmText}>{textoBtns}</Text>

                    <View style={styles.boxBtnConfirmar}>
                        {tela.includes("concluidos") || jogo.getBundle() || jogo.getProgresso() == 100 ? (
                            <TouchableOpacity style={styles.btnConfirmar} onPress={closeModal}>
                                <Svg width="50" height="50" viewBox="0 0 50 50" fill="none">
                                    <Circle cx="25" cy="25" r="24" fill="#1D1F2E" />
                                    <Defs>
                                        <ClipPath id="clip0_65_3060">
                                            <Rect width="50" height="50" fill="white" />
                                        </ClipPath>
                                    </Defs>
                                    <G clipPath="url(#clip0_65_3060)">
                                        <Circle cx="25" cy="25" r="24" stroke="#D65C5C" strokeWidth="2" />
                                        <Circle cx="25" cy="25" r="12" stroke="#D65C5C" strokeWidth="3" />
                                    </G>
                                </Svg>

                                <Text style={styles.confirmText}>Cancelar</Text>
                            </TouchableOpacity>
                        ) : (
                            <>
                                <TouchableOpacity style={styles.btnConfirmar} onPress={adicionarNaPlaylistHandle}>
                                    <Svg width="50" height="50" viewBox="0 0 50 50" fill="none">
                                        <G clipPath="url(#clip0_65_3058)">
                                            <Circle cx="25" cy="25" r="24" fill="#1C1F2A" stroke="#8290BA" strokeWidth="2" />
                                            <Path d="M15 15L35 35M35 15L15 35" stroke="#8290BA" strokeWidth="3" />
                                        </G>
                                        <Defs>
                                            <ClipPath id="clip0_65_3058">
                                                <Rect width="50" height="50" fill="white" />
                                            </ClipPath>
                                        </Defs>
                                    </Svg>


                                    <Text style={styles.confirmText}>Confirmar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btnConfirmar} onPress={closeModal}>
                                    <Svg width="50" height="50" viewBox="0 0 50 50" fill="none">
                                        <Circle cx="25" cy="25" r="24" fill="#1D1F2E" />
                                        <Defs>
                                            <ClipPath id="clip0_65_3060">
                                                <Rect width="50" height="50" fill="white" />
                                            </ClipPath>
                                        </Defs>
                                        <G clipPath="url(#clip0_65_3060)">
                                            <Circle cx="25" cy="25" r="24" stroke="#D65C5C" strokeWidth="2" />
                                            <Circle cx="25" cy="25" r="12" stroke="#D65C5C" strokeWidth="3" />
                                        </G>
                                    </Svg>

                                    <Text style={styles.confirmText}>Cancelar</Text>
                                </TouchableOpacity>
                            </>
                        )}


                    </View>

                </View>
            </View>
        </Modal >

    );
};


const styles = StyleSheet.create({
    modalContainerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000000CC',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        textAlign: "center",
        fontFamily: "Inter_400Regular",
        fontSize: 16,
        color: "white",
        marginBottom: 20
    },
    containerBtn: {
        backgroundColor: "#D9D9D9",
        width: "100%",
        height: "15%",
        marginTop: "10%",
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 20
    },
    boxBtnConfirmar: {
        width: "100%",
        height: "100%",
        flexDirection: "row",
        justifyContent: "center",
    },
    btnConfirmar: {
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 30
    },
    confirmText: {
        textAlign: "center",
        fontFamily: "Inter_400Regular",
        fontSize: 14,
    }


});

export default GameModalComponent;
