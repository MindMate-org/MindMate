import React from 'react';

import Modal from './modal';

type BottomModalProps = {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  children: React.ReactNode;
  className?: string;
  closeOnBackdrop?: boolean;
};

/**
 * 하단 모달 컴포넌트 (통합된 Modal 사용)
 * @param isModalVisible - 모달 표시 여부
 * @param setIsModalVisible - 모달 표시 상태 변경 함수
 * @param children - 모달 내부에 들어갈 내용
 * @param className - 추가적인 스타일 클래스
 * @param closeOnBackdrop - 배경 클릭 시 닫기 여부
 * @returns
 */
const BottomModal = ({
  isModalVisible,
  setIsModalVisible,
  children,
  className,
  closeOnBackdrop = true,
}: BottomModalProps) => {
  return (
    <Modal
      visible={isModalVisible}
      onClose={() => setIsModalVisible(false)}
      variant="bottom"
      showCloseButton={false}
      closeOnBackdrop={closeOnBackdrop}
      className={className}
      animationType="slide"
    >
      {children}
    </Modal>
  );
};

export default BottomModal;
