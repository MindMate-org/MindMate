import React from 'react';
import {
  Modal as RNModal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
} from 'react-native';

export type ModalVariant = 'center' | 'bottom' | 'fullscreen';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * 통합된 모달 컴포넌트
 * @param visible - 모달 표시 여부
 * @param onClose - 닫기 함수
 * @param children - 모달 내부에 들어갈 내용
 * @param className - 추가적인 스타일 클래스
 * @param variant - 모달 표시 방식
 * @param size - 모달 크기
 * @param showCloseButton - 닫기 버튼 표시 여부
 * @param closeOnBackdrop - 배경 클릭 시 닫기 여부
 * @param animationType - 애니메이션 타입
 */
type ModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: ModalVariant;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  animationType?: 'fade' | 'slide' | 'none';
};

const Modal = ({
  visible,
  onClose,
  children,
  className = '',
  variant = 'center',
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  animationType = 'fade',
}: ModalProps) => {
  const getContainerStyles = () => {
    switch (variant) {
      case 'center':
        return 'flex-1 items-center justify-center bg-black/40';
      case 'bottom':
        return 'flex flex-1';
      case 'fullscreen':
        return 'flex-1 bg-black/90';
      default:
        return 'flex-1 items-center justify-center bg-black/40';
    }
  };

  const getModalStyles = () => {
    if (variant === 'bottom') {
      return 'h-auto items-center justify-between bg-white';
    }

    if (variant === 'fullscreen') {
      return 'flex-1 bg-white';
    }

    const sizeStyles = {
      sm: 'min-w-[60%] max-w-[80%]',
      md: 'min-w-[70%] max-w-[90%]',
      lg: 'min-w-[80%] max-w-[95%]',
      xl: 'min-w-[90%] max-w-[98%]',
      full: 'w-full h-full',
    };

    return `rounded-lg bg-white p-6 ${sizeStyles[size]}`;
  };

  const renderBottomModal = () => (
    <View className={getContainerStyles()}>
      <TouchableWithoutFeedback onPress={closeOnBackdrop ? onClose : undefined}>
        <View className="flex-1 bg-black/50" />
      </TouchableWithoutFeedback>
      <View className={getModalStyles()}>{children}</View>
    </View>
  );

  const renderCenterModal = () => (
    <TouchableWithoutFeedback onPress={closeOnBackdrop ? onClose : undefined}>
      <View className={getContainerStyles()}>
        <TouchableWithoutFeedback onPress={() => {}}>
          <View className={`${getModalStyles()} ${className}`}>
            {children}
            {showCloseButton && (
              <TouchableOpacity onPress={onClose} className="mt-4 self-end">
                <Text className="text-blue font-bold">닫기</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );

  const renderFullscreenModal = () => (
    <View className={getContainerStyles()}>
      <View className={`${getModalStyles()} ${className}`}>{children}</View>
    </View>
  );

  const renderModalContent = () => {
    switch (variant) {
      case 'bottom':
        return renderBottomModal();
      case 'fullscreen':
        return renderFullscreenModal();
      case 'center':
      default:
        return renderCenterModal();
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent={variant !== 'fullscreen'}
      animationType={animationType}
      onRequestClose={onClose}
    >
      {renderModalContent()}
    </RNModal>
  );
};

export default Modal;
