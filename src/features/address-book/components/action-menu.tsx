import { Modal, TouchableWithoutFeedback, TouchableOpacity, View, Text } from 'react-native';

const ActionMenu = ({
  isVisible,
  onClose,
  onEdit,
  onDelete,
}: {
  isVisible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const handleDelete = () => {
    onDelete();
    onClose();
  };

  const handleEdit = () => {
    onEdit();
    onClose();
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade" onRequestClose={onClose}>
      {/* 배경 오버레이 */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 items-center justify-center bg-black/50 px-4">
          {/* 메뉴 컨테이너 */}
          <TouchableWithoutFeedback>
            <View className="min-w-[200px] rounded-xl bg-white shadow-lg">
              {/* 헤더 */}
              <View className="border-gray-100 border-b px-4 py-3">
                <Text className="text-gray-500 text-sm font-medium">연락처 관리</Text>
              </View>

              {/* 편집하기 */}
              <TouchableOpacity
                onPress={handleEdit}
                className="border-gray-100 flex-row items-center border-b px-4 py-4"
              >
                <Text className="text-gray-800 text-base">편집하기</Text>
              </TouchableOpacity>

              {/* 삭제하기 */}
              <TouchableOpacity onPress={handleDelete} className="flex-row items-center px-4 py-4">
                <Text className="text-base font-medium text-red-500">삭제하기</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ActionMenu;
