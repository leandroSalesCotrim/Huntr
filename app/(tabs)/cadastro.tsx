import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import WavesBackground from './components/WavesBackground';
import { SplashScreen } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import CustomModal from './components/Notificacao'; // Importando seu CustomModal
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../NavigationTypes';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, '(tabs)/index'>;

SplashScreen.preventAutoHideAsync();

const HomeScreen: React.FC = () => {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const handleCadastro = () => {
    // Lógica de cadastro
    setModalMessage('Cadastro realizado com sucesso! Realize o login para continuar.'); // Mensagem de sucesso
    setModalVisible(true); // Mostra a modal

    // Redireciona para a tela de login após 8 segundos
    setTimeout(() => {
      setModalVisible(false);
      navigation.navigate('(tabs)/login');

    }, 6000); // Tempo em milissegundos
  };

  return (
    <View style={styles.container}>
      <WavesBackground />
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnVoltar}>
        <Image source={require('../../assets/images/botao-x.png')} style={styles.imgBtnVoltar} />
      </TouchableOpacity>
      <Image source={require('../../assets/images/HunTr_logo2.png')} style={styles.logo} />

      <View style={styles.containerCadastro}>
        <Text style={styles.titulo}>Cadastrar conta HunTr</Text>
        <Text style={styles.subTitulo}>Abra os olhos, caçador. É hora de conquistar novos troféus.</Text>

        <View style={styles.divInputs}>
          <TextInput style={styles.input} textContentType='nickname' placeholder='Login' placeholderTextColor={"#FFFFFF80"} />
          <TextInput style={styles.input} textContentType='emailAddress' placeholder='Email' placeholderTextColor={"#FFFFFF80"} />
          <TextInput style={styles.input} textContentType='password' placeholder='Senha' secureTextEntry={true} placeholderTextColor={"#FFFFFF80"} />
          <TextInput style={styles.input} textContentType='password' placeholder='Confirmar senha' secureTextEntry={true} placeholderTextColor={"#FFFFFF80"} />
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleCadastro}>
          <Text style={styles.btnText}>Realizar cadastro</Text>
        </TouchableOpacity>
      </View>

      {/* Uso da CustomModal */}
      <CustomModal
        visible={modalVisible}
        message={modalMessage}
        onClose={() => setModalVisible(false)} // Fechar a modal ao pressionar o botão "Fechar"
      />
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
  btnVoltar: {
    width: 52,
    height: 52,
    marginRight: 20,
    alignSelf: "flex-end"
  },
  imgBtnVoltar: {
    width: "100%",
    height: "100%"
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 20,
    marginTop: 40
  },
  containerCadastro: {
    width: "100%",
    height: "62%",
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
    color: "#E2E3E5",
  },
  subTitulo: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    color: "#E2E3E5"
  },
  divInputs: {
    width: "100%",
    height: "40%",
    marginTop: 50,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  input: {
    backgroundColor: "#AFC1D14D",
    width: "80%",
    height: "20%",
    color: "#E2E3E5",
    fontSize: 14,
    borderRadius: 30,
    paddingLeft: 20
  },
  btn: {
    backgroundColor: "#2A3952",
    width: "60%",
    height: "10%",
    marginTop: 50,
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
