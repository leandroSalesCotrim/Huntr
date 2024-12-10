// app/components/GameCardDefaultComponent.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, TextInput } from 'react-native';
import {
    useFonts,
    Inter_400Regular,
    Inter_700Bold,
} from '@expo-google-fonts/inter'
import { SplashScreen } from 'expo-router';
import Jogo from '@/src/models/jogoModel';
import CircularChart from './CircularChart';
import { ScrollView } from 'react-native-gesture-handler';

interface GameCardDefaultComponentProps {
    jogo: Jogo;
    openModal: (jogo: Jogo) => void;  // Adicionando a função onPress aqui
}


const GameCardDefaultComponent: React.FC<GameCardDefaultComponentProps> = ({ jogo, openModal }) => {
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
        return <ActivityIndicator size="large" color="#0000ff" />; // Ou outro indicador de carregamento
    }
    let tags: string[];

    //gambiarra
    if (jogo.getTags().length > 0) {
        tags = jogo.getTags();

    } else {
        tags = Array.from(new Set(jogo.getTrofeus().flatMap(trofeu => trofeu.getTags())));

    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.imageBox} onPress={() => openModal(jogo)}>
                {jogo.getIconeUrl() ? (
                    <Image source={{ uri: jogo.getIconeUrl() }} style={styles.gameImage} resizeMode='stretch' />
                ) : (
                    <Image source={require('../../../../assets/images/defaultGameImage.jpg')} style={styles.gameImage} />
                )}
            </TouchableOpacity>

            <View style={styles.detailBox}>
                <View style={styles.row_1}>
                    <View style={styles.row_1_leftSide}>
                        <Text style={styles.title} numberOfLines={3} ellipsizeMode="tail">{jogo.getNome()}</Text>
                        <View style={styles.platformBox}><Text style={styles.darkText}>{jogo.getPlataforma()}</Text></View>
                    </View>

                    <View style={styles.row_1_RightSide}>
                        <CircularChart percentual={jogo.getProgresso()} tamanho={50} largura={3} />
                    </View>

                </View>

                <View style={styles.row_2}>
                    <View style={styles.row_2_leftSide}>
                        <Text style={styles.lightText}>Tempo para platinar</Text>
                        <Text style={styles.lightHighLightText}>{jogo.getTempoParaPlatinar()} hora/s</Text>
                    </View>

                    <View style={styles.row_2_RightSide}>
                        <Text style={styles.lightText}>Dificuldade</Text>
                        <Text style={styles.lightHighLightText}>{jogo.getDificuldade()}/10</Text>
                    </View>

                </View>

                <View style={styles.row_3}>
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
                        {tags.map((tag, index) => (
                            <View
                                style={styles.tagBox}
                                key={index}
                            >
                                <Text style={styles.darkText}>{tag}</Text>
                            </View>
                        ))}
                    </ScrollView>


                </View>

            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
        width: "100%",
        height: 212,
        backgroundColor: "#1D1F2E",
        marginTop: 5,
        marginBottom: 5,
        borderRadius: 35,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,

        elevation: 2,
    },
    imageBox: {
        height: "100%",
        width: "53%",
        borderTopLeftRadius: 15,
        borderBottomLeftRadius: 15,
    },
    gameImage: {
        height: "100%",
        width: "100%",
        borderTopLeftRadius: 15,
        borderBottomLeftRadius: 15,
    },
    detailBox: {
        height: "100%",
        width: "57%",
        position: "absolute",
        right: 0,
        backgroundColor: "#1D1F2E",
        borderRadius: 15,
        padding: 10,
    },
    row_1: {
        width: "100%",
        height: "50%",
    },
    row_1_leftSide: {
        position: "absolute",
        width: "70%",
        height: "100%",
        left: 0,
    },
    title: {
        color: "#CFCFCF",
        fontFamily: "Inter_700Bold",
        fontSize: 15,
    },
    platformBox: {
        backgroundColor: "#D9D9D9",
        width: "30%",
        height: "20%",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 5,
    },
    darkText: {
        color: "#26283C",
        fontFamily: "Inter_400Regular",
        fontSize: 12,
    },
    lightText: {
        color: "#CFCFCF",
        fontFamily: "Inter_400Regular",
        fontSize: 10,
    },
    lightHighLightText: {
        color: "#CFCFCF",
        fontFamily: "Inter_700Bold",
        fontSize: 12,
    },
    row_1_RightSide: {
        width: "30%",
        height: "100%",
        position: "absolute",
        right: 0,
    },
    row_2: {
        width: "100%",
        height: "20%",
        margin: "auto",
    },
    row_2_leftSide: {
        position: "absolute",
        width: "70%",
        height: "100%",
        left: 0,
    },
    row_2_RightSide: {
        width: "30%",
        height: "100%",
        position: "absolute",
        right: 0,
    },
    row_3: {
        width: "100%",
        backgroundColor: "#2C2F44",
        flexDirection: "row",
        flexWrap: "wrap",
        alignSelf: "center",
        alignItems: "center",
        paddingVertical: 5,
        borderRadius: 10
    },
    tagBox: {
        backgroundColor: "#D9D9D9",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
        paddingVertical: 3,
        marginLeft: 5,
        marginRight: 5,
        borderRadius: 5,
    },
    tagScroll: {
        marginBottom: 10,  // Pequeno espaçamento para separar as tags
    },
});

export default GameCardDefaultComponent;
