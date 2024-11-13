import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import { useFonts, Inter_400Regular, Inter_700Bold, } from '@expo-google-fonts/inter'
import RecentesScreen from './playlistComponents/Recentes';
import ConcluidosScreen from './playlistComponents/Concluidos';
import PlatinandoScreen from './playlistComponents/Cacados';
import UsuarioController from '@/src/controllers/usuarioController';
import Playlist from '@/src/models/playlistModel';
import { SplashScreen } from 'expo-router';

const { width } = Dimensions.get('window'); // Largura da tela
const usuarioController = new UsuarioController();

const Playlists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const [playlistRecentes, setPlaylistRecentes] = useState<Playlist | null>(null);
  const [playlistCacados, setPlaylistCacados] = useState<Playlist | null>(null);
  const [playlistConcluidos, setPlaylistConcluidos] = useState<Playlist | null>(null);
  
  const [activeTab, setActiveTab] = useState(0); // Estado para controlar a aba ativa
  const translateX = new Animated.Value(0); // Para animar o movimento do swipe
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
    const carregarPlaylists = async () => {
      try {
        const loadedPlaylists = await usuarioController.criarNovasPlaylistUsuario();
        if (loadedPlaylists) {
          setPlaylists(loadedPlaylists);
          setPlaylistRecentes(loadedPlaylists[0]); // Seleciona a primeira playlist por padrão
          setPlaylistCacados(loadedPlaylists[1]);
          setPlaylistConcluidos(loadedPlaylists[2]);
        } else {
          console.log("playlist undefined");
        }
      } catch (error) {
        console.error("Erro ao carregar a playlist:", error);
      }
    };

    carregarPlaylists();
  }, [fontsLoaded]); // Array vazio para executar apenas uma vez na montagem

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />; // Ou outro indicador de carregamento
  }
  // Função para alterar a aba com base no movimento de swipe
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  // Função para quando o swipe for liberado
  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === 5) { // Quando o gesto é finalizado
      const direction = event.nativeEvent.translationX < 0 ? 1 : -1; // Determina a direção do swipe
      const newTab = activeTab + direction;

      if (newTab >= 0 && newTab <= 2) {
        setActiveTab(newTab); // Atualiza a aba
      }

      // Reseta o translateX para animar o movimento da aba
      translateX.setValue(0);
    }
  };

  // Função para renderizar o conteúdo da aba ativa
  const renderTabContent = () => {
    if (playlistRecentes && playlistCacados && playlistConcluidos) {
      switch (activeTab) {
        case 0:
          return <PlatinandoScreen playlistCacados={playlistCacados}/>;
        case 1:
          return <RecentesScreen playlistRecente={playlistRecentes} />;
        case 2:
          return <ConcluidosScreen playlistConcluidos={playlistConcluidos} />;
        default:
          return null;
      }
    }
    return null;
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.navIndicator}>
        <View style={[styles.indicator, activeTab === 0 && styles.activeIndicator]} >
          <Text style={[styles.textIndicator, activeTab === 0 && styles.textActiveIndicator]}>Caçando</Text>
        </View>
        <View style={[styles.indicator, activeTab === 1 && styles.activeIndicator]} >
          <Text style={[styles.textIndicator, activeTab === 1 && styles.textActiveIndicator]}>Recentes</Text>
        </View>
        <View style={[styles.indicator, activeTab === 2 && styles.activeIndicator]} >
          <Text style={[styles.textIndicator, activeTab === 2 && styles.textActiveIndicator]}>Concluidos</Text>
        </View>
      </View>

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-30, 30]} // Apenas movimentos horizontais mais definidos ativam o swipe
      >
        <Animated.View style={[styles.swipeContainer, { transform: [{ translateX }] }]}>
          {renderTabContent()}
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: "center",
    width: "100%",
    height: "100%"
  },
  navIndicator: {
    flexDirection: 'row',
    justifyContent: "space-evenly",
    backgroundColor: "#D9D9D9",
    width: "90%",
    height: "4%",
    marginTop: 40,
    borderRadius: 30,
  },
  indicator: {
    justifyContent: "center",
    alignItems: "center",
    width: "25%",
    height: "75%",
    borderRadius: 30,
    alignSelf: "center",
  },
  activeIndicator: {
    width: "25%",
    height: "75%",
    backgroundColor: '#08BFB5', // Cor para indicar a aba ativa
    alignSelf: "center",
    borderRadius: 60,
  },
  textIndicator: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: "black"
  },
  textActiveIndicator: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  swipeContainer: {
    height: "100%",
    flex: 1,
    flexDirection: 'row',
    width: width * 3, // Multiplica por 3 para acomodar os 3 componentes
  },
});

export default Playlists;
