import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

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
  spinnerColor = '#576BCD',
  className = '',
}) => {
  const getContainerStyles = () => {
    const baseStyles = 'items-center justify-center';

    switch (variant) {
      case 'fullscreen':
        return `${baseStyles} flex-1 bg-white`;
      case 'overlay':
        return `${baseStyles} absolute inset-0 bg-black/30 z-50`;
      case 'compact':
        return `${baseStyles} p-2`;
      case 'inline':
      default:
        return `${baseStyles} p-4`;
    }
  };

  const getMessageStyles = () => {
    switch (variant) {
      case 'fullscreen':
        return 'mt-4 text-base text-gray-600';
      case 'overlay':
        return 'mt-4 text-base text-white font-medium';
      case 'compact':
        return 'mt-2 text-xs text-gray-500';
      case 'inline':
      default:
        return 'mt-3 text-sm text-gray-600';
    }
  };

  const containerBgColor = backgroundColor ? { backgroundColor } : {};

  const showMessage = message && variant !== 'compact';

  return (
    <View className={`${getContainerStyles()} ${className}`} style={containerBgColor}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {showMessage && <Text className={getMessageStyles()}>{message}</Text>}
    </View>
  );
};

export default LoadingState;
