import React, { useState, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';

const GestureScrollComponent = () => {
  const [scrollEnabled, setScrollEnabled] = useState(true); // Controle de rolagem
  const [isLongPress, setIsLongPress] = useState(false); // Flag de toque longo
  const longPressTimer = useRef<NodeJS.Timeout | null>(null); // Referência do timer

  // Função para lidar com o início do toque
  const handlePressIn = () => {
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
      setScrollEnabled(false); // Desabilita a rolagem após 1 segundo
    }, 1000); // Tempo de 1 segundo
  };

  // Função para lidar com o fim do toque
  const handlePressOut = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current); // Limpa o timer se o toque for rápido
    }
    if (isLongPress) {
      setIsLongPress(false);
      setScrollEnabled(true); // Reabilita a rolagem
    }
  };

  return (
    <ScrollView
      style={styles.scrollView}
      scrollEnabled={scrollEnabled} // Controla a rolagem com base no estado
    >
      <View
        style={styles.item}
        onStartShouldSetResponder={() => true}
        onResponderGrant={handlePressIn} // Inicia o timer ao pressionar
        onResponderRelease={handlePressOut} // Finaliza o timer ao soltar
      >
        <Text>Item com gesto de toque longo</Text>
        <Text>Item com gesto de toque longo</Text>
      </View>

      <GestureHandlerRootView style={[styles.wrapper]} >
        <PanGestureHandler
        // Aqui você pode adicionar a lógica do gesto, como você já tem
        >
          <View style={styles.swipeArea}>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
          </View>
        </PanGestureHandler>

        
      </GestureHandlerRootView>

      <View
        style={styles.item}
        onStartShouldSetResponder={() => true}
        onResponderGrant={handlePressIn} // Inicia o timer ao pressionar
        onResponderRelease={handlePressOut} // Finaliza o timer ao soltar
      >
        <Text>Item com gesto de toque longo</Text>
        <Text>Item com gesto de toque longo</Text>
      </View>

      <GestureHandlerRootView style={[styles.wrapper]} >
        <PanGestureHandler
        // Aqui você pode adicionar a lógica do gesto, como você já tem
        >
          <View style={styles.swipeArea}>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
            <Text>Área de swipe (gesto)</Text>
          </View>
        </PanGestureHandler>

        
      </GestureHandlerRootView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  item: {
    padding: 20,
    backgroundColor: 'lightgray',
    marginVertical: 10,
  },
  swipeArea: {
    padding: 20,
    backgroundColor: 'lightblue',
    marginVertical: 10,
  },
});

export default GestureScrollComponent;
