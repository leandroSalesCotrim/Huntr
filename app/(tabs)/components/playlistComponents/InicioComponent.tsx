// app/components/inicio.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, TextInput } from 'react-native';
import {
    useFonts,
    Inter_400Regular,
    Inter_700Bold,
} from '@expo-google-fonts/inter'
import { SplashScreen } from 'expo-router';

interface InicioComponentProps {
    titleText: string
}

const InicioComponent: React.FC<InicioComponentProps> = ({ titleText }) => {
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
                    <Image source={require('../../../../assets/images/atualizar.png')} style={styles.icon} />
                    <Image source={require('../../../../assets/images/filtro.png')} style={styles.icon} />
                    <Image source={require('../../../../assets/images/organizar.png')} style={styles.icon} />
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
        marginLeft: 7,
        marginRight: 7,

    },
    row_2: {
        display: "flex",
        width: "100%",
        height: "50%",
        borderRadius: 30,
        backgroundColor: "#D9D9D9",
        flexDirection:"row",
        paddingLeft:15,
        paddingRight:15,
        top:10,

    },
    searchIcon:{
        width: 30,
        height: 30,
        backgroundColor:"#26283B",
        borderRadius:30,
        alignSelf:"center"
    },
    input:{
        marginLeft:"5%",
        height:"100%",

    }

});

export default InicioComponent;
