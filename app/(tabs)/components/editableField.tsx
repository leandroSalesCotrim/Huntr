// app/components/CustomModal.tsx
import React, { useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import {
    useFonts,
    Inter_400Regular,
    Inter_700Bold,
} from '@expo-google-fonts/inter'
import { SplashScreen } from 'expo-router';

interface CustomFieldProps {
    title: string;
    value: string;
    openEdit: () => void;
}

const EditableField: React.FC<CustomFieldProps> = ({ title, value, openEdit }) => {
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
            <View style={styles.textBox}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.text}>{value}</Text>
            </View>
            <TouchableOpacity onPress={openEdit} style={styles.button}>
                <Image source={require('../../../assets/images/editar.png')} style={styles.buttonIcon} />
            </TouchableOpacity>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#D9D9D9",
        borderRadius: 10,
        alignSelf: "center",
        width: "90%",
        height: "19%",
        padding: 15,
        display: "flex",
        flexDirection:"row",
        alignItems:"center",
        justifyContent: "space-between",
        marginTop:10,
        marginBottom:10
    },
    textBox: {
        width: "70%",
    },
    title: {
        color: "black",
        fontFamily: 'Inter_700Bold',
        fontSize: 16,
    },
    text: {
        color: "black",
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
    },
    button: {
    },
    buttonIcon:{
        width:25,
        height:25,
    }

});

export default EditableField;
