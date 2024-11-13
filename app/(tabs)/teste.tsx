// app/components/Recentes.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import GameCardComponent from './components/playlistComponents/GameCardComponent';
import Jogo from '@/src/models/jogoModel';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const RecentesScreen: React.FC = () => {
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

  // Mock de dados para jogos
  const jogosMock: Jogo[] = [
    new Jogo("God of War", "PS4", 30, "https://example.com/gow-icon.png", false, "CUSA12345", [], "https://example.com/gow-guide", 5, 80, "NPWR001"),
    new Jogo("Horizon Zero Dawn", "PS4", 25, "https://example.com/hzd-icon.png", false, "CUSA12346", [], "https://example.com/hzd-guide", 4, 60, "NPWR002"),
    new Jogo("The Last of Us Part II", "PS4", 40, "https://example.com/tlou2-icon.png", false, "CUSA12347", [], "https://example.com/tlou2-guide", 7, 100, "NPWR003"),
    new Jogo("God of War", "PS4", 30, "https://example.com/gow-icon.png", false, "CUSA12345", [], "https://example.com/gow-guide", 5, 80, "NPWR001"),
    new Jogo("Horizon Zero Dawn", "PS4", 25, "https://example.com/hzd-icon.png", false, "CUSA12346", [], "https://example.com/hzd-guide", 4, 60, "NPWR002"),
    new Jogo("The Last of Us Part II", "PS4", 40, "https://example.com/tlou2-icon.png", false, "CUSA12347", [], "https://example.com/tlou2-guide", 7, 100, "NPWR003"),
    new Jogo("God of War", "PS4", 30, "https://example.com/gow-icon.png", false, "CUSA12345", [], "https://example.com/gow-guide", 5, 80, "NPWR001"),
    new Jogo("Horizon Zero Dawn", "PS4", 25, "https://example.com/hzd-icon.png", false, "CUSA12346", [], "https://example.com/hzd-guide", 4, 60, "NPWR002"),
    new Jogo("The Last of Us Part II", "PS4", 40, "https://example.com/tlou2-icon.png", false, "CUSA12347", [], "https://example.com/tlou2-guide", 7, 100, "NPWR003"),
    new Jogo("God of War", "PS4", 30, "https://example.com/gow-icon.png", false, "CUSA12345", [], "https://example.com/gow-guide", 5, 80, "NPWR001"),
    new Jogo("Horizon Zero Dawn", "PS4", 25, "https://example.com/hzd-icon.png", false, "CUSA12346", [], "https://example.com/hzd-guide", 4, 60, "NPWR002"),
    new Jogo("The Last of Us Part II", "PS4", 40, "https://example.com/tlou2-icon.png", false, "CUSA12347", [], "https://example.com/tlou2-guide", 7, 100, "NPWR003"),
    // Adicione mais jogos aqui se desejar
  ];

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scrollView}>
          {jogosMock.map((jogo, index) => (
            <GameCardComponent key={index} jogo={jogo} />
          ))}
       
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  )
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  scrollView: {
    backgroundColor: 'pink',
  },
  text: {
    fontSize: 42,
    padding: 12,
  },
});

export default RecentesScreen;
