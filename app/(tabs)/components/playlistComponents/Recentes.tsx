// app/components/Recentes.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import InicioComponent from './InicioComponent';
import GameCardComponent from './GameCardComponent';
import Playlist from '@/src/models/playlistModel';
import FilterModalComponent from './FilterModalComponent';

interface RecentesScreenProps {
    playlistRecente: Playlist;
}

const RecentesScreen: React.FC<RecentesScreenProps> = ({ playlistRecente }) => {
    const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold });
    const [filteredGames, setFilteredGames] = useState(playlistRecente.getJogos());
    const [modalVisible, setModalVisible] = useState(false);
    const [showScrollTopButton, setShowScrollTopButton] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null)
   
    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return <ActivityIndicator size="large" color="#0000ff" />; // Ou outro indicador de carregamento
    }

    const handleScroll = (event: any) => {
        const contentOffsetY = event.nativeEvent.contentOffset.y; // Posição de rolagem
        const contentHeight = event.nativeEvent.contentSize.height; // Altura total do conteúdo
        const layoutHeight = event.nativeEvent.layoutMeasurement.height; // Altura visível da ScrollView

        if (contentHeight - contentOffsetY <= layoutHeight + 50) {
            setShowScrollTopButton(true);
        } else {
            setShowScrollTopButton(false);
        }
    };

    const scrollToTop = () => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    };
    const inverterLista = () => {
        setFilteredGames(prevGames => [...prevGames].reverse());
    };

    const aplicarFiltros = (criterios: { sortBy: string }) => {
        const jogosFiltrados = [...playlistRecente.getJogos()];

        if (criterios.sortBy === 'nome') {
            jogosFiltrados.sort((a, b) => a.getNome().localeCompare(b.getNome()));
        } else if (criterios.sortBy === 'progresso') {
            jogosFiltrados.sort((a, b) => a.getProgresso() - b.getProgresso());
        } else if (criterios.sortBy === 'dificuldade') {
            jogosFiltrados.sort((a, b) => a.getDificuldade() - b.getDificuldade());
        } else if (criterios.sortBy === 'tempoParaPlatinar') {
            jogosFiltrados.sort((a, b) => a.getTempoParaPlatinar() - b.getTempoParaPlatinar());
        }

        setFilteredGames(jogosFiltrados);
    };

    return (
        <View style={styles.container}>
             <InicioComponent
                titleText="Jogados recentemente"
                openFilters={() => setModalVisible(true)}
                organizar={inverterLista} // Passe a função de inverter para o componente InicioComponent
            />
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                ref={scrollViewRef}
                scrollEventThrottle={16}
            >
                {filteredGames.length > 0 ? (
                    filteredGames.map((jogo, index) => (
                        <GameCardComponent key={index} jogo={jogo} />
                    ))
                ) : (
                    <Text>Playlist não carregada ou sem jogos correspondentes</Text>
                )}
                <View style={styles.preenchimento}></View>
            </ScrollView>

            {showScrollTopButton && (
                <TouchableOpacity style={styles.scrollTopButton} onPress={scrollToTop}>
                    <Image source={require('../../../../assets/images/btn-top.png')} style={styles.btnTopIcon} />
                </TouchableOpacity>
            )}

            <FilterModalComponent
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onApplyFilters={aplicarFiltros}
            />


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
    },
    scrollTopButton: {
        position: 'absolute',
        bottom: "20%",
        right: 20,
        backgroundColor: '#1D1F2E',
        borderRadius: 30,
        width: 50,
        height: 50
    },
    btnTopIcon: {
        width: "99%",
        height: "99%"
    },

});

export default RecentesScreen;