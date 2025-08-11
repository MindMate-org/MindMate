/**
 * 글로벌 상태 관리 - 앱 전체에서 공유되는 상태
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';

export type AppThemeType = 'light' | 'dark' | 'system';
export type AppLanguageType = 'ko' | 'en';

/**
 * 글로벌 상태 타입 정의
 * @description 앱 전체에서 공유되는 상태와 액션들을 정의합니다.
 */
export interface GlobalStateType {
  // UI 상태
  theme: AppThemeType;
  language: AppLanguageType;
  isOnboarding: boolean;

  // 앱 상태
  isLoading: boolean;
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    timestamp: number;
  }>;

  // 액션
  setTheme: (theme: AppThemeType) => void;
  setLanguage: (language: AppLanguageType) => void;
  setOnboarding: (isOnboarding: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;
  addNotification: (
    notification: Omit<GlobalStateType['notifications'][0], 'id' | 'timestamp'>,
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

/**
 * 글로벌 상태 스토어
 * @description 앱 전체에서 사용하는 글로벌 상태를 관리합니다.
 * - 테마, 언어, 온보딩 상태
 * - 로딩 상태 관리
 * - 전역 알림 시스템
 */
export const useGlobalStore = create<GlobalStateType>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // 초기 상태
        theme: 'system',
        language: 'ko',
        isOnboarding: true,
        isLoading: false,
        notifications: [],

        // 액션
        setTheme: (theme) => set({ theme }),
        setLanguage: (language) => set({ language }),
        setOnboarding: (isOnboarding) => set({ isOnboarding }),
        setGlobalLoading: (isLoading) => set({ isLoading }),

        addNotification: (notification) =>
          set((state) => ({
            notifications: [
              ...state.notifications,
              {
                ...notification,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                timestamp: Date.now(),
              },
            ],
          })),

        removeNotification: (id) =>
          set((state) => ({
            notifications: state.notifications.filter((notification) => notification.id !== id),
          })),

        clearNotifications: () => set({ notifications: [] }),
      }),
      {
        name: 'global-store',
        storage: createJSONStorage(() => AsyncStorage),
        // 민감한 정보는 persit하지 않기 위해 선택적으로 저장
        partialize: (state) => ({
          theme: state.theme,
          language: state.language,
          isOnboarding: state.isOnboarding,
        }),
      },
    ),
  ),
);

// Selector 훅들
export const useTheme = () => useGlobalStore((state) => state.theme);
export const useLanguage = () => useGlobalStore((state) => state.language);
export const useIsOnboarding = () => useGlobalStore((state) => state.isOnboarding);
export const useGlobalLoading = () => useGlobalStore((state) => state.isLoading);
export const useNotifications = () => useGlobalStore((state) => state.notifications);

// 액션 훅
export const useGlobalActions = () =>
  useGlobalStore((state) => ({
    setTheme: state.setTheme,
    setLanguage: state.setLanguage,
    setOnboarding: state.setOnboarding,
    setGlobalLoading: state.setGlobalLoading,
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
    clearNotifications: state.clearNotifications,
  }));
