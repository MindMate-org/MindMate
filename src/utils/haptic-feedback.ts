import * as Haptics from 'expo-haptics';

/**
 * 햅틱 피드백 유틸리티
 * 앱 전체에서 일관된 촉각 피드백을 제공합니다.
 */
export const HapticFeedback = {
  /**
   * 가벼운 터치 피드백 (버튼 탭 등)
   */
  light: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /**
   * 중간 강도 피드백 (확인, 선택 등)
   */
  medium: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  /**
   * 강한 피드백 (중요한 액션, 삭제 등)
   */
  heavy: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  /**
   * 성공 피드백
   */
  success: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  /**
   * 경고 피드백
   */
  warning: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  /**
   * 오류 피드백
   */
  error: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  /**
   * 선택 변경 피드백 (스위치, 슬라이더 등)
   */
  selection: () => {
    Haptics.selectionAsync();
  },
};
