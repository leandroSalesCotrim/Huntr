// app/components/TrophyCardComponent.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, ScrollView, } from 'react-native';
import {
    useFonts,
    Inter_400Regular,
    Inter_700Bold,
} from '@expo-google-fonts/inter'
import { SplashScreen } from 'expo-router';

interface TrophyCardComponentProps {
    trofeu: any
    awaysRevealed: boolean
}

const TrophyCardComponent: React.FC<TrophyCardComponentProps> = React.memo(({ trofeu, awaysRevealed }) => {
    const [showGuide, setShowGuide] = useState(false);
    const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold });
    const [isRevealed, setIsRevealed] = useState(false);  // Estado para controlar a revelação

    let heightContainer = 120;

    if (trofeu.descricao.length > 120) {
        heightContainer = 150;
    } else if (trofeu.descricao.length > 100) {
        heightContainer = 140;
    } else if (trofeu.descricao.length > 80) {
        heightContainer = 130;
    }

    const toggleGuide = () => setShowGuide(!showGuide);

    useEffect(() => {
        if (awaysRevealed) {
            setIsRevealed(true);
        } else {
            setIsRevealed(false);
        }
    }, [awaysRevealed]);

    const handleLongPress = () => {
        setIsRevealed(true);  // Revela as informações quando pressionado por mais tempo
    };

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return <ActivityIndicator size="large" color="#0000ff" />; // Ou outro indicador de carregamento
    }

    const tags: string[] = trofeu.tags;
    let urlTrophyType;
    let rarityColor;
    let rarityLevel;
    let rarityIcon;
    let borderColor;
    let formattedDate;
    if (trofeu.conquistado) {
        if (trofeu.dataConquistado) {
            const date = new Date(trofeu.dataConquistado);

            if (!isNaN(date.getTime())) {
                // Formata a data manualmente
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês começa do zero
                const year = date.getFullYear();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');

                formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;
            } else {
                formattedDate = "Data inválida"; // Mensagem padrão para datas inválidas
            }
        } else {
            formattedDate = "Não disponível"; // Mensagem padrão se a data estiver ausente
        }
    }

    if (trofeu.tipo === 'bronze') {
        urlTrophyType = require('../../../assets/images/trofeu-bronze.png');
    } else if (trofeu.tipo === 'silver') {
        urlTrophyType = require('../../../assets/images/trofeu-prata.png');
    } else if (trofeu.tipo === 'gold') {
        urlTrophyType = require('../../../assets/images/trofeu-ouro.png');
    } else if (trofeu.tipo === 'platinum') {
        urlTrophyType = require('../../../assets/images/trofeu-platina.png');
    } else {
        urlTrophyType = require('../../../assets/images/cadeado.png');
    }

    switch (trofeu.raridade) {
        case 0:
            rarityColor = '#D65C5C';
            rarityLevel = "Muito raro";
            rarityIcon = require('../../../assets/images/rarity-0.png');
            break;
        case 1:
            rarityColor = '#E7A924';
            rarityLevel = "Raro";
            rarityIcon = require('../../../assets/images/rarity-1.png');
            break;
        case 2:
            rarityColor = '#B9E724';
            rarityLevel = "Incomum";
            rarityIcon = require('../../../assets/images/rarity-2.png');
            break;
        case 3:
            rarityColor = '#57B3FF';
            rarityLevel = "Comum";
            rarityIcon = require('../../../assets/images/rarity-3.png');
            break;
        default:
            break;
    }

    borderColor = trofeu.conquistado ? '#57B3FF' : '#333335';

    return (

        <View style={[styles.container, { height: heightContainer }, showGuide && styles.expandedContainer]} >
            <View style={styles.row}>
                <View style={styles.imageBoxContainer}>
                    <TouchableOpacity
                        onPress={toggleGuide}
                        onLongPress={handleLongPress} // Adiciona o evento onLongPress
                        style={[styles.imageBox, { backgroundColor: "#333335", borderColor: borderColor }]}>

                        {trofeu.conquistado || !trofeu.oculto || isRevealed ? (
                            <Image source={{ uri: trofeu.iconeUrl }} style={styles.gameImage} />
                        ) : (
                            <Image source={require('../../../assets/images/cadeado.png')} style={styles.gameImageHidden} />
                        )}

                    </TouchableOpacity>

                    {trofeu.conquistado && (
                        <Text style={styles.smallText}>{formattedDate}</Text>
                    )}
                </View>



                <View style={styles.detailBox}>
                    <View style={styles.titleBox}>
                        <Image source={urlTrophyType} style={styles.trophyTypeImage} />
                        <Text style={styles.title}>
                            {trofeu.conquistado || !trofeu.oculto || isRevealed ? trofeu.nome : 'Troféu oculto'}
                        </Text>
                    </View>
                    <Text style={styles.description}>
                        {trofeu.conquistado || !trofeu.oculto || isRevealed ? trofeu.descricao : 'Descrição oculta'}
                    </Text>
                    {tags.length > 0 && (
                        <View style={styles.tagsBox}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {tags.map((tag, index) => (
                                    <View style={styles.tag} key={index}>
                                        <Text style={styles.darkText}>{tag}</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                </View>

                <View style={styles.extraBox}>
                    <View style={styles.ytBox}>
                        <Image source={require('../../../assets/images/youtube.png')} style={styles.ytIcon} />
                        <Text style={styles.ytText}>{"Ver no \n youtube"}</Text>
                    </View>
                    <View style={styles.rarityIconBox}>
                        <Image source={rarityIcon} style={styles.ytIcon} />
                        <Text style={styles.ytText}>{rarityLevel + "\n" + trofeu.taxaConquistado + "%"}</Text>
                    </View>
                </View>

            </View>
            <View style={[styles.rarityColorBox, { backgroundColor: rarityColor }]}>
            </View>
            {showGuide && (
                <View style={styles.guideBox}>
                    <Text style={styles.guideTitle}>Guia do trofeu</Text>
                    <ScrollView
                        showsHorizontalScrollIndicator={false}
                        nestedScrollEnabled={true}
                        onStartShouldSetResponder={() => true}

                    >
                        <Text style={styles.guideContent}>
                            {trofeu.conquistado || !trofeu.oculto || isRevealed ? trofeu.guia : 'Descrição oculta, segure o icone do cadeado para revelar as informações deste troféu'}
                        </Text>
                    </ScrollView>
                </View>
            )}
        </View>

    );
});

const styles = StyleSheet.create({
    container: {
        display: "flex",
        width: '100%',
        backgroundColor: '#1D1F2E',
        padding: 15,
        borderTopLeftRadius: 15,
        borderBottomLeftRadius: 15,
        overflow: "hidden",
        marginVertical: 5,
        justifyContent: "space-between"
    },
    expandedContainer: {
        height: 250, // Expande o container ao mostrar o guia
    },
    row: {
        flexDirection: 'row',
        width: "100%",
        margin: "auto",
    },
    imageBoxContainer: {
        width: 80,
        alignSelf: "center",
    },
    smallText: {
        color: '#CFCFCF',
        fontSize: 9,
        fontFamily: "Inter_400Regular",
        paddingTop:5,
    },
    imageBox: {
        height: 80,
        width: "100%",
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        overflow: 'hidden',
        borderWidth: 2,
    },
    gameImage: {
        height: '100%',
        width: '100%',
    },
    gameImageHidden: {
        height: '70%',
        width: '70%',
    },
    detailBox: {
        marginLeft: 10,
        height: "100%",
        width: "53%",
    },
    titleBox: {
        flexDirection: 'row',
        alignItems: 'center',
        width: "100%",
    },
    title: {
        color: '#CFCFCF',
        fontSize: 14,
        fontFamily: "Inter_400Regular",
    },
    trophyTypeImage: {
        width: 20,
        height: 20,
        marginRight: 5,
    },
    description: {
        color: '#CFCFCF',
        fontSize: 10,
        fontFamily: "Inter_400Regular",
        marginVertical: 5,
    },
    tagsBox: {
        backgroundColor: '#2C2F44',
        flexDirection: 'row',
        borderRadius: 10,
        padding: 5,
        width: "95%",
    },
    tag: {
        backgroundColor: '#D9D9D9',
        borderRadius: 40,
        paddingHorizontal: 10,
        paddingVertical: 2,
        marginRight: 5,
    },
    darkText: {
        color: '#26283C',
        fontSize: 9,
        fontFamily: "Inter_400Regular",
    },
    extraBox: {
        width: "20%",
        justifyContent: "space-between",
        alignItems: "center",
        position: "absolute",
        right: 0,
        alignSelf: "center"
    },
    ytBox: {
        width: "100%",
        height: "45%",
        alignItems: "center",

    },
    ytText: {
        color: "#CFCFCF",
        fontFamily: "Inter_400Regular",
        fontSize: 8,
        textAlign: "center"
    },
    ytIcon: {
        width: 20,
        height: 20,
    },
    rarityIconBox: {
        width: "100%",
        height: "45%",
        alignItems: "center",
    },
    rarityColorBox: {
        height: "150%",
        width: "1.5%",
        alignSelf: "center",
        position: "absolute",
        right: 0
    },
    guideBox: {
        marginTop: 10,
        backgroundColor: '#2C2F44',
        padding: 10,
        height: "50%"
    },
    guideTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: "Inter_700Bold",
    },
    guideContent: {
        color: '#CFCFCF',
        fontSize: 12,
        marginTop: 5,
        fontFamily: "Inter_400Regular",
    },
});

export default TrophyCardComponent;