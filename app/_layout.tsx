import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)/index" options={{ title: 'Home', headerShown: false }} />
      <Stack.Screen name="(tabs)/login" options={{ title: 'Login', headerShown: false }} />
      <Stack.Screen name="(tabs)/teste" options={{ title: 'Teste', headerShown: false }} />
    </Stack>
  );
}
