// HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import WavesBackground from './components/WavesBackground';
import { Link, SplashScreen } from 'expo-router';
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from '@expo-google-fonts/inter'
import { getLocales, getCalendars } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Previne a tela de splash de desaparecer automaticamente
SplashScreen.preventAutoHideAsync();

const HomeScreen: React.FC = () => {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    const checkLanguageTag = async () => {
      try {
        const storedLanguageTag = await AsyncStorage.getItem('languageTag');

        if (!storedLanguageTag) {
          const currentLanguageTag = getLocales()[0].languageTag.toLowerCase();
          console.log('Salvando languageTag:', currentLanguageTag);
          await AsyncStorage.setItem('languageTag', currentLanguageTag);
        } else {
          console.log('LanguageTag armazenada:', storedLanguageTag);
          
        }
      } catch (error) {
        console.error('Erro ao acessar AsyncStorage:', error);
      }
    };

    checkLanguageTag();
  }, []); // Executa apenas uma vez ao montar o componente



  // Usar useEffect para ocultar a splash screen quando as fontes terminarem de carregar
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
      <WavesBackground />
      <Image source={require('../../assets/images/HunTr_logo.png')} style={styles.logo} />
      <Text style={styles.titulo}>Seja bem vindo ao HunTr!</Text>
      <Text style={styles.subTitulo}>Que a caçada nos una mais uma vez, bom caçador</Text>

      <View style={styles.containerOpcoes}>
        <Text style={styles.TituloBtns}>Escolha uma opção</Text>

        <View style={styles.containerBtns}>

          <TouchableOpacity style={styles.btn} onPress={() => console.log('Botão pressionado')}>
            <Link href="/login" style={styles.btnText}>
              Entrar com minha conta
            </Link>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={() => console.log('Botão 1 pressionado')}>
            <Link href="/cadastro" style={styles.btnText}>
              Criar uma nova conta
            </Link>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} >
            <Link href="/teste" style={styles.btnText}>
              Entrar como convidado
            </Link>
          </TouchableOpacity>

        </View>


      </View>
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 40,
    marginTop: 20,
  },
  titulo: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Inter_700Bold',
  },
  subTitulo: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  containerOpcoes: {
    width: "100%",
    height: "35%",
    top: "15%",
    backgroundColor: "#18191DE6",
    marginTop: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  TituloBtns: {
    fontSize: 16,
    color: "#E2E3E5",
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  containerBtns: {
    width: "100%",
    marginTop: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  btn: {
    backgroundColor: "#AFC1D14D",
    width: "80%",
    height: "22%",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    width: "100%",
    borderRadius: 30,
    color: "#E2E3E5",
    fontFamily: 'Inter_400Regular',
    textAlign: "center",
  },
});


export default HomeScreen;