// Perfil.tsx
import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, Button, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import EditableField from './editableField';
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from '@expo-google-fonts/inter'
import { SplashScreen } from 'expo-router';

const Perfil = () => {
  const gamesLoaded: boolean = false;
  const avatarLoaded: boolean = false;

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  const [editVisible, setEditVisible] = useState(false);

  const handleEdit = () => {
    // Lógica de cadastro
    setEditVisible(true); // Mostra a modal

  };

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
      <View style={styles.containerProfileInfo}>
        {gamesLoaded ? (
          //se tiver encontrado a lista de jogos para exibir as imagens exibe o slide dos jogos recentes
          <Image source={require('../../../assets/images/HunTr_logo.png')} style={styles.profileInfoBackground} />
        ) : (
          //se não exibe uma imagem padrão
          <Image source={require('../../../assets/images/img-background.jpg')} style={styles.profileInfoBackground} />
        )}

        <Svg viewBox="0 0 428 150" style={styles.sombraProfileInfoBackground}>
          <Defs>
            <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="75%" stopColor="#000000" stopOpacity="0" />
              <Stop offset="100%" stopColor="#000000BF" />
            </LinearGradient>
          </Defs>

          {/* Aqui desenhamos um quadrado */}
          <Rect
            x="0"
            y="0"
            width="100%" // Largura do quadrado
            height="100%" // Altura do quadrado
            fill="url(#gradient)" // Aplica o degradê
          />
        </Svg>

        <View style={styles.row1}>
          {avatarLoaded ? (
            //se tiver encontrado a lista de jogos para exibir as imagens exibe o slide dos jogos recentes
            <Image source={require('../../../assets/images/example-avatar.png')} style={styles.avatarIcon} />
          ) : (
            //se não exibe uma imagem padrão
            <Image source={require('../../../assets/images/DefaultAvatar.png')} style={styles.avatarIcon} />
          )}

          <Text style={styles.infoText}>Nome de usuário</Text>

          <View style={styles.levelInfoContainer}>
            <Image source={require('../../../assets/images/level-icon.png')} style={styles.levelIcon} />
            <Text style={styles.levelText}>Nivel <Text style={styles.levelNumber}>453</Text></Text>
          </View>
        </View>

        <View style={styles.row2}>
          <View style={styles.infoContainer}>
            <Image source={require('../../../assets/images/controle-padrao.png')} style={styles.infoIcon} />
            <Text style={styles.highlightText}>641<Text style={styles.normalText}> jogos obtidos</Text></Text>
          </View>

          <View style={styles.infoContainer}>
            <Image source={require('../../../assets/images/controle-ouro.png')} style={styles.infoIcon} />
            <Text style={styles.highlightText}>51<Text style={styles.normalText}> jogos com 100%</Text></Text>
          </View>

          <View style={styles.infoContainer}>
            <Image source={require('../../../assets/images/trophie.png')} style={styles.infoIcon} />
            <Text style={styles.highlightText}>91<Text style={styles.normalText}> jogos platinados</Text></Text>
          </View>

          <View style={styles.infoContainer}>
            <Image source={require('../../../assets/images/contador.png')} style={styles.infoIcon} />
            <Text style={styles.highlightText}>15,268+<Text style={styles.normalText}> horas jogadas</Text></Text>
          </View>

        </View>
        <Text style={styles.titleText}>Informações da conta</Text>

        <View style={styles.editableFieldsContainer}>
          <EditableField
            title={"Nome completo"}
            value={"Nome de usuário da silva"}
            openEdit={() => setEditVisible(false)} // Fechar a modal ao pressionar o botão "Fechar"
          />
          <EditableField
            title={"Login"}
            value={"Login de usuário da silva"}
            openEdit={() => setEditVisible(false)} // Fechar a modal ao pressionar o botão "Fechar"
          />
          <EditableField
            title={"E-mail"}
            value={"emailUsuario@hotmail.com"}
            openEdit={() => setEditVisible(false)} // Fechar a modal ao pressionar o botão "Fechar"
          />
          <EditableField
            title={"Data de nascimento"}
            value={"13/10/2001"}
            openEdit={() => setEditVisible(false)} // Fechar a modal ao pressionar o botão "Fechar"
          />
        </View>


      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 24,
  },
  containerProfileInfo: {
    width: "100%",
    height: "40%",
    backgroundColor: "#1D1F2E",
  },
  profileInfoBackground: {
    width: "100%",
    height: "50%",
  },
  sombraProfileInfoBackground: {
    position: "absolute",
    width: "100%",
    height: "50%",
  },
  row1: {
    paddingBottom: 50,
    width: "100%",
    height: "25%",
    display: "flex",
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarIcon: {
    width: 100,
    height: 100,
  },
  infoText: {
    color: "#D9D9D9",
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    marginLeft: "5%",
    top: 10
  },
  levelInfoContainer: {
    top: 10,
    height: "100%",
    width: "20%",
    display: "flex",
    flexDirection: "row",
    marginLeft: "auto", // Adiciona espaçamento automático à esquerda
    alignItems: "center",
  },
  levelIcon: {
    height: 38,
    width: 38,
    marginRight: "10%"

  },
  levelText: {
    color: "#D9D9D9",
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    width: "50%",
    textAlign: "center"
  },
  levelNumber: {
    fontFamily: 'Inter_400Regular',
    textAlign: "center"
  },
  row2: {
    width: "100%",
    height: "25%",
    display: "flex",
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap", // Permite quebrar em múltiplas linhas
    justifyContent: "space-around", // Espaçamento uniforme para itens no centro
    alignContent: "center", // Centraliza as linhas verticalmente, se necessário
    bottom: 10,
  },
  infoContainer: {
    width: "45%", // Aproximadamente metade da largura, mantendo alinhamento
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  infoIcon: {
    width: 25,
    height: 25,
    marginRight: 8, // Adiciona espaço entre o ícone e o texto
  },
  normalText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#D9D9D9",
  },
  highlightText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#D9D9D9",
  },
  editableFieldsContainer: {

  },
  titleText: {
    fontFamily: "Inter_400Regular",
    fontSize: 20,
    color: "black",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20
  }
});

export default Perfil;
