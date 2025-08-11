import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

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
  const getInputStyles = () => {
    const baseStyles = 'bg-white rounded-lg px-4 py-3 text-base text-gray-800';

    switch (variant) {
      case 'search':
        return `${baseStyles} rounded-xl shadow-dropShadow border-0`;
      case 'compact':
        return `${baseStyles} py-2 text-sm`;
      case 'default':
      default:
        return `${baseStyles} border border-gray-300 shadow-sm focus:border-paleCobalt focus:shadow-md`;
    }
  };

  const getBorderStyle = () => {
    if (error) return 'border-red-500';
    if (disabled) return 'border-gray-200';
    return '';
  };

  const getTextColor = () => {
    if (disabled) return 'text-gray-400';
    return 'text-gray-800';
  };

  const inputHeight = multiline && height ? { minHeight: height } : {};

  return (
    <View className={`w-full ${className}`}>
      {/* 라벨 */}
      {label && (
        <View className="mb-2 flex-row items-center">
          <Text className="text-gray-700 text-sm font-medium">{label}</Text>
          {required && <Text className="ml-1 text-sm text-red-500">*</Text>}
        </View>
      )}

      {/* 입력 필드 */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        editable={!disabled}
        className={`${getInputStyles()} ${getBorderStyle()} ${getTextColor()} ${
          disabled ? 'opacity-50' : ''
        }`}
        style={inputHeight}
        {...textInputProps}
      />

      {/* 에러 메시지 */}
      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </View>
  );
};

export default React.memo(FormInput);
