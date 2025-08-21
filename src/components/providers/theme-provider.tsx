/**
 * 테마 프로바이더 컴포넌트
 *
 * 앱 전체에 다크모드/라이트모드 테마를 적용합니다.
 */

import React, { useEffect, useMemo } from 'react';
import { StatusBar, useColorScheme, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useTheme } from '../../store/app-store';

export interface ThemeColors {
  // 배경색
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;

  // 텍스트 색상
  text: string;
  textSecondary: string;
  textMuted: string;

  // 브랜드 색상
  primary: string;
  primaryText: string;
  accent: string;

  // 상태 색상
  success: string;
  warning: string;
  error: string;
  info: string;

  // 경계선
  border: string;
  borderLight: string;

  // 그림자
  shadow: string;
}

const lightTheme: ThemeColors = {
  background: '#F0F3FF',
  backgroundSecondary: '#F0F3FF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',

  text: '#1F2937',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',

  primary: '#576BCD',
  primaryText: '#FFFFFF',
  accent: '#FEF3C7',

  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  shadow: '#000000',
};

const darkTheme: ThemeColors = {
  background: '#0F172A',
  backgroundSecondary: '#1E293B',
  surface: '#1E293B',
  surfaceSecondary: '#334155',

  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',

  primary: '#6366F1',
  primaryText: '#FFFFFF',
  accent: '#374151',

  success: '#22C55E',
  warning: '#EAB308',
  error: '#EF4444',
  info: '#3B82F6',

  border: '#334155',
  borderLight: '#475569',

  shadow: '#000000',
};

interface ThemeContextType {
  theme: ThemeColors;
  isDark: boolean;
}

const ThemeContext = React.createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
});

export const useThemeColors = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeColors must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themePreference = useTheme();
  const systemColorScheme = useColorScheme();

  const isDark = useMemo(() => {
    if (themePreference === 'system') {
      return systemColorScheme === 'dark';
    }
    return themePreference === 'dark';
  }, [themePreference, systemColorScheme]);

  const theme = useMemo(() => {
    return isDark ? darkTheme : lightTheme;
  }, [isDark]);

  useEffect(() => {
    // StatusBar 스타일 설정
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(theme.background, true);
    }
  }, [isDark, theme.background]);

  const contextValue = useMemo(
    () => ({
      theme,
      isDark,
    }),
    [theme, isDark],
  );

  return (
    <SafeAreaProvider>
      <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
    </SafeAreaProvider>
  );
};
