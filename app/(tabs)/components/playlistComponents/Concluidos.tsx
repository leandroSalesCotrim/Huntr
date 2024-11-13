import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import InicioComponent from './InicioComponent';
import GameCardComponent2 from './CustomGameCardComponent';
import Playlist from '@/src/models/playlistModel';

interface ConcluidosScreenProps {
    playlistConcluidos: Playlist
}

const ConcluidosScreen: React.FC<ConcluidosScreenProps> = ({ playlistConcluidos }) => {
    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_700Bold,
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={styles.container}>
            <InicioComponent titleText="Jogos platinados" />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {playlistConcluidos ? (
                    <View style={styles.itemsContainer}>
                        {playlistConcluidos.getJogos().map((jogo, index) => (
                            <GameCardComponent2 key={index} jogo={jogo} />
                        ))}
                    </View>
                ) : (
                    <Text>Playlist não carregada</Text>
                )}
                <View style={styles.preenchimento}></View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "33.5%",
        height: "100%",
        margin: "auto",
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 10,
    },
    scrollView: {
        top: 10,
    },
    itemsContainer: {
        flexDirection: 'row', // Alinha os itens horizontalmente
        flexWrap: 'wrap', // Permite que os itens que não cabem na linha atual "quebrem" para a próxima
        justifyContent: 'space-between', // Distribui o espaço uniformemente entre os itens
    },
    preenchimento: {
        width: "100%",
        height: 120,
    },
});

export default ConcluidosScreen;
