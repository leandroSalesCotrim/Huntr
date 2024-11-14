import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface FilterModalComponentProps {
    visible: boolean;
    onClose: () => void;
    onApplyFilters: (criteria: { sortBy: string }) => void;
}

const FilterModalComponent: React.FC<FilterModalComponentProps> = ({ visible, onClose, onApplyFilters }) => {
    const [sortBy, setSortBy] = useState('nome');  // Critério de ordenação (pode ser 'nome' ou 'dificuldade')

    const options = [
        { label: 'Ultimos jogados (Padrão)', value: 'recentes' },
        { label: 'Progresso', value: 'progresso' },
        { label: 'Dificuldade', value: 'dificuldade' },
        { label: 'Tempo para platinar', value: 'tempoParaPlatinar' },
    ];

    const aplicarFiltros = () => {
        onApplyFilters({ sortBy });
        onClose();
    };

    const renderItem = ({ item }: { item: { label: string; value: string } }) => {
        return (
            <TouchableOpacity
                style={styles.optionContainer}
                onPress={() => setSortBy(item.value)}
            >
                <Text style={styles.optionText}>{item.label}</Text>
                <View style={styles.circle}>
                    {sortBy === item.value && <View style={styles.selectedCircle} />}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Modal visible={visible} transparent={true} animationType="slide">
            <LinearGradient
                colors={['#2C2F44', '#1D1F2E']}  // Degradê
                style={styles.modalContent}
            >
                <Text style={styles.modalTitle}>Classificar por</Text>

                <FlatList
                    data={options}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.value}
                />

                <TouchableOpacity style={styles.button} onPress={aplicarFiltros}>
                    <Text style={styles.buttonText}>Atualizar filtros</Text>
                </TouchableOpacity>
                
            </LinearGradient>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        paddingHorizontal: 50,
        paddingVertical: 20,
        borderRadius: 10,
        width: '100%',
        position: 'absolute',
        bottom: 0,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: "Inter_400Regular",
        marginBottom: 20,
        color: '#fff',
    },
    optionContainer: {
        flexDirection: 'row',  // Mantém o texto à esquerda e o círculo à direita
        alignItems: 'center',
        marginVertical: 10,
        justifyContent: 'space-between',  // Garante que o texto e o círculo fiquem nas extremidades
    },
    circle: {
        width: 18,
        height: 18,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedCircle: {
        width: 10,
        height: 10,
        borderRadius: 6,
        backgroundColor: '#fff',
    },
    optionText: {
        fontSize: 14,
        color: '#fff',
        fontFamily: "Inter_400Regular",
    },
    button: {
        width:"70%",
        backgroundColor: '#D9D9D9',
        padding: 10,
        borderRadius: 30,
        marginTop: 30,
        alignItems: 'center',
        alignSelf:"center"
    },
    buttonText: {
        color: 'black',
        fontSize: 14,
    },
});

export default FilterModalComponent;
