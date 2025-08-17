import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

import { useThemeColors } from '../providers/theme-provider';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'floating';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonPropsType {
  children?: React.ReactNode;
  onPress?: () => void;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  activeOpacity?: number;
  text?: string; // floating 버튼용 텍스트
}

/**
 * 통합된 버튼 컴포넌트
 * @param children - 버튼 안에 들어갈 내용
 * @param onPress - 버튼이 눌렸을 때 실행될 함수
 * @param className - 추가적인 스타일 클래스
 * @param variant - 버튼 스타일 변형
 * @param size - 버튼 크기
 * @param disabled - 비활성화 여부
 * @param loading - 로딩 상태
 * @param activeOpacity - 터치 시 투명도
 * @param text - floating 버튼용 텍스트 (기본값: "+")
 * @returns
 */
const Button = ({
  children,
  onPress,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  activeOpacity = 0.8,
  text = '+',
}: ButtonPropsType) => {
  const { theme: themeColors, isDark } = useThemeColors();
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-paleCobalt';
      case 'secondary':
        return 'bg-paleYellow';
      case 'outline':
        return 'bg-transparent border border-paleCobalt';
      case 'ghost':
        return 'bg-transparent';
      case 'floating':
        return `absolute items-center justify-center rounded-full bottom-20 right-8`;
      default:
        return 'bg-paleCobalt';
    }
  };

  const getSizeStyles = () => {
    if (variant === 'floating') {
      return 'h-16 w-16'; // 다른 탭들과 동일한 크기 (64x64)
    } else {
      switch (size) {
        case 'sm':
          return 'h-10 px-3';
        case 'md':
          return 'h-14 px-4';
        case 'lg':
          return 'h-16 px-6';
        case 'xl':
          return 'h-20 px-8';
        default:
          return 'h-14 px-4';
      }
    }
  };

  const getTextStyles = () => {
    if (variant === 'floating') {
      return 'text-3xl font-light'; // 다른 탭들과 동일한 텍스트 크기
    }
    return '';
  };

  const isFloating = variant === 'floating';
  const baseStyles = isFloating
    ? getVariantStyles()
    : `items-center justify-center rounded-lg ${getVariantStyles()}`;

  return (
    <TouchableOpacity
      className={`${baseStyles} ${getSizeStyles()} ${disabled ? 'opacity-50' : ''} ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={activeOpacity}
      style={{
        ...(isFloating ? {
          backgroundColor: themeColors.primary,
          shadowColor: themeColors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.4 : 0.2,
          shadowRadius: 8,
          elevation: 8,
        } : {}),
        ...(isFloating && size === 'md' ? { transform: [{ scale: disabled ? 0.95 : 1 }] } : {}),
      }}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#576BCD' : 'white'} />
      ) : (
        <>
          {isFloating ? (
            <Text 
              className={getTextStyles()}
              style={{ color: themeColors.primaryText }}
            >{text}</Text>
          ) : (
            children
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export default React.memo(Button);
