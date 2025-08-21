import { useEffect } from 'react';
import '../global.css';
import { SplashScreen, Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import Toast from 'react-native-toast-message';
import { StatusBar } from 'expo-status-bar';

import { ErrorBoundary } from '../src/components/common/error-boundary';
import AlertProvider from '../src/components/providers/alert-provider';
import { ThemeProvider } from '../src/components/providers/theme-provider';
import { ANIMATION_CONFIG } from '../src/constants/animations';
import { useInitializeDatabase } from '../src/hooks/use-initialize-database';
import { notificationService } from '../src/lib/notification-service';
import { initializeApp, useRecordError, useRecordCrash } from '../src/store/app-store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    pretendard: require('../assets/fonts/pretendard.ttf'),
  });

  const recordError = useRecordError();
  const recordCrash = useRecordCrash();

  useInitializeDatabase();

  // 앱 초기화
  useEffect(() => {
    const initializeAppServices = async () => {
      try {
        // 통합 앱 스토어 초기화
        await initializeApp();

        // 알림 서비스 초기화
        const success = await notificationService.initialize();
        if (success) {
          console.log('✅ 알림 서비스 초기화 완료');
        } else {
          console.warn('⚠️ 알림 서비스 초기화 실패 (권한 없음)');
        }
      } catch (error) {
        console.error('❌ 앱 서비스 초기화 오류:', error);
        recordError();
      }
    };

    initializeAppServices();
  }, [recordError]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // 전역 에러 핸들러 설정
  useEffect(() => {
    if (typeof global !== 'undefined' && global.ErrorUtils) {
      const originalErrorHandler = global.ErrorUtils.getGlobalHandler();

      global.ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
        console.error('Global Error Handler:', error);

        if (isFatal) {
          recordCrash();
        } else {
          recordError();
        }

        // 원래 핸들러 호출
        originalErrorHandler?.(error, isFatal);
      });

      return () => {
        global.ErrorUtils.setGlobalHandler(originalErrorHandler);
      };
    }
  }, [recordError, recordCrash]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <StatusBar style="auto" translucent={true} />
        <AlertProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              ...ANIMATION_CONFIG.pageTransition,
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <Toast />
        </AlertProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
