// app/components/Recentes.tsx
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, ScrollView } from 'react-native';
import {
    useFonts,
    Inter_400Regular,
    Inter_700Bold,
} from '@expo-google-fonts/inter'
import { SplashScreen } from 'expo-router';
import Playlist from '@/src/models/playlistModel';
import InicioComponent from './InicioComponent';
import GameCardComponent from './GameCardComponent';

interface RecentesScreenProps {
    playlistRecente: Playlist;
}

const RecentesScreen: React.FC<RecentesScreenProps> = ({ playlistRecente }) => {

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
        return <ActivityIndicator size="large" color="#0000ff" />; // Ou outro indicador de carregamento
    }

    return (
        <View style={styles.container}>
            <InicioComponent titleText='Jogados recentemente' />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {playlistRecente ? (
                    <>
                        {playlistRecente.getJogos().map((jogo, index) => {
                            // Exibindo o nome do jogo no console
                            console.log(`Nome do jogo: ${jogo.getNome()}`); // Supondo que cada objeto jogo tenha a propriedade 'nome'

                            return (
                                <GameCardComponent key={index} jogo={jogo} />
                            );
                        })}
                    </>
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
        marginTop: 0,
        marginBottom: 0,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 10,
    },
    scrollView: {
        top: 10,
    },
    preenchimento: {
        width: "100%",
        height: 100
    }

});

export default RecentesScreen;
