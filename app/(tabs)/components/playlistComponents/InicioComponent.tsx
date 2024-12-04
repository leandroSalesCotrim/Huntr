// app/components/inicioComponent.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, TextInput } from 'react-native';
import {
    useFonts,
    Inter_400Regular,
    Inter_700Bold,
} from '@expo-google-fonts/inter'
import { SplashScreen } from 'expo-router';
import Svg, { Circle, Defs, ClipPath, Rect, G } from 'react-native-svg';

interface InicioComponentProps {
    titleText: string;
    openFilters: () => void;
    organizar: () => void; // Adicione esta nova prop
    tela: string
}

const InicioComponent: React.FC<InicioComponentProps> = ({ titleText, openFilters, organizar, tela }) => {
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

    return (
        <View style={styles.container}>
            <View style={styles.row_1}>
                <Text style={styles.title}>{titleText}</Text>
                <View style={styles.boxIcons}>
                    {tela != "trofeus" ? (
                        <>
                            <TouchableOpacity >
                                <Image source={require('../../../../assets/images/atualizar.png')} style={styles.icon} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={openFilters} >
                                <Image source={require('../../../../assets/images/filtro.png')} style={styles.icon} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={organizar}>
                                <Image source={require('../../../../assets/images/organizar.png')} style={styles.icon} />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>

                            <TouchableOpacity onPress={openFilters}>
                                <Image source={require('../../../../assets/images/filtro.png')} style={styles.icon} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={organizar}>
                                <Image source={require('../../../../assets/images/organizar.png')} style={styles.icon} />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.btnVoltar} >
                                <Svg width="30" height="30" viewBox="0 0 50 50" fill="none">
                                    <Circle cx="25" cy="25" r="24" fill="#1D1F2E" />
                                    <Defs>
                                        <ClipPath id="clip0_65_3060">
                                            <Rect width="50" height="50" fill="white" />
                                        </ClipPath>
                                    </Defs>
                                    <G clipPath="url(#clip0_65_3060)">
                                        <Circle cx="25" cy="25" r="24" stroke="#D65C5C" strokeWidth="2" />
                                        <Circle cx="25" cy="25" r="12" stroke="#D65C5C" strokeWidth="3" />
                                    </G>
                                </Svg>
                            </TouchableOpacity>
                        </>
                    )}

                </View>
            </View>
            <View style={styles.row_2}>
                <Image source={require('../../../../assets/images/pesquisa.png')} style={styles.searchIcon} />
                <TextInput style={styles.input} textContentType='none' placeholder='Pesquisar' placeholderTextColor={"#26283B"}></TextInput>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: "10%",
    },
    row_1: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"

    },
    title: {
        color: "black",
        fontFamily: "Inter_400Regular",
        fontSize: 20,
    },
    boxIcons: {
        display: "flex",
        flexDirection: "row",
    },
    icon: {
        width: 30,
        height: 30,
        marginHorizontal: 7,
    },
    row_2: {
        display: "flex",
        width: "100%",
        height: "50%",
        borderRadius: 30,
        backgroundColor: "#D9D9D9",
        flexDirection: "row",
        paddingLeft: 15,
        paddingRight: 15,
        top: 10,

    },
    searchIcon: {
        width: 30,
        height: 30,
        backgroundColor: "#26283B",
        borderRadius: 30,
        alignSelf: "center"
    },
    input: {
        marginLeft: "5%",
        height: "100%",

    },
    btnVoltar: {
        marginHorizontal: 7,
    },

});

export default InicioComponent;
