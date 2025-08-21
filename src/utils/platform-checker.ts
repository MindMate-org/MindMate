import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * 플랫폼 및 실행 환경 체크 유틸리티
 */
export const PlatformChecker = {
  /**
   * 현재 Expo Go에서 실행 중인지 확인
   */
  isExpoGo: (): boolean => {
    return Constants.appOwnership === 'expo';
  },

  /**
   * Development Build에서 실행 중인지 확인
   */
  isDevelopmentBuild: (): boolean => {
    return Constants.appOwnership === null || Constants.appOwnership === 'expo';
  },

  /**
   * 프로덕션 빌드에서 실행 중인지 확인
   */
  isProductionBuild: (): boolean => {
    return Constants.appOwnership === null;
  },

  /**
   * 안드로이드 플랫폼인지 확인
   */
  isAndroid: (): boolean => {
    return Platform.OS === 'android';
  },

  /**
   * iOS 플랫폼인지 확인
   */
  isIOS: (): boolean => {
    return Platform.OS === 'ios';
  },

  /**
   * 푸시 알림이 지원되는 환경인지 확인
   * (Expo Go에서는 Android 푸시 알림이 SDK 53부터 지원되지 않음)
   */
  isPushNotificationSupported: (): boolean => {
    // Expo Go에서 Android인 경우 푸시 알림 미지원
    if (PlatformChecker.isExpoGo() && PlatformChecker.isAndroid()) {
      return false;
    }
    return true;
  },

  /**
   * 로컬 알림이 지원되는 환경인지 확인
   */
  isLocalNotificationSupported: (): boolean => {
    // 로컬 알림은 모든 환경에서 지원됨
    return true;
  },
};
