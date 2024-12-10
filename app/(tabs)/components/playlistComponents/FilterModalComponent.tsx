import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface FilterModalComponentProps {
    visible: boolean;
    tela: string;
    onClose: () => void;
    onApplyFilters: (criteria: { sortBy: string, groupByTags: boolean, groupByConquistado: boolean, awaysRevealed: boolean }) => void;
}

const FilterModalComponent: React.FC<FilterModalComponentProps> = ({ visible, onClose, onApplyFilters, tela }) => {
    const [sortBy, setSortBy] = useState('nome');  // Critério de ordenação (pode ser 'nome' ou 'dificuldade')
    const [groupByTags, setGroupByTags] = useState(true);
    const [groupByConquistado, setGroupByConquistado] = useState(true);
    const [awaysRevealed, setAwaysRevealed] = useState(false);
    const [switchStates, setSwitchStates] = useState<{ [key: string]: boolean }>({}); // Estado separado para cada switch
    interface Option {
        label: string;
        value: string;
    }
    
    let options: Option[] = [];  // Define que `options` é um array de objetos `Option`
    let extraOptions;

   
    if (tela = "trofeus") {
        if (groupByTags) {
            options = [
                { label: 'História primeiro (Padrão)', value: 'historia' },
                { label: 'Multiplayer primeiro', value: 'online' },
            ];
        }
        options.push(
            { label: 'Tipo de troféu', value: 'tipo' },
            { label: 'Raridade', value: 'raridade' },
            { label: 'Data conquistado', value: 'dataConquistado' },
        )


        extraOptions = [
            { label: 'Organizar por tags (Padrão)', value: 'tags' },
            { label: 'Separar troféus já conquistados', value: 'conquistados' },
            { label: 'Revelar o oculto', value: 'oculto' },
        ];

    }else{
        options = [
            { label: 'Ultimos jogados (Padrão)', value: 'recentes' },
            { label: 'Progresso', value: 'progresso' },
            { label: 'Dificuldade', value: 'dificuldade' },
            { label: 'Tempo para platinar', value: 'tempoParaPlatinar' },
        ];
    }
    useEffect(() => {
        if (visible) {
            setSwitchStates({
                tags: groupByTags,
                conquistados: groupByConquistado,
                oculto: awaysRevealed,
            });
        }
    }, [visible, groupByTags, groupByConquistado, awaysRevealed]);

    const aplicarFiltros = () => {
        onApplyFilters({
            sortBy,
            groupByTags,
            groupByConquistado,
            awaysRevealed,
        });
        onClose();
    };

    const renderItem = ({ item }: { item: { label: string; value: string } }) => {
        return (
            <TouchableOpacity style={styles.optionContainer} onPress={() => setSortBy(item.value)}>

                <Text style={styles.optionText}>{item.label}</Text>
                <View style={styles.circle}>
                    {sortBy === item.value && <View style={styles.selectedCircle} />}
                </View>

            </TouchableOpacity>
        );
    };

    const toggleSwitch = (key: string) => {
        console.log(key)
        setSwitchStates((prevState) => {
            const newState = !prevState[key];

            // Atualiza os filtros com base no switch que foi alterado
            if (key === 'tags') {
                setGroupByTags(newState);
            } else if (key === 'conquistados') {
                setGroupByConquistado(newState);
            } else if (key === 'oculto') {
                setAwaysRevealed(newState);
            }
            console.log(groupByTags)

            return {
                ...prevState,
                [key]: newState, // Alterna o valor do switch específico
            };
        });
    };



    const renderItem2 = ({ item }: { item: { label: string; value: string } }) => (
        <View style={styles.optionContainerSwitch}>
            <Text style={styles.optionText}>{item.label}</Text>
            <Switch
                trackColor={{ false: '#767577', true: '#767577' }}
                thumbColor={switchStates[item.value] ? '#57B3FF' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => toggleSwitch(item.value)}  // Passa o valor correto para a função toggleSwitch
                value={switchStates[item.value] || false} // Garante que o estado seja lido corretamente
            />
        </View>
    );

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
                    {tela === "trofeus" && extraOptions && (
                        <>
                            <View style={styles.divisor}></View>
                            <FlatList
                                data={extraOptions.filter(option => groupByTags || (option.value !== 'historia' && option.value !== 'online'))} // Filtro aplicado
                                renderItem={renderItem2}
                                keyExtractor={(item) => item.value}
                            />
                        </>
                    )}

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
        alignSelf: 'center',
    },
    modalContent: {
        paddingHorizontal: 50, // Adiciona o padding aqui
        paddingVertical: 20, // Adiciona o padding aqui
        width: '100%',
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Inter_400Regular',
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
    divisor: {
        width: "100%",
        height: 2,
        backgroundColor: "#D9D9D9",
        marginVertical: 20
    },
    optionContainerSwitch: {
        flexDirection: 'row',  // Mantém o texto à esquerda e o círculo à direita
        alignItems: 'center',
        justifyContent: 'space-between',  // Garante que o texto e o círculo fiquem nas extremidades
    },
    button: {
        width: "70%",
        backgroundColor: '#D9D9D9',
        padding: 10,
        borderRadius: 30,
        marginTop: 30,
        alignItems: 'center',
        alignSelf: 'center'
    },
    buttonText: {
        color: 'black',
        fontSize: 14,
    },
});

export default FilterModalComponent;
