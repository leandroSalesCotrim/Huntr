// app/components/GameModalComponent.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Modal, Animated, Easing } from 'react-native';
import {
    useFonts,
    Inter_400Regular,
    Inter_700Bold,
} from '@expo-google-fonts/inter'
import { SplashScreen, router } from 'expo-router';
import Jogo from '@/src/models/jogoModel';
import CircularChart from './CircularChart';
import { ScrollView } from 'react-native-gesture-handler';
import Svg, { G, Circle, Path, Defs, Rect, ClipPath } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Trofeu from '@/src/models/trofeuModel';

interface GameModalComponentProps {
    visible: boolean;
    onClose: () => void;
    jogo: Jogo | null; // Jogo passado como prop
    tela: string; // nome da tela que será usada a modal
}
type RatingStarsProps = {
    rating: number; // Nota de 0 a 5
    size?: number; // Tamanho das estrelas
    color?: string; // Cor das estrelas
};

const GameModalComponent: React.FC<GameModalComponentProps> = ({ visible, onClose, jogo, tela }) => {
    const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold });
    const [animation] = useState(new Animated.Value(0)); // Valor inicial da animação
    // Calcula estrelas preenchidas e não preenchidas
    const filledStars = Math.floor(4); // Estrelas cheias
    const emptyStars = 5 - filledStars; // Estrelas vazias
    const countBronze = jogo?.getTrofeus().filter(trofeu => trofeu.getTipo() === "bronze").length;
    const countBronzeObtido = jogo?.getTrofeus().filter(trofeu => trofeu.getTipo() === "bronze" && trofeu.getConquistado()).length;
    const countPrata = jogo?.getTrofeus().filter(trofeu => trofeu.getTipo() === "silver").length;
    const countPrataObtido = jogo?.getTrofeus().filter(trofeu => trofeu.getTipo() === "silver" && trofeu.getConquistado()).length;
    const countOuro = jogo?.getTrofeus().filter(trofeu => trofeu.getTipo() === "gold").length;
    const countOuroObtido = jogo?.getTrofeus().filter(trofeu => trofeu.getTipo() === "gold" && trofeu.getConquistado()).length;
    const countPlatina = jogo?.getTrofeus().filter(trofeu => trofeu.getTipo() === "platinum").length;
    const countPlatinaObtido = jogo?.getTrofeus().filter(trofeu => trofeu.getTipo() === "platinum" && trofeu.getConquistado()).length;

    let textoBtns: string = "";

    if (tela == "recentes") {
        textoBtns = "Deseja adicionar este jogo a sua lista para platinar?"
    } else if (tela == "platinando") {
        textoBtns = "Deseja remover este jogo da sua caçada?"
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
    const tags: string[] = Array.from(new Set(jogo.getTrofeus().flatMap(trofeu => trofeu.getTags())));


    const redirecionarParaTrofeus = (jogo: Jogo) => {
        closeModal();
        router.push({
            pathname: '/(tabs)/components/trophyList',
            params: {
                jogo: JSON.stringify(jogo),
            },
        })
    }


    const loopAnimation = Animated.loop(
        Animated.timing(animation, {
            toValue: 1,
            duration: 1000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
        })
    );

    const handlePress = () => {
        // Reinicia a animação
        animation.setValue(0);

        // Inicia a animação em loop
        loopAnimation.start();

        // Para a animação depois de 1 segundo
        setTimeout(() => {
            loopAnimation.stop();
            redirecionarParaTrofeus(jogo);
        }, 1000); // 1 segundo, por exemplo
    };

    // Transforma o valor da animação em escala
    const scale = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 5], // 5 vezes maior que o botão original
    });

    const opacity = animation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 0.5, 0], // Fica transparente ao final
    });

    const closeModal = () => {
        onClose();
    };

    return (
        <Modal visible={visible} transparent={true} animationType="slide" statusBarTranslucent>
            <View style={styles.modalContainerBackground} >
                <View style={styles.container}>

                    <View style={styles.containerGameInfo}>
                        <TouchableOpacity style={styles.imageBox} >
                            {jogo.getIconeUrl() ? (
                                <Image source={{ uri: jogo.getIconeUrl() }} style={styles.gameImage} />
                            ) : (
                                <Image source={require('../../../../assets/images/defaultGameImage.jpg')} style={styles.gameImage} />
                            )}
                        </TouchableOpacity>

                        <View style={styles.detailBox}>
                            <View style={styles.row_1}>
                                <View style={styles.row_1_leftSide}>
                                    <Text style={styles.title} numberOfLines={3} ellipsizeMode="tail">{jogo.getNome()}</Text>
                                    <View style={styles.platformBox}><Text style={styles.darkText}>{jogo.getPlataforma()}</Text></View>
                                </View>

                                <View style={styles.row_1_RightSide}>
                                    <CircularChart percentual={jogo.getProgresso()} tamanho={50} largura={3} />
                                </View>

                            </View>

                            <View style={styles.row_2}>
                                <View style={styles.row_2_leftSide}>
                                    <Text style={styles.lightText}>Tempo para platinar</Text>
                                    <Text style={styles.lightHighLightText}>{jogo.getTempoParaPlatinar()} hora/s</Text>
                                </View>

                                <View style={styles.row_2_RightSide}>
                                    <Text style={styles.lightText}>Dificuldade</Text>
                                    <Text style={styles.lightHighLightText}>{jogo.getDificuldade()}/10</Text>
                                </View>

                            </View>

                            <View style={styles.row_3}>
                                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
                                    {tags.map((tag, index) => (
                                        <View
                                            style={styles.tagBox}
                                            key={index}
                                        >
                                            <Text style={styles.darkText}>{tag}</Text>
                                        </View>
                                    ))}
                                </ScrollView>


                            </View>

                        </View>
                    </View>

                    <View style={styles.containerTrophyDetails}>
                        <LinearGradient
                            colors={['#008E87', '#08BFB5', '#08BFB5']}
                            start={{ x: 1, y: 0 }} // Ponto inicial à direita
                            end={{ x: 0, y: 0 }}   // Ponto final à esquerda
                            style={styles.content}>
                            <Text style={styles.titleTrophy}>Sua caçada até aqui...</Text>
                            <View style={styles.boxTrophyIcons}>
                                <View style={styles.boxTrophy}>
                                    <Image source={require('../../../../assets/images/trofeu-platina.png')} style={styles.trophyImage} />
                                    <Text style={styles.trophyText}>{countPlatinaObtido}/{countPlatina}</Text>
                                </View>
                                <View style={styles.boxTrophy}>
                                    <Image source={require('../../../../assets/images/trofeu-ouro.png')} style={styles.trophyImage} />
                                    <Text style={styles.trophyText}>{countOuroObtido}/{countOuro}</Text>
                                </View>
                                <View style={styles.boxTrophy}>
                                    <Image source={require('../../../../assets/images/trofeu-prata.png')} style={styles.trophyImage} />
                                    <Text style={styles.trophyText}>{countPrataObtido}/{countPrata}</Text>
                                </View>
                                <View style={styles.boxTrophy}>
                                    <Image source={require('../../../../assets/images/trofeu-bronze.png')} style={styles.trophyImage} />
                                    <Text style={styles.trophyText}>{countBronzeObtido}/{countBronze}</Text>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.boxTrophyBtn} onPress={handlePress} >

                                <Image source={require('../../../../assets/images/triangle-arrow.png')} style={styles.boxTrophyBtnImg} />
                                <Animated.View
                                    style={[
                                        styles.animatedCircle,
                                        {
                                            transform: [{ scale }],
                                            opacity,
                                        },
                                    ]}
                                />

                            </TouchableOpacity>

                        </LinearGradient>
                    </View>
                    <View style={styles.containerTrophyGuideDetails}>


                        <View style={styles.rowTrophyGuide}>
                            <View style={styles.TrophyGuideTextBox}>
                                <Text style={styles.textTrophyGuide}>Responsável pelo guia</Text>
                                <Text style={styles.highLightTextTrophyGuide}>Nome do responsável</Text>
                            </View>

                            <View style={styles.TrophyGuideChartBox}>
                                <View style={styles.chartTitleBox}>
                                    <Text style={styles.highLightTextTrophyGuide}>Usuarios que platinaram</Text>
                                </View>
                                <CircularChart percentual={jogo.getTrofeus()[0].getTaxaConquistado()} tamanho={50} largura={3} />
                            </View>

                        </View>

                        <View style={styles.rowTrophyGuide}>
                            <View style={styles.TrophyGuideTextBox}>
                                <Text style={styles.textTrophyGuide}>Visualiazações</Text>
                                <Text style={styles.highLightTextTrophyGuide}>0.000.000 views</Text>
                            </View>

                            <View style={styles.TrophyGuideTextBox}>
                                <Text style={styles.textTrophyGuide}>X avaliações</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    {[...Array(5)].map((_, index) => (
                                        <Ionicons
                                            key={index}
                                            name={index < 4 ? 'star' : 'star-outline'} // Ícones preenchidos ou contornados
                                            size={24}
                                            color="#FFD700" // Cor dourada para as estrelas
                                        />
                                    ))}
                                </View>
                            </View>

                        </View>
                        <View style={styles.boxReport}>
                            <Text style={styles.textLink}>Guia desatualizado?</Text>

                            <Text style={styles.textLink}><Text style={styles.link} onPress={handlePress}> Clique aqui </Text>para solicitar a atualização.
                            </Text>
                        </View>

                    </View>


                </View>
                <View style={styles.containerBtn}>

                    <Text style={styles.confirmText}>{textoBtns}</Text>

                    <View style={styles.boxBtnConfirmar}>
                        {tela.includes("concluidos") ? (
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
                                <TouchableOpacity style={styles.btnConfirmar}>
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
    container: {
        width: "100%",
        height: "60%",

    },
    containerGameInfo: {
        display: "flex",
        width: "100%",
        height: 212,
        backgroundColor: "#1D1F2E",
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
    },
    imageBox: {
        height: "100%",
        width: "53%",
    },
    gameImage: {
        height: "100%",
        width: "100%",
        borderTopLeftRadius: 15,
    },
    detailBox: {
        height: "100%",
        width: "57%",
        position: "absolute",
        right: 0,
        backgroundColor: "#1D1F2E",
        borderRadius: 15,
        padding: 10,
    },
    row_1: {
        width: "100%",
        height: "50%",
    },
    row_1_leftSide: {
        position: "absolute",
        width: "70%",
        height: "100%",
        left: 0,
    },
    title: {
        color: "#CFCFCF",
        fontFamily: "Inter_700Bold",
        fontSize: 15,
    },
    platformBox: {
        backgroundColor: "#D9D9D9",
        width: "40%",
        height: "25%",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 5,
    },
    darkText: {
        color: "#26283C",
        fontFamily: "Inter_400Regular",
        fontSize: 12,
    },
    lightText: {
        color: "#CFCFCF",
        fontFamily: "Inter_400Regular",
        fontSize: 10,
    },
    lightHighLightText: {
        color: "#FFFFFF",
        fontFamily: "Inter_700Bold",
        fontSize: 12,
    },
    row_1_RightSide: {
        width: "30%",
        height: "100%",
        position: "absolute",
        right: 0,
    },
    row_2: {
        width: "100%",
        height: "20%",
        margin: "auto",
    },
    row_2_leftSide: {
        position: "absolute",
        width: "70%",
        height: "100%",
        left: 0,
    },
    row_2_RightSide: {
        width: "30%",
        height: "100%",
        position: "absolute",
        right: 0,
    },
    row_3: {
        width: "100%",
        backgroundColor: "#2C2F44",
        flexDirection: "row",
        flexWrap: "wrap",
        alignSelf: "center",
        alignItems: "center",
        paddingVertical: 5,
        borderRadius: 10
    },
    tagBox: {
        backgroundColor: "#D9D9D9",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
        paddingVertical: 3,
        marginLeft: 5,
        marginRight: 5,
    },
    tagScroll: {
        marginBottom: 10,  // Pequeno espaçamento para separar as tags
    },
    containerTrophyDetails: {
        width: "100%",
        height: "15%",
        backgroundColor: "#08BFB5",
        justifyContent: "center",
        overflow: 'hidden', // Garante que o conteúdo do LinearGradient seja cortado para caber na View
    },
    content: {
        width: '100%',
        height: '100%',
        paddingHorizontal: 10
    },
    titleTrophy: {
        fontFamily: "Inter_400Regular",
        paddingVertical: 5,
        fontSize: 14,
        color: "#FFF"
    },
    boxTrophyIcons: {
        width: "100%",
        height: "50%",
        flexDirection: "row",
        alignItems: "center",
    },
    boxTrophy: {
        height: 25,
        flexDirection: "row",
        marginRight: 10
    },
    trophyText: {
        fontFamily: "Inter_400Regular",
        fontSize: 14,
        marginLeft: 10,
        color: "#FFF"
    },
    trophyImage: {
        width: 20,
        height: "100%",
    },
    boxTrophyBtn: {
        height: "100%",
        width: "20%",
        position: "absolute",
        right: 0,
        justifyContent: "center",
        alignItems: "center",
        borderLeftWidth: 4,
        borderColor: "#1D1F2E",
        overflow: 'hidden', // Garante que a bolinha não ultrapasse o botão
    },
    boxTrophyBtnImg: {
        height: 25,
        width: 25,
        transform: [{ rotate: '-90deg' }]
    },
    trophyBtnText: {
        fontFamily: "Inter_700Bold",
        fontSize: 12,
        textAlign: "center",
        color: "#1D1F2E",
        zIndex: 2, // Mantém o texto acima da animação
    },
    animatedCircle: {
        position: 'absolute',
        height: 50,
        width: 50,
        backgroundColor: '#FFF',
        borderRadius: 25, // Torna a view circular
        zIndex: 1,
    },
    containerTrophyGuideDetails: {
        width: "100%",
        height: "45%",
        backgroundColor: "#1D1F2E",
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        padding: 15
    },

    textTrophyGuide: {
        fontFamily: "Inter_400Regular",
        color: "#CFCFCF",
        fontSize: 12,
    },
    highLightTextTrophyGuide: {
        fontFamily: "Inter_700Bold",
        color: "#FFFFFF",
        fontSize: 12,
    },
    rowTrophyGuide: {
        width: "100%",
        height: "40%",
        flexDirection: "row",
        display: "flex",
        justifyContent: "space-around",
        flexWrap: "wrap", // Permite quebrar em múltiplas linhas
        alignContent: "center", // Centraliza as linhas verticalmente, se necessário
        marginVertical: 5

    },
    TrophyGuideTextBox: {
        width: "45%", // Aproximadamente metade da largura, mantendo alinhamento
        display: "flex",
    },
    TrophyGuideChartBox: {
        width: "45%", // Aproximadamente metade da largura, mantendo alinhamento
        display: "flex",
    },

    chartTitleBox: {
        width: "100%",
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5

    },
    boxReport: {
        justifyContent: "center",
        alignItems: "center",
        width: "80%",
        alignSelf: "center",
        position: "absolute",
        bottom: 0,
        marginBottom: 20
    },
    textLink: {
        textAlign: "center",
        fontFamily: "Inter_400Regular",
        color: "#CFCFCF",
        fontSize: 12,
    },
    link: {
        color: "#57B3FF",
    },
    containerBtn: {
        backgroundColor: "#D9D9D9",
        width: "100%",
        height: "15%",
        marginTop: "20%",
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
