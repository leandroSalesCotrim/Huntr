import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Dimensions, Animated, Image, TouchableOpacity, Modal, StyleProp, ViewStyle, Linking } from 'react-native';
import WavesBackgroundCustom from './components/WavesBackgroundCustom';
import { SplashScreen } from 'expo-router';
import { Link, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../NavigationTypes';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: "flex",
        justifyContent: "center",
        position: 'relative',
    },
    box: {
        backgroundColor: "white",
        width: "100%",
        height: "45%",
        borderRadius: 30,
        justifyContent: 'space-between',
        paddingBottom: 20,
    },
    divider: {
        width: "100%",
        height: 1.5,
        backgroundColor: "#57B3FF",
        alignSelf: "center",
        paddingHorizontal: 20,
    },
    stepContainer: {
        width: "100%",
        flex: 1,
        justifyContent: 'center', // Centraliza o conteúdo verticalmente
        paddingHorizontal: 20,
    },
    slide: {
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Inter_700Bold',
        marginTop: 50, // espaço adicional no topo
        textAlign: 'center',
    },
    titleBox2: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Inter_700Bold',
        textAlign: 'center',
    },
    titleBox3: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Inter_700Bold',
        textAlign: 'left',
        marginTop: 20
    },

    subtitle: {
        fontSize: 20,
        fontFamily: 'Inter_400Regular',
        textAlign: 'left',
        marginTop: 10
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 3, // Espaçamento entre os itens
        marginLeft: "3%",
    },
    bullet: {
        width: 5,
        height: 5,
        borderRadius: 5, // Faz um círculo
        backgroundColor: 'black', // Cor do marcador
        marginRight: 10, // Espaçamento entre o marcador e o texto
    },
    itemText: {
        fontSize: 16,
        textAlign: "left", // Alinhamento centralizado
        fontFamily: 'Inter_400Regular',
    },
    description: {
        fontSize: 16,
        marginVertical: 20,
        textAlign: "left", // Alinhamento centralizado
        fontFamily: 'Inter_400Regular',
        paddingLeft: 20,
        paddingRight: 20,
    },
    descriptionBox2: {
        fontSize: 16,
        marginVertical: 10,
        textAlign: "left", // Alinhamento centralizado
        fontFamily: 'Inter_400Regular',
    },
    highlightText: {
        fontFamily: "Inter_700Bold",
        fontSize: 16,
        textAlign: "center"
    },
    btnFechar: {
        backgroundColor: "#1C1F2A",
        borderRadius: 100,
        width: 32,
        height: 32,
        position: "absolute",
        right: 0,
        margin: 30
    },
    imgFechar: {
        width: "100%",
        height: "100%",
    },
    nextButton: {
        backgroundColor: '#08BFB5',
        width: "70%",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 30,
        marginTop: 20,
        alignSelf: 'center', // Centralizar horizontalmente o botão
        bottom: "5%"
    },
    nextButtonText: {
        color: '#1D1F2E',
        fontSize: 20,
        fontFamily: 'Inter_400Regular',
    },
    indicatorsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 10, // Mais próximo da parte inferior
    },
    indicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ccc',
        marginHorizontal: 5,
    },
    activeIndicator: {
        backgroundColor: '#1C1F2A',
    },
    viewGifs: {
        width: "100%",
        height: "40%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    boxGif: {
        width: "40%", // Ou ajuste conforme necessário
        height: "100%", // Ajuste a altura conforme necessário

    },
    borderGif: {
        width: "100%",
        height: "90%", // Ajuste a altura do GIF para dar espaço ao texto
        overflow: 'hidden', // Necessário para garantir que o border radius funcione
        borderRadius: 15,
    },
    gif: {
        width: "100%",
        height: "100%", // Ajuste a altura do GIF para dar espaço ao texto
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fundo desfocado
    },
    modalGif: {
        width: '80%',
        height: '80%',
    },
    link: {
        fontFamily: "Inter_700Bold",
        fontSize: 16,
        color: "blue",
    },
    boxLogo: {
        display: 'none',
        top: 100,
    },
    imgLogo: {
        width: 160,
        height: 160,
        alignSelf: "center",
        margin: "auto"
    }


});


// Componentes personalizados para cada etapa do guia
const steps = [
    {
        component: (
            <View style={styles.stepContainer}>
                <Text style={styles.titleBox2}>Sincronização da PSN</Text>
                <Text style={styles.description}>
                    Olá bom caçador, você provavelmente caiu neste guia com dúvidas sobre como conectar o aplicativo com a sua conta da PSN, mas primeiro, é <Text style={styles.highlightText}>necessário</Text> e  <Text style={styles.highlightText}>extremamente</Text> importante entender como a conexão funciona e o que será necessário.
                </Text>
            </View>
        ),
    },
    {
        component: (
            <View style={styles.stepContainer}>
                <Text style={styles.titleBox2}>Como obter o SSO Token?</Text>

                <View style={styles.divider} />

                <Text style={styles.subtitle}>Requisitos</Text>
                <View style={styles.itemContainer}>
                    <View style={styles.bullet} />
                    <Text style={styles.itemText}>Conta na playstation network (PSN)</Text>
                </View>

                <View style={styles.itemContainer}>
                    <View style={styles.bullet} />
                    <Text style={styles.itemText}>Navegador (Chrome ou Edge)</Text>
                </View>

                <View style={styles.divider} />

                <Text style={styles.subtitle}>Passo a passo</Text>
                <Text style={styles.descriptionBox2}><Text style={styles.highlightText}>1°</Text> Acesse <Text style={styles.link} onPress={() => Linking.openURL("https://my.account.sony.com/sonyacct/signin/?duid=0000000700090100e58347e76fe72caf4f1350a9f7db7dd8928f4f4e5c18367593f2669a8a5ea58a&response_type=code&client_id=e4a62faf-4b87-4fea-8565-caaabb3ac918&scope=web%3Acore&access_type=offline&state=280d6d1398f6e63ee73cbe33c14421fd543036b06ba0c0eca68d762c25fc4a42&service_entity=urn%3Aservice-entity%3Apsn&ui=pr&smcid=web%3Astore&redirect_uri=https%3A%2F%2Fweb.np.playstation.com%2Fapi%2Fsession%2Fv1%2Fsession%3Fredirect_uri%3Dhttps%253A%252F%252Fstore.playstation.com%252Fpt-br%252Fpages%252Flatest%253Fnonce%253D3dFLZLQwrePosiXi5Tda%26x-psn-app-ver%3D%2540sie-ppr-web-session%252Fsession%252Fv5.36.0&auth_ver=v3&error=login_required&error_code=4165&error_description=User+is+not+authenticated&no_captcha=true&cid=bec2dde9-1772-4c0e-a390-d12def36fd47#/signin/input/id")}>este link</Text> da playstation store e realize o login com a conta que você deseja inserir no App.</Text>
                <Text style={styles.descriptionBox2}><Text style={styles.highlightText}>2° Somente</Text> quando o login já estiver realizado, acesse <Text style={styles.link} onPress={() => Linking.openURL("https://ca.account.sony.com/api/v1/ssocookie")}>este link</Text> da PSN que contém o seu SSO token, ele deve se parecer com a imagem abaixo. E caso apareça algum erro,verifique se você está logado na PSN ou tente efetuar login numa guia anonima.</Text>
                <View style={styles.viewGifs}>
                    <View style={styles.boxGif}>
                        <View style={styles.borderGif}>
                            <Image
                                source={require('../../assets/images/exemplo1.gif')} // Substitua pelo caminho do seu primeiro GIF
                                style={styles.gif}
                                resizeMode="contain" // Para ajustar o GIF ao espaço disponível
                            />
                        </View>
                        <Text style={styles.highlightText}>Primeiro passo</Text>
                    </View>

                    <View style={styles.boxGif}>
                        <View style={styles.borderGif}>
                            <Image
                                source={require('../../assets/images/exemplo2.gif')} // Substitua pelo caminho do seu segundo GIF
                                style={styles.gif}
                                resizeMode="contain" // Para ajustar o GIF ao espaço disponível
                            />
                        </View>
                        <Text style={styles.highlightText}>segundo passo</Text>
                    </View>
                </View>

            </View>
        ),
    },
    {
        component: (
            <View style={styles.stepContainer}>
                <Text style={styles.titleBox2}>O que é o SSO Token?</Text>
                <View style={styles.divider} />
                <Text style={styles.descriptionBox2}>O <Text style={styles.highlightText}>SSO Token</Text>, de forma simplificada, é uma chave de acesso que permite que o aplicativo em suas mãos se comunique
                    com os servidores do PlayStation, trazendo, assim, os dados da sua conta. Desta forma, o HunTr consegue exibir as <Text style={styles.highlightText}>informações básicas</Text> dos jogos
                    em sua conta da PSN, independentemente da plataforma em que você joga.
                </Text>
                <Text style={styles.descriptionBox2}>
                    Ele funciona quase da mesma maneira que sua senha, e <Text style={styles.highlightText}>não há riscos</Text> de manter o token no app, pois ele não é armazenado em nossos servidores.
                    No entanto, tenha muito cuidado: é <Text style={styles.highlightText}>importante não compartilhar esse token com ninguém</Text>, afinal, ele é uma forma de acessar os dados da sua conta.
                </Text>
            </View>
        ),
    },
    {
        component: (
            <View style={styles.stepContainer}>
                <Text style={styles.titleBox2}>Porque o HunTr usa o SSO Token?</Text>
                <View style={styles.divider} />
                <Text style={styles.descriptionBox2}>O SSO Token atualmente é a <Text style={styles.highlightText}>unica maneira</Text> que possibilita que o aplicativo possa se comunicar com os servidores
                    do playstation e resgatar as informações necessárias para o funcionamento. A Sony oferce outras opções mais <Text style={styles.highlightText}>praticas e seguras</Text> para obter dados
                    da sua da PSN, mas <Text style={styles.highlightText}>somente</Text> se você fizer parte do programa de desenvolvedores aprovados pela mesma, podendo assim utilizar o login com a conta da
                    psn diretamente
                </Text>
                <Text style={styles.descriptionBox2}>
                    Como <Text style={styles.highlightText}>eu sou apenas um</Text> desenvolvedor, eu não tenho recursos e nem contatos que possam me ajudar a implementar esse tipo de login, então espero que entendam
                    o motivo de ser pouco prático a sincronização
                </Text>
            </View>
        ),
    },
    {
        component: (
            <View style={styles.stepContainer}>
                <Text style={styles.titleBox2}>Dúvidas comuns sobre o token</Text>
                <View style={styles.divider} />
                <Text style={styles.titleBox3}>Posso ser banido na PSN por usar o HunTr?</Text>
                <Text style={styles.descriptionBox2}><Text style={styles.highlightText}>R:</Text> Não! o token que você utiliza no app é o mesmo utilizado quando você faz login na ps store. Portanto, você esta não
                    burlando nenhuma regra da Playstation.</Text>
                <Text style={styles.titleBox3}>Estou recebendo um erro ao tentar obter o token, o que pode ser?</Text>
                <Text style={styles.descriptionBox2}><Text style={styles.highlightText}>R:</Text> Quando existir algum problema de login o navegador pode te exibir um erro, seja pela falta do login ou um problema com
                    seu navegador guardando dados em cache que interferem ao obter o token. Normalmente este problema é resolvido com as seguintes opções: <Text style={styles.highlightText}>limpar o cache do navegador</Text>, usar uma
                    <Text style={styles.highlightText}> guia anônima</Text> ou utilizar <Text style={styles.highlightText}>outro navegador</Text>.
                </Text>

            </View>
        ),
    },
];

type TokenScreenNavigationProp = StackNavigationProp<RootStackParamList, '(tabs)/index'>;

const GuiaTokenScreen: React.FC = () => {
    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_700Bold,
    });
    const [step, setStep] = useState(0);
    const [containerStyle, setContainerStyle] = useState<StyleProp<ViewStyle>>(styles.container);
    const [boxStyle, setBoxStyle] = useState<StyleProp<ViewStyle>>(styles.box);
    const [boxLogoStyle, setBoxLogoStyle] = useState<StyleProp<ViewStyle>>(styles.boxLogo);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedGif, setSelectedGif] = useState(null);
    const scrollX = new Animated.Value(0);
    const navigation = useNavigation<TokenScreenNavigationProp>();

    SplashScreen.preventAutoHideAsync();

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    const nextStep = () => {
        if (step < steps.length - 1) {
            setStep(prev => prev + 1);
            changeBoxStyle(); // Chama a função para alterar o estilo do box
        } else {
            // Volta para a tela anterior (tela do token)
            navigation.goBack();
        }
    };

    const changeBoxStyle = () => {
        if (step === 0) {
            setBoxStyle([{ ...styles.box, height: "100%", borderRadius: 0 }]); // Agora aceita a altura como 100%
        } else if (step === 1) {
            setContainerStyle([{
                flex: 1,
                display: "flex",
                position: 'relative',
            }]);
            setBoxStyle([{ ...styles.box, position: "absolute", bottom: 0, height: "60%", borderRadius: 0 }]); // Agora aceita a altura como 100%
            setBoxLogoStyle([{ ...styles.boxLogo, display: "flex" }]); // Agora aceita a altura como 100%

        } else if (step === 2) {
            setContainerStyle([{
                flex: 1,
                display: "flex",
                position: 'relative',
            }]);
            setBoxStyle([{ ...styles.box, position: "absolute", bottom: 0, height: "60%", borderRadius: 0 }]); // Agora aceita a altura como 100%
            setBoxLogoStyle([{ ...styles.boxLogo, display: "flex"}]); // Agora aceita a altura como 100%
        } else if (step === 3) {
            setContainerStyle([{
                flex: 1,
                display: "flex",
                position: 'relative',
            }]);
            setBoxStyle([{ ...styles.box, position: "absolute", bottom: 0, height: "70%", borderRadius: 0 }]); // Agora aceita a altura como 100%
            setBoxLogoStyle([{ ...styles.boxLogo, display: "flex",top: 50 }]); // Agora aceita a altura como 100%
        }
    };


    if (!fontsLoaded) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <Animated.View style={containerStyle}>
            <WavesBackgroundCustom />

            <Animated.View style={boxLogoStyle}>
                <Image source={require('../../assets/images/HunTr_logo.png')} style={styles.imgLogo} />
            </Animated.View>

            <Animated.View style={boxStyle}>
                <FlatList
                    data={steps}
                    horizontal
                    pagingEnabled
                    scrollEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={[styles.slide, { width }]}>
                            {item.component}
                            <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                                <Text style={styles.nextButtonText}>
                                    {step === 0 ? 'Iniciar guia' : step === steps.length - 1 ? 'Finalizar' : 'Próximo'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    contentOffset={{ x: step * width, y: 0 }}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                />
                <View style={styles.indicatorsContainer}>
                    {steps.map((_, index) => (
                        <View
                            key={index}
                            style={[styles.indicator, step === index && styles.activeIndicator]}
                        />
                    ))}
                </View>
            </Animated.View>

        </Animated.View>
    );
};

export default GuiaTokenScreen;