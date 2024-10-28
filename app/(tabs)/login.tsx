// HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Button, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import WavesBackground from './components/WavesBackground';
import * as Font from 'expo-font';
import { Link, SplashScreen } from 'expo-router';
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from '@expo-google-fonts/inter'

// Previne a tela de splash de desaparecer automaticamente
SplashScreen.preventAutoHideAsync();

const HomeScreen: React.FC = () => {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });



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
      <Image source={require('../../assets/images/botao-x.png')} style={styles.btnFechar} />
      <Image source={require('../../assets/images/HunTr_logo2.png')} style={styles.logo} />

      <View style={styles.containerLogin}>
        <Text style={styles.titulo} >Realizar login</Text>
        <Text style={styles.subTitulo}>O sonho recomeça. A caçada pelos troféus te espera.</Text>

        <View style={styles.divInputs}>
          <TextInput style={styles.input} placeholder='Login' placeholderTextColor={"#FFFFFF80"}></TextInput>
          <TextInput style={styles.input} placeholder='Senha' placeholderTextColor={"#FFFFFF80"}></TextInput>

          <TouchableOpacity style={styles.btn} >
            <Link href="/teste" style={styles.btnText}>
              Realizar login
            </Link>
          </TouchableOpacity>
        </View>



      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    position: 'relative', // Para garantir que o WavesBackground fique atrás
  },
  btnFechar: {
    width: 52,
    height: 52,
    marginRight: 20,
    alignSelf: "flex-end"
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 20,
    marginTop: 40
  },
  containerLogin: {
    width: "100%",
    height: "47%",
    backgroundColor: "#18191DE6",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  titulo: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Inter_700Bold',
    color: "#E2E3E5"
  },
  subTitulo: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    color: "#E2E3E5"
  },
  divInputs: {
    width: "100%",
    height: "60%",
    marginTop: 30,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  input: {
    backgroundColor: "#AFC1D14D",
    width: "80%",
    height: "18%",
    color: "#E2E3E5",
    fontSize: 14,
    borderRadius: 30,
    paddingLeft: 20
  },
  btn: {
    backgroundColor: "#2A3952",
    width: "60%",
    height: "20%",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    width: "100%",
    color: "#E2E3E5",
    fontFamily: 'Inter_400Regular',
    textAlign: "center",
    fontSize: 18
  },

});

export default HomeScreen;