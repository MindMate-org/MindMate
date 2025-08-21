import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

import { useThemeColors } from '../providers/theme-provider';

export type LoadingStateVariant = 'fullscreen' | 'inline' | 'overlay' | 'compact';
export type LoadingStateSize = 'small' | 'large';

interface LoadingStateProps {
  /** 로딩 메시지 */
  message?: string;
  /** 컴포넌트 변형 */
  variant?: LoadingStateVariant;
  /** 로딩 인디케이터 크기 */
  size?: LoadingStateSize;
  /** 배경 색상 */
  backgroundColor?: string;
  /** 스피너 색상 */
  spinnerColor?: string;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 통합 로딩 상태 컴포넌트
 * 앱 전체에서 사용되는 로딩 상태를 일관된 스타일로 제공합니다.
 */
const LoadingState: React.FC<LoadingStateProps> = ({
  message = '불러오는 중...',
  variant = 'inline',
  size = 'large',
  backgroundColor,
  spinnerColor,
  className = '',
}) => {
  const { theme: themeColors } = useThemeColors();

  const getContainerStyles = () => {
    switch (variant) {
      case 'fullscreen':
        return {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: backgroundColor || themeColors.background,
        };
      case 'overlay':
        return {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: backgroundColor || 'rgba(0, 0, 0, 0.3)',
          zIndex: 50,
        };
      case 'compact':
        return {
          alignItems: 'center',
          justifyContent: 'center',
          padding: 8,
        };
      case 'inline':
      default:
        return {
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        };
    }
  };

  const getMessageStyles = () => {
    switch (variant) {
      case 'fullscreen':
        return {
          marginTop: 16,
          fontSize: 16,
          color: themeColors.textSecondary,
        };
      case 'overlay':
        return {
          marginTop: 16,
          fontSize: 16,
          fontWeight: '500' as const,
          color: '#FFFFFF',
        };
      case 'compact':
        return {
          marginTop: 8,
          fontSize: 12,
          color: themeColors.textSecondary,
        };
      case 'inline':
      default:
        return {
          marginTop: 12,
          fontSize: 14,
          color: themeColors.textSecondary,
        };
    }
  };

  const showMessage = message && variant !== 'compact';
  const actualSpinnerColor = spinnerColor || themeColors.primary;

  return (
    <View style={getContainerStyles() as any}>
      <ActivityIndicator size={size} color={actualSpinnerColor} />
      {showMessage && <Text style={getMessageStyles()}>{message}</Text>}
    </View>
  );
};

export default LoadingState;
