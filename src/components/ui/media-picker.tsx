import { Plus, X } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';

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
  maxCount = 3,
  variant = 'default',
  isLoading = false,
  className = '',
  label = '사진 추가',
  disabled = false,
}) => {
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

  const getAddButtonStyles = () => {
    return `${getItemSize()} items-center justify-center rounded-xl bg-paleCobalt shadow-dropShadow ${
      disabled ? 'opacity-50' : ''
    }`;
  };

  const getImageContainerStyles = () => {
    return `${getItemSize()} relative items-center justify-center rounded-xl bg-white shadow-dropShadow overflow-hidden`;
  };

  const renderAddButton = () => {
    if (mediaList.length >= maxCount) return null;

    return (
      <TouchableOpacity
        className={getAddButtonStyles()}
        onPress={onAddMedia}
        disabled={disabled || isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Plus color="white" size={variant === 'compact' ? 16 : 20} strokeWidth={3} />
        )}
      </TouchableOpacity>
    );
  };

  const renderMediaItem = (media: MediaItem, index: number) => (
    <View key={media.id || index} className={getImageContainerStyles()}>
      <Image
        source={{ uri: media.uri }}
        className={`${getItemSize()} rounded-xl`}
        resizeMode="cover"
      />

      {/* 삭제 버튼 */}
      <TouchableOpacity
        className="absolute -right-2 -top-2 h-6 w-6 items-center justify-center rounded-full bg-red-500 shadow-md"
        onPress={() => onRemoveMedia(index)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <X color="white" size={12} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className={`${className}`}>
      {label && <Text className="text-gray-700 mb-2 text-sm font-medium">{label}</Text>}

      <View className="flex-row flex-wrap gap-2">
        {mediaList.map((media, index) => renderMediaItem(media, index))}
        {renderAddButton()}
      </View>

      {maxCount > 1 && (
        <Text className="text-gray-500 mt-2 text-xs">
          {mediaList.length}/{maxCount}개 선택됨
        </Text>
      )}
    </View>
  );
};

export default MediaPicker;
