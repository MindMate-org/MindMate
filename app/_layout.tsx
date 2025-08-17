import { useEffect } from 'react';
import '../global.css';
import { SplashScreen, Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import Toast from 'react-native-toast-message';

import AlertProvider from '../src/components/providers/alert-provider';
import { ThemeProvider } from '../src/components/providers/theme-provider';
import { useInitializeDatabase } from '../src/hooks/use-initialize-database';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    pretendard: require('../assets/fonts/pretendard.ttf'),
  });

  useInitializeDatabase();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;
  return (
    <ThemeProvider>
      <AlertProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <Toast />
      </AlertProvider>
    </ThemeProvider>
  );
}
