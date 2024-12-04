import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, Animated, TouchableOpacity } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import Jogo from '@/src/models/jogoModel';

interface GameCardComponentProps {
    jogo: Jogo;
    openModal: (jogo: Jogo) => void;  // Adicionando a função onPress aqui
}

const GameCardComponent: React.FC<GameCardComponentProps> = ({ jogo, openModal }) => {
    const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold });
    const [isTextOverflowing, setIsTextOverflowing] = useState(false); // Estado para verificar o overflow
    const textAnim = useRef(new Animated.Value(0)).current; // Animação de valor
    const textWidth = useRef(0); // Armazena a largura do texto
    const containerWidth = useRef(0); // Armazena a largura do contêiner

    // Função para medir o tamanho do texto e verificar se ele excede uma linha
    const onTextLayout = (e: any) => {
        const { width } = e.nativeEvent.layout;
        textWidth.current = width;
        console.log(width > containerWidth.current);
        if (width > containerWidth.current) {
            setIsTextOverflowing(true);  // Se o texto for maior que o contêiner, ativar a animação
        } else {
            setIsTextOverflowing(false);
            textAnim.setValue(0); // Se o texto não exceder a largura, reseta a animação
        }
    };

    // Animação do texto
    const animateText = () => {
        // Reseta a animação e inicia o loop
        Animated.loop(
            Animated.sequence([
                Animated.timing(textAnim, {
                    toValue: 1,
                    duration: 7000, // Tempo total da animação (ajuste conforme necessário)
                    useNativeDriver: true,
                }),

            ])
        ).start(); // Inicia a animação
    };

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
        if (isTextOverflowing) {
            animateText(); // Inicia animação se o texto for longo
        }
    }, [fontsLoaded, isTextOverflowing]); // Re-renderiza sempre que o estado de overflow muda

    if (!fontsLoaded) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    const tags: string[] = Array.from(new Set(jogo.getTrofeus().flatMap(trofeu => trofeu.getTags())));

    // Animação somente se o texto exceder a largura
    const textMove = textAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, isTextOverflowing ? -(textWidth.current * 0.5) : 0], // Move para a esquerda se o texto for longo
    });
    // Definir a cor dinamicamente dependendo do progresso
    const progressColor = jogo.getProgresso() === 100 ? '#57B3FF' : '#08BFB5'; // Verde para 100%, azul para outros valores

    // Calcular o height da progressBar com base no progresso
    const progressHeight = jogo.getProgresso() ? (jogo.getProgresso() / 100) * 100 : 0;

    return (
        <View style={styles.container} onLayout={(e) => { containerWidth.current = e.nativeEvent.layout.width }}>

            <View style={styles.imageBox}>

                <View style={styles.progressBox}>
                    <View style={[styles.progressLevel, { height: `${progressHeight}%`, backgroundColor: progressColor }]}>
                    </View>
                    <Text style={styles.progressText}>Progresso</Text>
                </View>

                <TouchableOpacity style={styles.touchImageBox} onPress={() => openModal(jogo)}>
                    {jogo.getIconeUrl() ? (
                        <Image source={{ uri: jogo.getIconeUrl() }} style={styles.gameImage} />
                    ) : (
                        <Image source={require('../../../../assets/images/defaultGameImage.jpg')} style={styles.gameImage} />
                    )}
                </TouchableOpacity>

                <View style={styles.platformBox}><Text style={styles.platformText}>{jogo.getPlataforma()}</Text></View>

            </View>

            <View style={styles.titleBox}>

                <View style={styles.titleBoxLimit}>

                    <Animated.View style={[{ transform: [{ translateX: textMove }] }]}>
                        <Text style={styles.titleText} onLayout={onTextLayout}>
                            {jogo.getNome()}
                        </Text>
                    </Animated.View>

                </View>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        width: '48%',
        height: 212,
        backgroundColor: '#1D1F2E',
        marginVertical: 5,
        borderRadius: 5,
    },
    imageBox: {
        height: '87%',
        width: '100%',
        overflow: 'hidden', // Impede que o texto transborde
    },
    progressBox: {
        height: '100%',
        width: '7%',
        position: "absolute",
        right: 0,
        backgroundColor: '#D9D9D9',
        justifyContent: "center",
    },
    progressLevel: {
        width: "100%",
        height: "90%",
        backgroundColor: '#08BFB5',
        position: "absolute",
        bottom: 0,
    },
    progressText: {
        width: "70%",
        position: "absolute",
        right: 0,
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: "#1D1F2E",
    },
    touchImageBox: {
        width: "93%",
        height: "100%"
    },
    gameImage: {
        height: '100%',
        width: '100%',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
    },
    platformBox: {
        backgroundColor: "#D9D9D9",
        height: 17,
        paddingHorizontal: 15,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        bottom: 0,
        margin: 10
    },
    platformText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
    },
    titleBox: {
        height: '10%',
        overflow: 'hidden', // Impede que o texto transborde
        marginVertical: "auto"
    },
    titleBoxLimit: {
        height: '100%',
        width: "200%",
        flexDirection: 'row', // Garante que o texto se mantenha em uma linha
        overflow: 'hidden', // Impede que o texto transborde
    },
    titleText: {
        color: '#CFCFCF',
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        marginLeft: 10,
    },
});

export default GameCardComponent;