import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { SplashScreen, useLocalSearchParams } from 'expo-router';
import InicioComponent from './playlistComponents/InicioComponent';
import TrophyCardComponent from './trophyCardComponent';
import FilterModalComponent from './playlistComponents/FilterModalComponent';
import GameResumeComponent from './playlistComponents/GameResumeComponent';

const TrophyListScreen = () => {
  const params = useLocalSearchParams<{ jogo: string }>();

  // Fazendo parse do JSON recebido como string
  const jogo = params.jogo ? JSON.parse(params.jogo) : [];
  const trofeus = jogo.trofeus;

  // Estado para armazenar os troféus
  const [filteredTrophys, setFilteredTrophys] = useState(trofeus);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [orderByTags, setOrderByTags] = useState(true);
  const [orderByConquistado, setOrderByConquistado] = useState(true);
  const [awaysRevealed, setAwaysRevealed] = useState(false);


  // Carrega as fontes
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const groupedTrophys = filteredTrophys.reduce((groups: any, trofeu: any) => {
    if (!orderByTags ) {
      // Apenas dois grupos: Conquistados e Não Conquistados
      const groupKey = trofeu.conquistado ? "Conquistados" : "Não Conquistados";
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(trofeu);
      return groups;
    }

    // Lógica atual de agrupamento por tags/categorias
    if (trofeu.conquistado && orderByConquistado) {
      if (!groups["Conquistados"]) {
        groups["Conquistados"] = [];
      }
      groups["Conquistados"].push(trofeu);
      return groups;
    }

    if ((!trofeu.tags || trofeu.tags.length === 0) && trofeu.tipo !== "platinum") {
      if (!groups["Sem Tag"]) {
        groups["Sem Tag"] = [];
      }
      groups["Sem Tag"].push(trofeu);
      return groups;
    }

    if (trofeu.tipo === "platinum") {
      if (!groups["Platina"]) {
        groups["Platina"] = [];
      }
      groups["Platina"].push(trofeu);
      return groups;
    }

    // Agrupamento por combinações específicas de tags
    const multiplayerTags = ["Multiplayer Only", "Online Required"];
    const hasMultiplayerTags = multiplayerTags.every(tag => trofeu.tags.includes(tag));
    if (hasMultiplayerTags) {
      if (!groups["Multiplayer Only e Online Required"]) {
        groups["Multiplayer Only e Online Required"] = [];
      }
      groups["Multiplayer Only e Online Required"].push(trofeu);
      return groups;
    }

    // Agrupamento por tags individuais
    trofeu.tags.forEach((tag: string) => {
      if (!groups[tag]) {
        groups[tag] = [];
      }
      groups[tag].push(trofeu);
    });

    return groups;
  }, {});

  // Tags dinâmicas que serão organizadas entre Platina e Sem Tag
  const dynamicOrder = [
    "Story",
    "Unmissable",
    "Difficulty Specific",
    "Missable",
    "Collectable",
    "Co‑Op or Solo",
    "Co-op",
    "Multiplayer",
    "Multiplayer Only e Online Required",
    "Multiplayer Only", "Online Required",
    "Grind",
    "Conquistados"
  ];

  // Função que retorna a prioridade de cada categoria
  const getPriority = (category: string) => {
    if (category === "Platina") return -Infinity; // Prioridade máxima para Platina
    if (category === "Sem Tag") return Infinity - 1;  // Penúltima prioridade para Sem Tag
    if (category === "Conquistados") return Infinity; // Última prioridade para Conquistados

    // Verifica a posição no array de ordem dinâmica
    const dynamicIndex = dynamicOrder.indexOf(category);
    return dynamicIndex !== -1 ? dynamicIndex : dynamicOrder.length; // Coloca não listados no final das dinâmicas
  };

  // Ordenar as categorias com base nas prioridades
  const categories = Object.keys(groupedTrophys)
    .sort((a, b) => getPriority(a) - getPriority(b))
    .map((category) => ({
      category,
      trofeus: groupedTrophys[category],
    }));


  const aplicarFiltros = (criterios: { sortBy: string, groupByTags: boolean, groupByConquistado: boolean, awaysRevealed: boolean }) => {
    let trofeusFiltrados = [...filteredTrophys];

    // Ordenando os troféus de acordo com o critério
    if (criterios.sortBy === 'historia') {
      trofeusFiltrados.sort((a, b) => {
        if (a.tags && a.tags.includes('Story') && !b.tags.includes('Story')) return -1;
        if (!a.tags.includes('Story') && b.tags.includes('Story')) return 1;
        return a.nome.localeCompare(b.nome); // Ordenação alfabética
      });
    } else if (criterios.sortBy === 'online') {
      trofeusFiltrados.sort((a, b) => {
        const aOnline = a.tags && a.tags.includes('Online Required') ? 1 : 0;
        const bOnline = b.tags && b.tags.includes('Online Required') ? 1 : 0;
        return bOnline - aOnline; // Coloca online-required primeiro
      });
    } else if (criterios.sortBy === 'tipo') {
      trofeusFiltrados.sort((a, b) => a.tipo.localeCompare(b.tipo)); // Ordenação por tipo
    } else if (criterios.sortBy === 'raridade') {
      trofeusFiltrados.sort((a, b) => a.raridade - b.raridade); // Ordenação por raridade
    }

    // Configurações adicionais de agrupamento
    if (!criterios.groupByTags) {
      setOrderByTags(false);
    } else {
      setOrderByTags(true);
    }

    if (!criterios.awaysRevealed) {
      setAwaysRevealed(false);
    } else {
      setAwaysRevealed(true);
    }

    if (!criterios.groupByConquistado) {
      setOrderByConquistado(false);
    } else {
      setOrderByConquistado(true);
    }

    setFilteredTrophys(trofeusFiltrados);
  };


  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };


  const inverterLista = () => {
    setFilteredTrophys((prevGames: any) => [...prevGames].reverse());
  };

  return (
    <View style={styles.container}>
      <InicioComponent
        titleText={"Troféus"}
        openFilters={() => setFilterModalVisible(true)}
        organizar={inverterLista} // Passe a função de inverter para o componente InicioComponent
        tela={"trofeus"}
      />

      <FlatList
        ref={flatListRef}
        data={orderByTags ? categories : Object.entries(groupedTrophys)} // Use Object.entries para "Conquistados" e "Não Conquistados"
        keyExtractor={(item) => (orderByTags ? item.category : item[0])} // Ajuste a chave para exibir corretamente
        renderItem={({ item }) => {
          if (orderByTags) {
            return (
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryTitle}>{item.category +": "+ item.trofeus.length}</Text>
                <FlatList
                  data={item.trofeus}
                  keyExtractor={(subItem) => subItem.idTrofeu}
                  renderItem={({ item: trofeu }) => <TrophyCardComponent awaysRevealed={awaysRevealed} trofeu={trofeu} />}
                  scrollEnabled={false}
                />
              </View>
            );
          } else {
            const [group, trofeus] = item; // group = "Conquistados" ou "Não Conquistados", trofeus = lista
            return (
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryTitle}>{group + ": " + item[1].length}</Text>
                {trofeus.map((trofeu: any) => (
                  <TrophyCardComponent key={trofeu.idTrofeu} awaysRevealed={awaysRevealed} trofeu={trofeu} />
                ))}
              </View>
            );
          }
        }}
        ListHeaderComponent={<GameResumeComponent jogo={jogo} />}
        scrollEventThrottle={16}
        initialNumToRender={7}
        maxToRenderPerBatch={1}
        windowSize={10}
        style={[{ marginVertical: 10 }]}
      />


      <FilterModalComponent
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilters={aplicarFiltros}
        tela={"trofeus"}
      />

      {
        showScrollTopButton && (
          <TouchableOpacity style={styles.scrollTopButton} onPress={scrollToTop}>
            <Image source={require('../../../assets/images/btn-top.png')} style={styles.btnTopIcon} />
          </TouchableOpacity>
        )
      }
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40
  },
  scrollView: {
    top: 10,
  },
  preenchimento: {
    width: "100%",
    height: 100
  },
  scrollTopButton: {
    position: 'absolute',
    bottom: "10%",
    right: 30,
    backgroundColor: '#1D1F2E',
    borderRadius: 30,
    width: 50,
    height: 50
  },
  btnTopIcon: {
    width: "99%",
    height: "99%"
  },
  categoryContainer: {
    marginVertical: 15,
  },
  categoryTitle: {
    fontSize: 18,
    marginBottom: 5,
    color: '#26283C',
    fontFamily: "Inter_400Regular",
  },
});

export default TrophyListScreen;
