/**
 * 앱 상태 관리를 위한 통합 스토어
 * - 기존 global-store와 통합
 * - Feature별 스토어 관리
 * - 크로스 피처 상태 동기화
 * - 성능 최적화된 상태 선택
 */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// 통합된 앱 상태 타입 정의 (기존 global-store + 새로운 기능들)
// ============================================================================

export type AppThemeType = 'light' | 'dark' | 'system';
export type AppLanguageType = 'ko' | 'en';

export interface AppMetadata {
  version: string;
  buildNumber: string;
  lastSyncTime?: string;
  deviceId: string;
  installationId: string;
}

export interface AppPerformance {
  screenLoadTimes: Record<string, number>;
  errorCount: number;
  crashCount: number;
  memoryWarnings: number;
  lastPerformanceCheck: string;
}

export interface AppFeatureFlags {
  enablePushNotifications: boolean;
  enableOfflineMode: boolean;
  enableBiometricAuth: boolean;
  enableDataExport: boolean;
  enableAdvancedSearch: boolean;
  enableAIFeatures: boolean;
  betaFeatures: string[];
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: number;
}

export interface AppState {
  // 메타데이터
  metadata: AppMetadata;
  
  // 성능 추적
  performance: AppPerformance;
  
  // 피처 플래그
  featureFlags: AppFeatureFlags;
  
  // UI 상태 (기존 global-store에서 이관)
  theme: AppThemeType;
  language: AppLanguageType;
  isOnboarding: boolean;
  
  // 사용자 정보
  userName: string;
  
  // 앱 상태
  isRehydrated: boolean;
  isOnline: boolean;
  isBackground: boolean;
  currentScreen: string | null;
  modalStack: string[];
  isLoading: boolean;
  notifications: AppNotification[];
  
  // 사용자 활동
  sessionStartTime: string | null;
  lastActivityTime: string | null;
  
  // 기본 앱 액션들
  setRehydrated: (isRehydrated: boolean) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  setBackgroundStatus: (isBackground: boolean) => void;
  setCurrentScreen: (screen: string) => void;
  pushModal: (modalId: string) => void;
  popModal: () => void;
  clearModalStack: () => void;
  startSession: () => void;
  updateActivity: () => void;
  endSession: () => void;
  
  // UI 상태 액션들 (기존 global-store에서 이관)
  setTheme: (theme: AppThemeType) => void;
  setLanguage: (language: AppLanguageType) => void;
  setOnboarding: (isOnboarding: boolean) => void;
  setUserName: (userName: string) => void;
  setGlobalLoading: (loading: boolean) => void;
  
  // 알림 관리 액션들
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // 피처 플래그 액션들
  updateFeatureFlag: (flag: keyof AppFeatureFlags, value: any) => void;
  getFeatureFlag: (flag: keyof AppFeatureFlags) => any;
  isFeatureEnabled: (flag: keyof AppFeatureFlags) => boolean;
  
  // 성능 추적 액션들
  recordScreenLoadTime: (screen: string, loadTime: number) => void;
  recordError: () => void;
  recordCrash: () => void;
  recordMemoryWarning: () => void;
}

// ============================================================================
// 스토어 생성
// ============================================================================

export const useAppStore = create<AppState>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          // 메타데이터 초기 상태
          metadata: {
            version: '1.0.0',
            buildNumber: '1',
            deviceId: '',
            installationId: '',
          },
          
          // 성능 추적 초기 상태
          performance: {
            screenLoadTimes: {},
            errorCount: 0,
            crashCount: 0,
            memoryWarnings: 0,
            lastPerformanceCheck: new Date().toISOString(),
          },
          
          // 피처 플래그 초기 상태
          featureFlags: {
            enablePushNotifications: true,
            enableOfflineMode: false,
            enableBiometricAuth: false,
            enableDataExport: true,
            enableAdvancedSearch: false,
            enableAIFeatures: false,
            betaFeatures: [],
          },
          
          // UI 상태 초기값 (기존 global-store에서 이관)
          theme: 'system' as AppThemeType,
          language: 'ko' as AppLanguageType,
          isOnboarding: true,
          userName: '',
          
          // 앱 상태 초기값
          isRehydrated: false,
          isOnline: true,
          isBackground: false,
          currentScreen: null,
          modalStack: [],
          isLoading: false,
          notifications: [],
          sessionStartTime: null,
          lastActivityTime: null,

          // 기본 앱 액션 구현
          setRehydrated: (isRehydrated) => set({ isRehydrated }),
          
          setOnlineStatus: (isOnline) => set({ isOnline }),
          
          setBackgroundStatus: (isBackground) => set({ isBackground }),
          
          setCurrentScreen: (screen) => {
            set({ currentScreen: screen });
            // 화면 전환 시 활동 시간 업데이트
            get().updateActivity();
          },
          
          pushModal: (modalId) =>
            set((state) => ({
              modalStack: [...state.modalStack, modalId],
            })),
          
          popModal: () =>
            set((state) => ({
              modalStack: state.modalStack.slice(0, -1),
            })),
          
          clearModalStack: () => set({ modalStack: [] }),
          
          startSession: () =>
            set({
              sessionStartTime: new Date().toISOString(),
              lastActivityTime: new Date().toISOString(),
            }),
          
          updateActivity: () =>
            set({ lastActivityTime: new Date().toISOString() }),
          
          endSession: () =>
            set({
              sessionStartTime: null,
              lastActivityTime: null,
            }),
          
          // UI 상태 액션 구현 (기존 global-store에서 이관)
          setTheme: (theme) => set({ theme }),
          setLanguage: (language) => set({ language }),
          setOnboarding: (isOnboarding) => set({ isOnboarding }),
          setUserName: (userName) => set({ userName }),
          setGlobalLoading: (isLoading) => set({ isLoading }),
          
          // 알림 관리 액션 구현
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
          
          // 피처 플래그 액션 구현
          updateFeatureFlag: (flag, value) =>
            set((state) => ({
              featureFlags: {
                ...state.featureFlags,
                [flag]: value,
              },
            })),
          
          getFeatureFlag: (flag) => get().featureFlags[flag],
          
          isFeatureEnabled: (flag) => Boolean(get().featureFlags[flag]),
          
          // 성능 추적 액션 구현
          recordScreenLoadTime: (screen, loadTime) =>
            set((state) => ({
              performance: {
                ...state.performance,
                screenLoadTimes: {
                  ...state.performance.screenLoadTimes,
                  [screen]: loadTime,
                },
              },
            })),
          
          recordError: () =>
            set((state) => ({
              performance: {
                ...state.performance,
                errorCount: state.performance.errorCount + 1,
              },
            })),
          
          recordCrash: () =>
            set((state) => ({
              performance: {
                ...state.performance,
                crashCount: state.performance.crashCount + 1,
              },
            })),
          
          recordMemoryWarning: () =>
            set((state) => ({
              performance: {
                ...state.performance,
                memoryWarnings: state.performance.memoryWarnings + 1,
              },
            })),
        }),
        {
          name: 'app-store',
          storage: createJSONStorage(() => AsyncStorage),
          // 민감한 정보는 persist하지 않기 위해 선택적으로 저장
          partialize: (state) => ({
            theme: state.theme,
            language: state.language,
            isOnboarding: state.isOnboarding,
            userName: state.userName,
            featureFlags: state.featureFlags,
            metadata: {
              version: state.metadata.version,
              buildNumber: state.metadata.buildNumber,
            },
          }),
        }
      )
    ),
    { name: 'app-store' }
  )
);

// ============================================================================
// 성능 최적화된 선택적 훅들
// ============================================================================

// 메타데이터 관련
export const useAppMetadata = () => useAppStore((state) => state.metadata);
export const useAppVersion = () => useAppStore((state) => state.metadata.version);

// 성능 관련
export const useAppPerformance = () => useAppStore((state) => state.performance);
export const useRecordScreenLoadTime = () => useAppStore((state) => state.recordScreenLoadTime);

// 피처 플래그 관련
export const useFeatureFlags = () => useAppStore((state) => state.featureFlags);
export const useFeatureFlag = (flag: keyof AppFeatureFlags) => 
  useAppStore((state) => state.featureFlags[flag]);
export const useIsFeatureEnabled = () => useAppStore((state) => state.isFeatureEnabled);

// UI 상태 관련 (기존 global-store에서 이관)
export const useTheme = () => useAppStore((state) => state.theme);
export const useLanguage = () => useAppStore((state) => state.language);
export const useIsOnboarding = () => useAppStore((state) => state.isOnboarding);
export const useUserName = () => useAppStore((state) => state.userName);
export const useGlobalLoading = () => useAppStore((state) => state.isLoading);
export const useNotifications = () => useAppStore((state) => state.notifications);

// 앱 상태 관련
export const useIsRehydrated = () => useAppStore((state) => state.isRehydrated);
export const useIsOnline = () => useAppStore((state) => state.isOnline);
export const useIsBackground = () => useAppStore((state) => state.isBackground);
export const useCurrentScreen = () => useAppStore((state) => state.currentScreen);
export const useModalStack = () => useAppStore((state) => state.modalStack);

// 세션 관련
export const useSessionInfo = () => useAppStore((state) => ({
  sessionStartTime: state.sessionStartTime,
  lastActivityTime: state.lastActivityTime,
}));

// 개별 액션 훅들 (성능 최적화)
export const useSetTheme = () => useAppStore((state) => state.setTheme);
export const useSetLanguage = () => useAppStore((state) => state.setLanguage);
export const useSetOnboarding = () => useAppStore((state) => state.setOnboarding);
export const useSetUserName = () => useAppStore((state) => state.setUserName);
export const useSetGlobalLoading = () => useAppStore((state) => state.setGlobalLoading);
export const useAddNotification = () => useAppStore((state) => state.addNotification);
export const useRemoveNotification = () => useAppStore((state) => state.removeNotification);
export const useClearNotifications = () => useAppStore((state) => state.clearNotifications);

// 앱 액션 훅들 (개별 훅으로 변경하여 성능 최적화)
export const useSetRehydrated = () => useAppStore((state) => state.setRehydrated);
export const useSetOnlineStatus = () => useAppStore((state) => state.setOnlineStatus);
export const useSetBackgroundStatus = () => useAppStore((state) => state.setBackgroundStatus);
export const useSetCurrentScreen = () => useAppStore((state) => state.setCurrentScreen);
export const usePushModal = () => useAppStore((state) => state.pushModal);
export const usePopModal = () => useAppStore((state) => state.popModal);
export const useClearModalStack = () => useAppStore((state) => state.clearModalStack);
export const useStartSession = () => useAppStore((state) => state.startSession);
export const useUpdateActivity = () => useAppStore((state) => state.updateActivity);
export const useEndSession = () => useAppStore((state) => state.endSession);
export const useUpdateFeatureFlag = () => useAppStore((state) => state.updateFeatureFlag);
export const useRecordError = () => useAppStore((state) => state.recordError);
export const useRecordCrash = () => useAppStore((state) => state.recordCrash);

// 액션 그룹 선택자 (캐시된 선택자 사용)
const appActionsSelector = (state: AppState) => ({
  setRehydrated: state.setRehydrated,
  setOnlineStatus: state.setOnlineStatus,
  setBackgroundStatus: state.setBackgroundStatus,
  setCurrentScreen: state.setCurrentScreen,
  pushModal: state.pushModal,
  popModal: state.popModal,
  clearModalStack: state.clearModalStack,
  startSession: state.startSession,
  updateActivity: state.updateActivity,
  endSession: state.endSession,
  updateFeatureFlag: state.updateFeatureFlag,
  recordError: state.recordError,
  recordCrash: state.recordCrash,
});

const globalActionsSelector = (state: AppState) => ({
  setTheme: state.setTheme,
  setLanguage: state.setLanguage,
  setOnboarding: state.setOnboarding,
  setUserName: state.setUserName,
  setGlobalLoading: state.setGlobalLoading,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
});

// 통합 액션 훅들 (선택적으로 사용, 개별 훅 사용 권장)
export const useAppActions = () => useAppStore(appActionsSelector);
export const useGlobalActions = () => useAppStore(globalActionsSelector);

// ============================================================================
// 유틸리티 함수들
// ============================================================================

/**
 * 앱 초기화
 */
export const initializeApp = async () => {
  const { setRehydrated, startSession, updateFeatureFlag } = useAppStore.getState();
  
  try {
    // 디바이스 정보 설정
    const deviceId = await AsyncStorage.getItem('deviceId') || 
      Math.random().toString(36).substr(2, 9);
    await AsyncStorage.setItem('deviceId', deviceId);
    
    const installationId = await AsyncStorage.getItem('installationId') || 
      Date.now().toString() + Math.random().toString(36).substr(2, 9);
    await AsyncStorage.setItem('installationId', installationId);
    
    // 메타데이터 업데이트
    useAppStore.setState((state) => ({
      metadata: {
        ...state.metadata,
        deviceId,
        installationId,
      },
    }));
    
    // 세션 시작
    startSession();
    
    // 피처 플래그 초기화 (서버에서 가져올 수도 있음)
    await loadFeatureFlags();
    
    // 리하이드레이션 완료
    setRehydrated(true);
    
    } catch (error) {
    setRehydrated(true); // 실패해도 앱은 실행되어야 함
  }
};

/**
 * 피처 플래그 로드
 */
const loadFeatureFlags = async () => {
  try {
    // 실제 구현에서는 서버에서 피처 플래그를 가져올 수 있음
    const savedFlags = await AsyncStorage.getItem('featureFlags');
    if (savedFlags) {
      const flags = JSON.parse(savedFlags);
      useAppStore.setState((state) => ({
        featureFlags: {
          ...state.featureFlags,
          ...flags,
        },
      }));
    }
  } catch (error) {
    }
};

/**
 * 피처 플래그 저장
 */
export const saveFeatureFlags = async (flags: Partial<AppFeatureFlags>) => {
  try {
    const currentFlags = useAppStore.getState().featureFlags;
    const updatedFlags = { ...currentFlags, ...flags };
    
    await AsyncStorage.setItem('featureFlags', JSON.stringify(updatedFlags));
    
    useAppStore.setState({ featureFlags: updatedFlags });
  } catch (error) {
    }
};

/**
 * 성능 메트릭 리포트
 */
export const getPerformanceReport = () => {
  const { performance, metadata } = useAppStore.getState();
  
  const averageLoadTime = Object.values(performance.screenLoadTimes).length > 0 
    ? Object.values(performance.screenLoadTimes).reduce((a, b) => a + b, 0) / 
      Object.values(performance.screenLoadTimes).length 
    : 0;
  
  return {
    ...performance,
    averageScreenLoadTime: averageLoadTime,
    appVersion: metadata.version,
    reportTime: new Date().toISOString(),
  };
};

/**
 * 스토어 디버그 정보
 */
export const getStoreDebugInfo = () => {
  if (!__DEV__) return null;
  
  const state = useAppStore.getState();
  
  return {
    storeSize: JSON.stringify(state).length,
    modalStackDepth: state.modalStack.length,
    sessionDuration: state.sessionStartTime 
      ? Date.now() - new Date(state.sessionStartTime).getTime() 
      : 0,
    performanceMetrics: getPerformanceReport(),
  };
};