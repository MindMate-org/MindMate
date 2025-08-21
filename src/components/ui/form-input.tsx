import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

import { useThemeColors } from '../providers/theme-provider';

export type FormInputVariant = 'default' | 'search' | 'compact';

export interface FormInputPropsType extends Omit<TextInputProps, 'style'> {
  /** 입력 필드 값 */
  value: string;
  /** 값 변경 시 호출되는 함수 */
  onChangeText: (text: string) => void;
  /** 입력 필드 라벨 */
  label?: string;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 컴포넌트 변형 */
  variant?: FormInputVariant;
  /** 여러 줄 입력 여부 */
  multiline?: boolean;
  /** 에러 메시지 */
  error?: string;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 추가 클래스명 */
  className?: string;
  /** 입력 필드 높이 (multiline일 때 사용) */
  height?: number;
  /** 필수 입력 필드 여부 */
  required?: boolean;
}

/**
 * 통합 폼 입력 컴포넌트
 * 앱 전체에서 사용되는 텍스트 입력 필드를 통일된 스타일로 제공합니다.
 */
const FormInput: React.FC<FormInputPropsType> = ({
  value,
  onChangeText,
  label,
  placeholder,
  variant = 'default',
  multiline = false,
  error,
  disabled = false,
  className = '',
  height,
  required = false,
  ...textInputProps
}) => {
  const { theme: themeColors, isDark } = useThemeColors();

  const getInputStyles = () => {
    return {
      backgroundColor: themeColors.surface,
      borderRadius: variant === 'search' ? 12 : 8,
      paddingHorizontal: 16,
      paddingVertical: variant === 'compact' ? 8 : 12,
      fontSize: variant === 'compact' ? 14 : 16,
      color: disabled ? themeColors.textSecondary : themeColors.text,
      borderWidth: variant === 'search' ? 0 : 1,
      borderColor: error ? themeColors.error : disabled ? themeColors.border : themeColors.border,
      shadowColor: themeColors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.2 : 0.1,
      shadowRadius: 2,
      elevation: 1,
    };
  };

  const inputHeight = multiline && height ? { minHeight: height } : {};

  return (
    <View style={{ width: '100%' }}>
      {/* 라벨 */}
      {label && (
        <View
          style={{
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: themeColors.text,
            }}
          >
            {label}
          </Text>
          {required && (
            <Text
              style={{
                marginLeft: 4,
                fontSize: 14,
                color: themeColors.error,
              }}
            >
              *
            </Text>
          )}
        </View>
      )}

      {/* 입력 필드 */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={themeColors.textSecondary}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        editable={!disabled}
        style={{
          ...getInputStyles(),
          ...inputHeight,
          opacity: disabled ? 0.5 : 1,
        }}
        {...textInputProps}
      />

      {/* 에러 메시지 */}
      {error && (
        <Text
          style={{
            marginTop: 4,
            fontSize: 12,
            color: themeColors.error,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

export default React.memo(FormInput);
