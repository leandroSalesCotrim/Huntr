import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

const symbols = [
    require('../../../assets/images/loadingAnimation/cross.png'),
    require('../../../assets/images/loadingAnimation/circle.png'),
    require('../../../assets/images/loadingAnimation/triangle.png'),
    require('../../../assets/images/loadingAnimation/square.png'),
];

const LoadingAnimation = () => {
    const [animations] = useState([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]);
    const [currentSymbols, setCurrentSymbols] = useState([0, 1, 2, 3]);

    useEffect(() => {
        const animateSymbol = (index: number) => {
            Animated.sequence([
                Animated.timing(animations[index], {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(animations[index], {
                    toValue: 0,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setCurrentSymbols((prev) => {
                    const newSymbols = [...prev];
                    newSymbols[index] = Math.floor(Math.random() * symbols.length);
                    return newSymbols;
                });
                animateSymbol(index);
            });
        };

        animations.forEach((_, index) => {
            setTimeout(() => animateSymbol(index), index * 200);
        });
    }, [animations]);

    return (
        <View style={styles.container}>
            {animations.map((anim, index) => (
                <Animated.Image
                    key={index}
                    source={symbols[currentSymbols[index]]}
                    style={[
                        styles.symbol,
                        {
                            transform: [
                                {
                                    scale: anim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 1],
                                    }),
                                },
                                {
                                    rotate: anim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['-90deg', '90deg'],
                                    }),
                                },
                            ],
                        },
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Permite quebrar para nova linha
        justifyContent: 'space-between',
        width: 250,
        height: 250,
        marginHorizontal: "auto",
        alignSelf: 'center',
        marginBottom:50
    },
    symbol: {
        width: 100,
        height: 100,
        marginBottom: 20, // Espaçamento entre linhas
    },
});

export default LoadingAnimation;
