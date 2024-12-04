import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import InicioComponent from './InicioComponent';
import GameModalComponent from './GameModalComponent';
import GameCardComponent2 from './CustomGameCardComponent';
import Playlist from '@/src/models/playlistModel';
import FilterModalComponent from './FilterModalComponent';
import Jogo from '@/src/models/jogoModel';

interface ConcluidosScreenProps {
    playlistConcluidos: Playlist
}

const ConcluidosScreen: React.FC<ConcluidosScreenProps> = ({ playlistConcluidos }) => {
    const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold });
    const [filteredGames, setFilteredGames] = useState(playlistConcluidos.getJogos());
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedGame, setSelectedGame] = useState<Jogo | null>(null);
    const [gameModalVisible, setGameModalVisible] = useState(false);
    const [showScrollTopButton, setShowScrollTopButton] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return <ActivityIndicator size="large" color="#0000ff" />;
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

    const aplicarFiltros = (criterios: { sortBy: string }) => {
        const jogosFiltrados = [...playlistConcluidos.getJogos()];

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

    const inverterLista = () => {
        setFilteredGames(prevGames => [...prevGames].reverse());
    };

    const handleGameCardPress = (jogo: Jogo) => {
        setSelectedGame(jogo);  // Definir o jogo selecionado
        setGameModalVisible(true);  // Abrir a modal
    };

    return (
        <View style={styles.container}>
            <InicioComponent
                titleText="Jogos platinados"
                openFilters={() => setModalVisible(true)}
                organizar={inverterLista} // Passe a função de inverter para o componente InicioComponent
                tela={"padrao"}
            />
            <FlatList
                numColumns={2} // Fixado como 2
                ref={flatListRef}
                style={styles.scrollView}
                data={filteredGames}
                keyExtractor={(item, index) => item.getNome()} // Identificador único para cada item
                renderItem={({ item }) => (
                    <GameCardComponent2
                        jogo={item}
                        openModal={handleGameCardPress}
                    />
                )}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                columnWrapperStyle={styles.itemsContainer} // Aplica estilos ao contêiner de cada linha
                ListEmptyComponent={
                    <Text>Playlist não carregada ou sem jogos correspondentes</Text>
                }
                ListFooterComponent={<View style={styles.preenchimento} />}
                initialNumToRender={4}  // Ajuste esse valor para otimizar o desempenho
                maxToRenderPerBatch={3}
                windowSize={3}
            />

            {showScrollTopButton && (
                <TouchableOpacity style={styles.scrollTopButton} onPress={scrollToTop}>
                    <Image source={require('../../../../assets/images/btn-top.png')} style={styles.btnTopIcon} />
                </TouchableOpacity>
            )}

            <GameModalComponent
                visible={gameModalVisible}
                onClose={() => setGameModalVisible(false)}
                jogo={selectedGame} // Passando o jogo selecionado para a modal
                tela={"concluidos"}
            />

            <FilterModalComponent
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onApplyFilters={aplicarFiltros}
                tela={"padrao"}
            />

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
        flexWrap: 'wrap', // Permite que os itens que não cabem na linha atual "quebrem" para a próxima
        flexDirection: 'row', // Alinha os itens horizontalmente
        justifyContent: "space-between"
    },
    preenchimento: {
        width: "100%",
        height: 120,
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

export default ConcluidosScreen;
