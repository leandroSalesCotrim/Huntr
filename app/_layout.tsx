import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)/index" options={{ title: 'Home', headerShown: false }} />
      <Stack.Screen name="(tabs)/login" options={{ title: 'Login', headerShown: false }} />
      <Stack.Screen name="(tabs)/cadastro" options={{ title: 'Cadastro', headerShown: false }} />
      <Stack.Screen name="(tabs)/dashboard" options={{ title: 'Dashboard', headerShown: false }} />
      <Stack.Screen name="(tabs)/sincronizar" options={{ title: 'Sincronizar', headerShown: false }} />
      <Stack.Screen name="(tabs)/teste" options={{ title: 'Teste', headerShown: false }} />
    </Stack>
  );
}
