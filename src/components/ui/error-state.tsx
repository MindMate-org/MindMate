import { AlertCircle, RefreshCw } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { useThemeColors } from '../providers/theme-provider';
import { useI18n } from '../../hooks/use-i18n';

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
  retryText,
  className = '',
  iconColor,
}) => {
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();

  const finalRetryText = retryText || t.common.retry;

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

  const containerStyle = {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flex: variant === 'fullscreen' ? 1 : undefined,
    backgroundColor: variant === 'fullscreen' ? themeColors.background : undefined,
    paddingHorizontal: variant === 'fullscreen' ? 24 : variant === 'compact' ? 8 : 16,
    paddingVertical: variant === 'compact' ? 8 : 16,
  };

  const messageStyle = {
    marginTop: variant === 'fullscreen' ? 16 : variant === 'compact' ? 4 : 12,
    textAlign: 'center' as const,
    fontSize: variant === 'fullscreen' ? 16 : variant === 'compact' ? 12 : 14,
    color: themeColors.text,
    lineHeight: variant === 'fullscreen' ? 24 : undefined,
  };

  const retryButtonStyle = {
    marginTop: variant === 'fullscreen' ? 24 : variant === 'compact' ? 8 : 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: variant === 'compact' ? 6 : 8,
    backgroundColor: themeColors.primary,
    paddingHorizontal: variant === 'fullscreen' ? 24 : variant === 'compact' ? 12 : 16,
    paddingVertical: variant === 'fullscreen' ? 12 : variant === 'compact' ? 6 : 8,
  };

  const retryTextStyle = {
    marginLeft: variant === 'compact' ? 4 : 8,
    fontSize: variant === 'fullscreen' ? 16 : variant === 'compact' ? 12 : 14,
    fontWeight: '500' as const,
    color: themeColors.primaryText,
  };

  return (
    <View style={containerStyle}>
      {/* 에러 아이콘 */}
      <AlertCircle size={getIconSize()} color={iconColor || themeColors.error} />

      {/* 에러 메시지 */}
      <Text style={messageStyle}>{message}</Text>

      {/* 재시도 버튼 */}
      {onRetry && (
        <TouchableOpacity style={retryButtonStyle} onPress={onRetry} activeOpacity={0.7}>
          <RefreshCw size={getRetryIconSize()} color={themeColors.primaryText} />
          <Text style={retryTextStyle}>{finalRetryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ErrorState;
