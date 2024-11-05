// token.tsx
import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Button, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import WavesBackground from '../components/WavesBackground';
import { Link, SplashScreen } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../NavigationTypes';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from '@expo-google-fonts/inter'

type TokenScreenNavigationProp = StackNavigationProp<RootStackParamList, '(tabs)/index'>;
// Previne a tela de splash de desaparecer automaticamente
SplashScreen.preventAutoHideAsync();

const TokenScreen: React.FC = () => {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });
  const navigation = useNavigation<TokenScreenNavigationProp>();



  // Usar useEffect para ocultar a splash screen quando as fontes terminarem de carregar
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />; // Ou outro indicador de carregamento
  }

  const handleLogin = () => {
    // Lógica de login

    navigation.navigate('(tabs)/dashboard');

  };

  return (

    <View style={styles.container}>
      <Image source={require('../../../assets/images/HunTr_logo2.png')} style={styles.logo} />

      <View style={styles.containerToken}>
        <Text style={styles.titulo} >Sincronizar token</Text>
        <Text style={styles.subTitulo}>O vínculo está quase completo. Sincronize e retome sua caçada.</Text>

        <View style={styles.containerInput}>
          <Text style={styles.tituloToken}>SSO Token</Text>
          <TextInput style={styles.input} placeholder='Insira seu SSO Token aqui' placeholderTextColor={"#1C1F2A"}></TextInput>
        </View>

        <View style={styles.containerIcons}>
          <TouchableOpacity style={styles.btnIcon}>
            <Image source={require('../../../assets/images/icone-link.png')} style={styles.imgIcon} />
            <Text style={styles.text}>Obter token</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnIcon}>
            <Image source={require('../../../assets/images/validar-e-atualizar.png')} style={styles.imgIcon} />
            <Text style={styles.text}>Validar e sicronizar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnIcon} onPress={() => navigation.navigate('(tabs)/guiaToken')}>
            <Image source={require('../../../assets/images/duvida.png')} style={styles.imgIcon} />
            <Text style={styles.text}>Ajuda</Text>
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
  logo: {
    width: 160,
    height: 160,
    marginTop: 60
  },
  containerToken: {
    width: "100%",
    height: "65%",
    position: "absolute",  // Define o contêiner como absoluto
    bottom: 0,             // Alinha com a parte inferior da tela
    backgroundColor: "#1D1F2E",
    display: "flex",
  },

  titulo: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 30,
    fontFamily: 'Inter_700Bold',
    color: "#E2E3E5"
  },
  subTitulo: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    color: "#E2E3E5"
  },
  containerInput: {
    display:"flex",
    marginTop:"10%",
    justifyContent: "center",
    alignItems:"center",
    width: "100%"

  },
  tituloToken: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Inter_400Regular',
    color: "#CFCFCF"
  },
  input: {
    backgroundColor: "#CFCFCF",
    width: "70%",
    height: "27%",
    color: "#1C1F2A",
    fontSize: 14,
    borderRadius: 30,
    paddingLeft: 20
  },
  containerIcons: {
    display:"flex",
    flexDirection:"row",
    justifyContent: "space-around",

  },
  btnIcon: {
    width: "15%",
    alignItems:"center"
  },
  imgIcon: {
    width: 50,
    height: 50,
  },
  text: {
    color: "#FFFFFF",
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    textAlign: "center"
  }
});

export default TokenScreen;