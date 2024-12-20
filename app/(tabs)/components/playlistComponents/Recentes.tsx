// app/components/Recentes.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import InicioComponent from './InicioComponent';
import GameCardComponent from './GameCardDefaultComponent';
import Playlist from '@/src/models/playlistModel';
import FilterModalComponent from './FilterModalComponent';
import GameModalComponent from './GameModalComponent';
import Jogo from '@/src/models/jogoModel';

interface RecentesScreenProps {
    playlistRecente: Playlist;
    moverJogo: (jogo: Jogo) => void; // Adicionado prop
    atualizarPlaylist: () => void; // Adicionado prop
}

const RecentesScreen: React.FC<RecentesScreenProps> = React.memo(({ playlistRecente, moverJogo, atualizarPlaylist }) => {
    const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold });
    const [filteredGames, setFilteredGames] = useState(playlistRecente.getJogos());
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedGame, setSelectedGame] = useState<Jogo | null>(null);
    const [gameModalVisible, setGameModalVisible] = useState(false);
    const [showScrollTopButton, setShowScrollTopButton] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    useEffect(() => {
        setFilteredGames(playlistRecente.getJogos());
    }, [playlistRecente]);

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
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
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
    const handleGameCardPress = (jogo: Jogo) => {
        setSelectedGame(jogo);  // Definir o jogo selecionado
        setGameModalVisible(true);  // Abrir a modal
    };

    return (
        <View style={styles.container}>
            <InicioComponent
                titleText="Jogados recentemente"
                openFilters={() => setFilterModalVisible(true)}
                organizar={inverterLista} // Passe a função de inverter para o componente InicioComponent
                atualizarPlaylist={atualizarPlaylist} // Função para recarregar playlists
                tela={"padrao"}
            />

            <FlatList
                ref={flatListRef}
                style={styles.scrollView}
                data={filteredGames}
                keyExtractor={(item, index) => item.getNome()} // Supondo que o jogo tenha um ID único
                renderItem={({ item }) => (
                    <GameCardComponent
                        key={item.getNome()}
                        jogo={item}
                        openModal={handleGameCardPress}
                    />
                )}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                ListEmptyComponent={<Text>Playlist não carregada ou sem jogos correspondentes</Text>}
                initialNumToRender={4}  // Ajuste esse valor para otimizar o desempenho
                maxToRenderPerBatch={3}
                windowSize={3}
                ListFooterComponent={<View style={{ height: 120 }} />}
            />

            {showScrollTopButton && (
                <TouchableOpacity style={styles.scrollTopButton} onPress={scrollToTop}>
                    <Image source={require('../../../../assets/images/btn-top.png')} style={styles.btnTopIcon} />
                </TouchableOpacity>
            )}

            <GameModalComponent
                visible={gameModalVisible}
                onClose={() => setGameModalVisible(false)}
                moverJogo={moverJogo} // Passando a função para mover o jogo
                jogo={selectedGame} // Passando o jogo selecionado para a modal
                tela={"recentes"}
            />
            <FilterModalComponent
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                onApplyFilters={aplicarFiltros}
                tela={"padrao"}
            />


        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        width: "33.5%",
        height: "100%",
        margin: "auto",
        marginBottom: 0,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 10,
    },
    scrollView: {
        top: 10,
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
