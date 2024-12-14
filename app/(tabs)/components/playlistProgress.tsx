import React from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

interface PlaylistProgressComponentProps {
  progresso: number;
  numJogoPlaylist: number;
}

const PlaylistProgressComponent: React.FC<PlaylistProgressComponentProps> = ({ progresso, numJogoPlaylist }) => {
  const progressAnim = new Animated.Value(progresso);

  // Animação para o progresso
  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progresso,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [progresso]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Obtendo jogos da PSN <Text style={styles.destaque}>{numJogoPlaylist}/15</Text> ({progresso}%)</Text>
      <View style={styles.progressBarBackground}>
        {/* Barra de progresso animada */}
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: '#08BFB5', // Cor para a parte do progresso
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: "100%",
  },
  text: {
    fontSize: 14,
    marginBottom: 10,
    fontFamily: 'Inter_400Regular',
  },
  destaque: {
    fontSize: 14,
    marginBottom: 10,
    fontFamily: 'Inter_700Bold',
  },
  progressBarBackground: {
    height: 10,
    width: '100%',
    backgroundColor: '#D9D9D9', // Cor para o fundo da barra (parte não concluída)
    borderRadius: 5,
    overflow: 'hidden', // Garante que o conteúdo não ultrapasse as bordas
  },
  progressBar: {
    height: '100%',
  },
});

export default PlaylistProgressComponent;
