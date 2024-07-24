import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import UsuarioController from '../../src/controllers/usuarioController';
import Playlist from '@/src/models/playlistModel';

const usuarioController = new UsuarioController();

export default function HomeScreen() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  const carregarPlaylist = async () => {
    try {
      const loadedPlaylists = await usuarioController.criarNovasPlaylistUsuario();
      console.log("Esta é a playlist carregada: " + loadedPlaylists);
      if (loadedPlaylists) {
        setPlaylists(loadedPlaylists);
        setSelectedPlaylist(loadedPlaylists[0]); // Seleciona a primeira playlist por padrão
      } else {
        console.log("playlist undefined");
      }
    } catch (error) {
      console.error("Erro ao carregar a playlist:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {selectedPlaylist ? (
          <>
            <Text>Categoria da playlist: {selectedPlaylist.getCategoria()}</Text>
            <Text>Plataforma: {selectedPlaylist.getPlataforma()}</Text>
            <Text>Jogos:</Text>
            {selectedPlaylist.getJogos().map((jogo, index) => (
              <View key={index} style={styles.jogoContainer}>
                {jogo.getBundle() ? (
                  <>
                    <Text>Bundle: {jogo.getNome()}</Text>
                    <Text>Jogos do bundle:</Text>
                    {jogo.getJogos().map((jogoDoBundle, index) => (
                      <View key={index} style={styles.jogoDoBundleContainer}>
                        <Text>- Jogo: {jogoDoBundle.getNome()}</Text>
                        <Text>Troféus:</Text>
                        {jogoDoBundle.getTrofeus().map((trofeu, index) => (
                          <Text key={index}>-- {trofeu.getNome()}</Text>
                        ))}
                      </View>
                    ))}
                  </>
                ) : (
                  <>
                    <Text>Jogo: {jogo.getNome()}</Text>
                    <Text>Troféus:</Text>
                    {jogo.getTrofeus().map((trofeu, index) => (
                      <Text key={index}>- {trofeu.getNome()}</Text>
                    ))}
                  </>
                )}
              </View>
            ))}
          </>
        ) : (
          <Text>Playlist não carregada</Text>
        )}
        <Button title="Carregar Playlist" onPress={carregarPlaylist} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  jogoContainer: {
    marginBottom: 16,
  },
  jogoDoBundleContainer: {
    marginBottom: 8,
    paddingLeft: 16,
  },
});
