import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import Perfil from './components/perfil';
import Token from './components/token';
import Playlists from './components/playlists';
import { BlurView } from 'expo-blur';

const Tab = createBottomTabNavigator();

function CustomTabBar({ state, descriptors, navigation }: any) {
  const orderedRoutes = [
    state.routes[(state.index + 1) % 3],
    state.routes[state.index],
    state.routes[(state.index + 2) % 3],
  ];

  return (
    <View style={styles.tabBarContainer}>
      <Svg width="100%" height="107" viewBox="0 0 428 107" style={styles.svgContainer}>
        <Defs>
          <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#26283B" />
            <Stop offset="25%" stopColor="#26283B" />
            <Stop offset="60%" stopColor="#07080B" />
            <Stop offset="100%" stopColor="black" />
          </LinearGradient>
        </Defs>
        <Path
          d="M465 93.5C465 106.017 458.167 118.064 445.537 129.143C432.91 140.22 414.58 150.241 391.843 158.677C346.378 175.546 283.501 186 214 186C144.499 186 81.6225 175.546 36.157 158.677C13.4204 150.241 -4.90957 140.22 -17.5371 129.143C-30.1666 118.064 -37 106.017 -37 93.5C-37 80.9833 -30.1666 68.9361 -17.5371 57.8573C-4.90957 46.7802 13.4204 36.7591 36.157 28.3231C81.6225 11.4539 144.499 1 214 1C283.501 1 346.378 11.4539 391.843 28.3231C414.58 36.7591 432.91 46.7802 445.537 57.8573C458.167 68.9361 465 80.9833 465 93.5Z"
          fill="url(#gradient)"
          stroke="#3A3E59"
          strokeWidth="3"
        />
      </Svg>

      <View style={styles.iconContainer}>
        {orderedRoutes.map((route, orderedIndex) => {
          const originalIndex = state.routes.findIndex(
            (r: { key: any; }) => r.key === route.key
          );
          const isFocused = state.index === originalIndex;
          const iconName =
            route.name === 'Playlists'
              ? 'game-controller-outline'
              : route.name === 'Token'
                ? 'key-outline'
                : 'person-outline';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <View key={route.name} style={orderedIndex === 1 ? styles.iconCenterContainer : styles.iconWrapper}>
              {isFocused && ( // Verifica se o ícone está focado
                  <Svg viewBox="0 0 428 150" style={styles.svgFundoIcone}>
                    <Defs>
                      <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor="#08BFB5" stopOpacity="0" />
                        <Stop offset="60%" stopColor="#08BFB599" />
                      </LinearGradient>
                    </Defs>

                    {/* Aqui desenhamos um quadrado */}
                    <Rect
                      x="0"
                      y="0"
                      width="100%" // Largura do quadrado
                      height="100%" // Altura do quadrado
                      fill="url(#gradient)" // Aplica o degradê
                    />
                  </Svg>
              )}

              <Ionicons
                name={iconName}
                size={35}
                color={'#ffffff'}
                onPress={onPress}
              />
            </View>
          );
        })}
      </View>

      <View style={styles.labelContainer}>
        <Svg width="100%" height="107" viewBox="0 0 428 107" style={styles.svgContainer}>
          <Defs>
            <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#26283B" />
              <Stop offset="5%" stopColor="#26283B" />
              <Stop offset="50%" stopColor="#07080B" />
              <Stop offset="100%" stopColor="black" />
            </LinearGradient>
          </Defs>
          <Path
            d="M465 93.5C465 106.017 458.167 118.064 445.537 129.143C432.91 140.22 414.58 150.241 391.843 158.677C346.378 175.546 283.501 186 214 186C144.499 186 81.6225 175.546 36.157 158.677C13.4204 150.241 -4.90957 140.22 -17.5371 129.143C-30.1666 118.064 -37 106.017 -37 93.5C-37 80.9833 -30.1666 68.9361 -17.5371 57.8573C-4.90957 46.7802 13.4204 36.7591 36.157 28.3231C81.6225 11.4539 144.499 1 214 1C283.501 1 346.378 11.4539 391.843 28.3231C414.58 36.7591 432.91 46.7802 445.537 57.8573C458.167 68.9361 465 80.9833 465 93.5Z"
            fill="url(#gradient)"
            stroke="#2C2F44"
            strokeWidth="2"
          />
        </Svg>
        <Text style={styles.labelText}>{state.routes[state.index].name}</Text>
      </View>
    </View>
  );
}

export default function Dashboard() {
  return (
    <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>

      <Tab.Screen
        name="Token"
        component={Token}
        options={{ title: 'Token', headerShown: false }}
      />
      <Tab.Screen
        name="Playlists"
        component={Playlists}
        options={{ title: 'Playlists', headerShown: false }}
      />
      <Tab.Screen
        name="Perfil"
        component={Perfil}
        options={{ title: 'Perfil', headerShown: false }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 120,
    alignItems: 'center',
  },
  svgContainer: {
    position: 'absolute',
    bottom: 0,
  },

  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    position: 'absolute',
    bottom: 50,
  },
  iconWrapper: {
    marginLeft: 70,
    marginRight: 70,
    top: 10,
  },
  iconCenterContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    position: 'absolute',
    width: '100%',
    top: 180,
  },
  labelText: {
    position: 'absolute',
    fontSize: 16,
    color: '#E3E3E5',
    bottom: 70,
    alignSelf: 'center',
  },
  svgFundoIcone: {
    position: 'absolute',
    top: 10,
    padding: 15,
    width: "130%",
    alignSelf: "center",
  },
});
