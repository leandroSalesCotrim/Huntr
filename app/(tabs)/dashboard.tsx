// dashboard.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Perfil from './components/perfil'; // Sua tela de perfil
import Token from './components/token'; // Sua tela de token
import Playlists from './components/playlists'; // Sua tela de playlists

const Tab = createBottomTabNavigator();

export default function Dashboard() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Playlists" component={Playlists} />
      <Tab.Screen name="Token" component={Token} />
      <Tab.Screen name="Perfil" component={Perfil} />
    </Tab.Navigator>
  );
}
