import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, ActivityIndicator, Easing } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import { useFonts, Inter_400Regular, Inter_700Bold, } from '@expo-google-fonts/inter'
import RecentesScreen from './playlistComponents/Recentes';
import ConcluidosScreen from './playlistComponents/Concluidos';
import PlatinandoScreen from './playlistComponents/Platinando';
import UsuarioController from '@/src/controllers/usuarioController';
import Playlist from '@/src/models/playlistModel';
import Jogo from '@/src/models/jogoModel';
import LoadingAnimation from './loadingAnimation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PlaylistProgressComponent from './playlistProgress';

const { width } = Dimensions.get('window'); // Largura da tela
const usuarioController = new UsuarioController();

const Playlists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  let playlistsCache: Playlist[] = [];

  const [activeTab, setActiveTab] = useState(0); // Estado para controlar a aba ativa
  const translateX = new Animated.Value(0); // Para animar o movimento do swipe
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  const [progresso, setProgresso] = useState<number>(0);
  const [progressoPorcentagem, setProgressoPorcentagem] = useState<number>(0);

  const buscarProgresso = async () => {
    try {
      const progressoQtdString = await AsyncStorage.getItem('playlistProgress');
      let progressoPorcentagem;

      progressoPorcentagem = Math.floor(((Number(progressoQtdString)) / 15) * 100);
      setProgressoPorcentagem(progressoPorcentagem);
      if (progressoQtdString) {
        setProgresso(Number(progressoQtdString));
      }
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
    }
  };

  const carregarPlaylists = async () => {
    setIsLoading(true);
    await AsyncStorage.setItem('playlistProgress', '0');
    await buscarProgresso(); // Chama a função para buscar o progresso
    try {
      const loadedPlaylists = await usuarioController.criarNovasPlaylistUsuario();
      setPlaylists(loadedPlaylists || []);
      if (loadedPlaylists) {
        playlistsCache = loadedPlaylists;
        await AsyncStorage.setItem('userPlaylists', JSON.stringify(playlistsCache));
      }
    } catch (error) {
      console.error('Erro ao carregar a playlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarPlaylists();
  }, []);

  useEffect(() => {
    if (isLoading) {
      // Caso queira chamar buscarProgresso periodicamente enquanto estiver carregando
      const intervalo = setInterval(() => {
        buscarProgresso();
      }, 1000);
      return () => clearInterval(intervalo); // Limpa o intervalo ao desmontar ou quando o carregamento terminar
    }
  }, [isLoading]); // O intervalo é setado somente quando isLoading é verdadeiro


  const removerJogoDaPlaylist = (
    jogo: Jogo,
    playlistDestinoIndex: number
  ) => {
    setPlaylists((prev) => {
      const novasPlaylists = [...prev];
      const playlistDestino = novasPlaylists[playlistDestinoIndex];

      // Removendo o jogo à playlist de destino
      playlistDestino.removeJogo(jogo);

      return novasPlaylists;
    });
  };

  const moverJogoParaOutraPlaylist = (
    jogo: Jogo,
    playlistDestinoIndex: number
  ) => {
    setPlaylists((prev) => {
      const novasPlaylists = [...prev];
      const playlistDestino = novasPlaylists[playlistDestinoIndex];

      // Adicionar o jogo à playlist de destino
      playlistDestino.pushJogo(jogo);

      return novasPlaylists;
    });
  };

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
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingAnimation />
          <PlaylistProgressComponent progresso={progressoPorcentagem} numJogoPlaylist={progresso} />
        </View>
      );
    }
    if (playlists[0] && playlists[1] && playlists[2]) {
      switch (activeTab) {
        case 0:
          return <PlatinandoScreen
            playlistCacados={playlists[2]}
            atualizarPlaylist={carregarPlaylists}
            moverJogo={(jogo) => removerJogoDaPlaylist(jogo, 2)}
          />;
        case 1:
          return <RecentesScreen
            playlistRecente={playlists[0]}
            atualizarPlaylist={carregarPlaylists}
            moverJogo={(jogo) => moverJogoParaOutraPlaylist(jogo, 2)}
          />
        case 2:
          return <ConcluidosScreen
            playlistConcluidos={playlists[1]}
            atualizarPlaylist={carregarPlaylists}
            moverJogo={(jogo) => undefined}//passando undefined pois não é possivel mover/remover jogos da playlist de jogos concluidos
          />;
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
    alignItems: "center",
    width: "100%",
    height: "100%",
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 250,
    height: 250,
    marginHorizontal: "auto",
    alignSelf: 'center',
    marginBottom: 50,
  },
  symbol: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Playlists;
