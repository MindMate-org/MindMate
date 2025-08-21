import React from 'react';
import { Modal, Pressable, StatusBar } from 'react-native';

import { useThemeColors } from '../../../components/providers/theme-provider';

/**
 * 기본 모달 컴포넌트의 props 타입
 */
export type BaseModalProps = {
  /** 모달 표시 여부 */
  visible: boolean;
  /** 모달 닫기 콜백 */
  onClose: () => void;
  /** 모달 내용 */
  children: React.ReactNode;
  /** 모달 높이 (기본값: '40%') */
  height?: string;
  /** 터치 시 모달 외부 영역 클릭 방지 여부 (기본값: false) */
  preventOutsideTouch?: boolean;
};

/**
 * 공통 모달 베이스 컴포넌트
 *
 * 일기 앱의 모든 바텀 시트 모달에서 사용하는 공통 스타일과 동작을 제공합니다.
 * 모달 외부 클릭 시 닫기, 상태바 투명 처리, 바텀에서 올라오는 애니메이션 등을 포함합니다.
 *
 * @component
 * @example
 * ```tsx
 * <BaseModal visible={isVisible} onClose={handleClose}>
 *   <Text>모달 내용</Text>
 * </BaseModal>
 * ```
 */
const BaseModal: React.FC<BaseModalProps> = ({
  visible,
  onClose,
  children,
  height = '40%',
  preventOutsideTouch = false,
}) => {
  const { theme: themeColors } = useThemeColors();
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
          paddingTop: StatusBar.currentHeight || 0,
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={preventOutsideTouch ? (e) => e.stopPropagation() : undefined}
          onStartShouldSetResponder={() => true}
          style={{
            backgroundColor: themeColors.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: height === '100%' ? 24 : 24,
            paddingTop: height === '100%' ? 60 : 24,
            paddingBottom: 0,
            height: height as any, // Allow percentage height values
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
        >
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default BaseModal;
