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
            <View style={styles.gradientContainer}> 
                <LinearGradient
                    colors={['#2C2F44', '#1D1F2E']}  
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
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    gradientContainer: {
        borderWidth: 2, // Define a espessura da borda
        borderColor: '#26283C', // Cor da borda
        borderTopLeftRadius: 20, // Ajuste o raio conforme necessário
        borderTopRightRadius: 20, // Ajuste o raio conforme necessário
        overflow: 'hidden', // Garante que o conteúdo do LinearGradient seja cortado para caber na View
        width: '102%',
        position: 'absolute',
        bottom: 0,
        alignSelf:"center",
    },
    modalContent: {
        paddingHorizontal: 50, // Adiciona o padding aqui
        paddingVertical: 20, // Adiciona o padding aqui
        width: '100%', 
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
        width: "70%",
        backgroundColor: '#D9D9D9',
        padding: 10,
        borderRadius: 30,
        marginTop: 30,
        alignItems: 'center',
        alignSelf: "center"
    },
    buttonText: {
        color: 'black',
        fontSize: 14,
    },
});

export default FilterModalComponent;
