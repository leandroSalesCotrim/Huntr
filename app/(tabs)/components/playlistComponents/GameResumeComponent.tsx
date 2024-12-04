// app/components/GameResumeComponent.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, TextInput, Modal, Animated, Easing } from 'react-native';
import {
    useFonts,
    Inter_400Regular,
    Inter_700Bold,
} from '@expo-google-fonts/inter'
import { SplashScreen } from 'expo-router';
import Jogo from '@/src/models/jogoModel';
import CircularChart from './CircularChart';

interface GameResumeComponentProps {
    jogo: any
}

const GameResumeComponent: React.FC<GameResumeComponentProps> = ({ jogo }) => {
    const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold });
    const [isLandscape, setIsLandscape] = useState(false); // Para armazenar a verificação de proporção

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return <ActivityIndicator size="large" color="#0000ff" />; // Ou outro indicador de carregamento
    }

    if (!jogo) return null; // Se não houver jogo, não renderiza nada
    const handleImageLoad = (event: any) => {
        const { width, height } = event.nativeEvent.source;
        setIsLandscape(width > height); // Verifica se a largura é maior que a altura
    };
    
    //variavel que muda de acordo com o tamanho da imagem para não deixar muito borrado quando for landscape
    const valueBlur = isLandscape ? 3: 10;

    const countBronze = jogo.trofeus.filter((trofeu: { tipo: string; }) => trofeu.tipo === "bronze").length;
    const countBronzeObtido = jogo.trofeus.filter((trofeu: { tipo: string; conquistado: any; }) => trofeu.tipo === "bronze" && trofeu.conquistado).length;
    const countPrata = jogo.trofeus.filter((trofeu: { tipo: string; }) => trofeu.tipo === "silver").length;
    const countPrataObtido = jogo.trofeus.filter((trofeu: { tipo: string; conquistado: any; }) => trofeu.tipo === "silver" && trofeu.conquistado).length;
    const countOuro = jogo.trofeus.filter((trofeu: { tipo: string; }) => trofeu.tipo === "gold").length;
    const countOuroObtido = jogo.trofeus.filter((trofeu: { tipo: string; conquistado: any; }) => trofeu.tipo === "gold" && trofeu.conquistado).length;
    const countPlatina = jogo.trofeus.filter((trofeu: { tipo: string; }) => trofeu.tipo === "platinum").length;
    const countPlatinaObtido = jogo.trofeus.filter((trofeu: { tipo: string; conquistado: any; }) => trofeu.tipo === "platinum" && trofeu.conquistado).length;

    return (
        <View style={styles.backgroundContainer}>
            <View style={styles.imageBox}>
            <Image
                    blurRadius={valueBlur}
                    source={{ uri: jogo.iconeUrl }}
                    style={styles.gameImage}
                    onLoad={handleImageLoad} // Adiciona o evento para capturar dimensões
                />
            </View>
            <View style={styles.backgroundDifusor} />

            <View style={styles.container}>
                <View style={styles.platformBox}>
                    <Text style={styles.text}>{jogo.plataforma}</Text>
                </View>


                <CircularChart percentual={jogo.progresso} tamanho={60} largura={4} />

                <View style={styles.containerTrophyDetails}>
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
            </View>

            <View style={styles.titleBox}>
                <Text style={styles.title}>{jogo.nome}</Text>
            </View>

        </View >

    );
};


const styles = StyleSheet.create({
    backgroundContainer: {
        width: "100%",
        height: 155,
        borderRadius: 15,
        overflow: "hidden"
    },
    imageBox:{
        width: "100%",
        height: "100%",
        overflow:"hidden",
        justifyContent:"center",
        alignItems:"center"
    },
    gameImage: {
        width: "100%",
        alignSelf:"center",
        resizeMode:"cover",
        aspectRatio: 1, 
    },
    backgroundDifusor: {
        width: "100%",
        height: "100%",
        backgroundColor: "#1D1F2E",
        position: "absolute",
        opacity: 0.6
    },
    container: {
        width: "100%",
        height: "100%",
        paddingVertical: 10,
        paddingHorizontal: 20,
        position: "absolute",
        justifyContent: "space-around",
        alignItems: "center",
        overflow: "hidden",
    },
    platformBox: {
        position: "absolute",
        top: 0,
        left: 0,
        marginVertical: 10,
        marginHorizontal: 20,
        backgroundColor: "#D9D9D9",
        width: "15%",
        height: "15%",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        color: "#26283C",
        fontFamily: "Inter_400Regular",
        fontSize: 12,
    },
    containerTrophyDetails: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 15
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
    titleBox: {
        width: "100%",
        backgroundColor: "#1D1F2E",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        paddingVertical: 3,
        bottom: 0,
    },
    title: {
        fontFamily: "Inter_700Bold",
        fontSize: 14,
        color: "#FFF"
    }
});

export default GameResumeComponent;
