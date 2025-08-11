import { AlertCircle, RefreshCw } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export type ErrorStateVariant = 'fullscreen' | 'inline' | 'compact';

interface ErrorStateProps {
  /** 에러 메시지 */
  message: string;
  /** 재시도 함수 */
  onRetry?: () => void;
  /** 컴포넌트 변형 */
  variant?: ErrorStateVariant;
  /** 재시도 버튼 텍스트 */
  retryText?: string;
  /** 추가 클래스명 */
  className?: string;
  /** 아이콘 색상 */
  iconColor?: string;
}

/**
 * 통합 에러 상태 컴포넌트
 * 앱 전체에서 사용되는 에러 상태를 일관된 스타일로 제공합니다.
 */
const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  variant = 'inline',
  retryText = '다시 시도',
  className = '',
  iconColor = '#ef4444',
}) => {
  const getContainerStyles = () => {
    const baseStyles = 'items-center justify-center';

    switch (variant) {
      case 'fullscreen':
        return `${baseStyles} flex-1 bg-white px-6`;
      case 'compact':
        return `${baseStyles} p-2`;
      case 'inline':
      default:
        return `${baseStyles} p-4`;
    }
  };

  const getIconSize = () => {
    switch (variant) {
      case 'fullscreen':
        return 48;
      case 'compact':
        return 16;
      case 'inline':
      default:
        return 32;
    }
  };

  const getMessageStyles = () => {
    switch (variant) {
      case 'fullscreen':
        return 'mt-4 text-center text-base text-gray-700 leading-6';
      case 'compact':
        return 'mt-1 text-xs text-gray-600 text-center';
      case 'inline':
      default:
        return 'mt-3 text-center text-sm text-gray-600';
    }
  };

  const getRetryButtonStyles = () => {
    switch (variant) {
      case 'fullscreen':
        return 'mt-6 flex-row items-center justify-center rounded-lg bg-paleCobalt px-6 py-3';
      case 'compact':
        return 'mt-2 flex-row items-center justify-center rounded-md bg-paleCobalt px-3 py-1.5';
      case 'inline':
      default:
        return 'mt-4 flex-row items-center justify-center rounded-lg bg-paleCobalt px-4 py-2';
    }
  };

  const getRetryTextStyles = () => {
    switch (variant) {
      case 'fullscreen':
        return 'ml-2 text-base font-medium text-white';
      case 'compact':
        return 'ml-1 text-xs text-white';
      case 'inline':
      default:
        return 'ml-2 text-sm font-medium text-white';
    }
  };

  const getRetryIconSize = () => {
    switch (variant) {
      case 'fullscreen':
        return 18;
      case 'compact':
        return 12;
      case 'inline':
      default:
        return 16;
    }
  };

  return (
    <View className={`${getContainerStyles()} ${className}`}>
      {/* 에러 아이콘 */}
      <AlertCircle size={getIconSize()} color={iconColor} />

      {/* 에러 메시지 */}
      <Text className={getMessageStyles()}>{message}</Text>

      {/* 재시도 버튼 */}
      {onRetry && (
        <TouchableOpacity className={getRetryButtonStyles()} onPress={onRetry} activeOpacity={0.7}>
          <RefreshCw size={getRetryIconSize()} color="white" />
          <Text className={getRetryTextStyles()}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ErrorState;
