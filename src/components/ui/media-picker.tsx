import { Plus, X } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';

import { useI18n } from '../../hooks/use-i18n';
import { useThemeColors } from '../providers/theme-provider';

export type MediaItem = {
  uri: string;
  type?: string;
  id?: string | number;
};

export type MediaPickerVariant = 'default' | 'compact' | 'large';

type MediaPickerProps = {
  /** 현재 선택된 미디어 목록 */
  mediaList: MediaItem[];
  /** 미디어 추가 시 호출되는 함수 */
  onAddMedia: () => void;
  /** 미디어 제거 시 호출되는 함수 */
  onRemoveMedia: (index: number) => void;
  /** 최대 미디어 개수 */
  maxCount?: number;
  /** 컴포넌트 변형 */
  variant?: MediaPickerVariant;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 추가 스타일 클래스 */
  className?: string;
  /** 라벨 텍스트 */
  label?: string;
  /** 비활성화 상태 */
  disabled?: boolean;
};

/**
 * 통합 미디어 피커 컴포넌트
 * 사진/비디오 추가, 미리보기, 삭제 기능을 제공합니다.
 */
const MediaPicker: React.FC<MediaPickerProps> = ({
  mediaList,
  onAddMedia,
  onRemoveMedia,
  maxCount = 5,
  variant = 'default',
  isLoading = false,
  className = '',
  label = '',
  disabled = false,
}) => {
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
  
  // 기본 라벨 설정
  const displayLabel = label || (t.locale.startsWith('en') ? 'Add Photo' : '사진 추가');
  const getItemSize = () => {
    switch (variant) {
      case 'compact':
        return 'h-16 w-16';
      case 'large':
        return 'h-24 w-24';
      case 'default':
      default:
        return 'h-[72px] w-[72px]';
    }
  };

  const getItemSizeStyle = () => {
    switch (variant) {
      case 'compact':
        return { height: 64, width: 64 };
      case 'large':
        return { height: 96, width: 96 };
      case 'default':
      default:
        return { height: 72, width: 72 };
    }
  };

  const getAddButtonStyles = () => {
    return {
      ...getItemSizeStyle(),
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: 12,
      backgroundColor: themeColors.primary,
      shadowColor: themeColors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 4,
      opacity: disabled ? 0.5 : 1,
    };
  };

  const getImageContainerStyles = () => {
    return {
      ...getItemSizeStyle(),
      position: 'relative' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: 12,
      backgroundColor: themeColors.surface,
      shadowColor: themeColors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 4,
      overflow: 'hidden' as const,
    };
  };

  const renderAddButton = () => {
    if (mediaList.length >= maxCount) return null;

    return (
      <TouchableOpacity
        style={getAddButtonStyles()}
        onPress={onAddMedia}
        disabled={disabled || isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={themeColors.primaryText} />
        ) : (
          <Plus
            color={themeColors.primaryText}
            size={variant === 'compact' ? 16 : 20}
            strokeWidth={3}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderMediaItem = (media: MediaItem, index: number) => (
    <View key={media.id || index} style={getImageContainerStyles()}>
      <Image
        source={{ uri: media.uri }}
        style={{
          ...getItemSizeStyle(),
          borderRadius: 12,
        }}
        resizeMode="cover"
      />

      {/* 삭제 버튼 */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          right: -8,
          top: -8,
          height: 24,
          width: 24,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 12,
          backgroundColor: themeColors.error,
          shadowColor: themeColors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 4,
        }}
        onPress={() => onRemoveMedia(index)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <X color={themeColors.primaryText} size={12} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ width: '100%' }}>
      {displayLabel && (
        <Text
          style={{
            marginBottom: 8,
            fontSize: 14,
            fontWeight: '500',
            color: themeColors.text,
          }}
        >
          {displayLabel}
        </Text>
      )}

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {mediaList.map((media, index) => renderMediaItem(media, index))}
        {renderAddButton()}
      </View>

      {maxCount > 1 && (
        <Text
          style={{
            marginTop: 8,
            fontSize: 12,
            color: themeColors.textSecondary,
          }}
        >
          {mediaList.length}/{maxCount}
          {t.locale.startsWith('en') ? ' selected' : '개 선택됨'}
        </Text>
      )}
    </View>
  );
};

export default MediaPicker;
