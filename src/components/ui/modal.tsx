import React from 'react';
import {
  Modal as RNModal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
  StatusBar,
} from 'react-native';

import { useThemeColors } from '../providers/theme-provider';

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
  const { theme: themeColors, isDark } = useThemeColors();

  const renderBottomModal = () => (
    <View 
      style={{ 
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        paddingTop: StatusBar.currentHeight || 0
      }}
    >
      <TouchableWithoutFeedback onPress={closeOnBackdrop ? onClose : undefined}>
        <View style={{ flex: 1 }} />
      </TouchableWithoutFeedback>
      <View style={{
        backgroundColor: themeColors.surface,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingBottom: 0,
        marginBottom: 0,
        width: '100%',
        alignSelf: 'center',
        maxHeight: '80%',
      }}>
        {children}
      </View>
    </View>
  );

  const renderCenterModal = () => {
    const sizeStyles = {
      sm: { minWidth: '60%', maxWidth: '80%' },
      md: { minWidth: '70%', maxWidth: '90%' },
      lg: { minWidth: '80%', maxWidth: '95%' },
      xl: { minWidth: '90%', maxWidth: '98%' },
      full: { flex: 1 },
    };

    return (
      <TouchableWithoutFeedback onPress={closeOnBackdrop ? onClose : undefined}>
        <View 
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            paddingTop: StatusBar.currentHeight || 0,
            paddingHorizontal: 16,
          }}
        >
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[
              {
                backgroundColor: themeColors.surface,
                borderRadius: 16,
                padding: 24,
                shadowColor: themeColors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.4 : 0.2,
                shadowRadius: 8,
                elevation: 8,
              },
              sizeStyles[size]
            ]}>
              {children}
              {showCloseButton && (
                <TouchableOpacity onPress={onClose} style={{ marginTop: 16, alignSelf: 'flex-end' }}>
                  <Text style={{ color: themeColors.primary, fontWeight: 'bold' }}>닫기</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const renderFullscreenModal = () => (
    <View style={{
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
    }}>
      <View style={{
        flex: 1,
        backgroundColor: themeColors.background,
      }}>
        {children}
      </View>
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
      statusBarTranslucent={true}
    >
      {renderModalContent()}
    </RNModal>
  );
};

export default Modal;
