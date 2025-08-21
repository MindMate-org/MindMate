import { Pencil, Trash } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

/**
 * 루틴 생성/수정 화면의 하위 작업 카드 컴포넌트
 * @param title - 하위 작업명
 * @param onEdit - 수정 아이콘 클릭 시 콜백
 * @param onDelete - 삭제 아이콘 클릭 시 콜백
 * @param className - 추가 스타일 클래스
 */
type SubRoutineTaskCardProps = {
  title: string;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
};

const SubRoutineTaskCard = ({
  title,
  onEdit,
  onDelete,
  className = '',
}: SubRoutineTaskCardProps) => {
  return (
    <View
      className={`flex-row items-center rounded-xl border border-paleCobalt bg-white px-4 py-3 shadow-dropShadow ${className}`}
    >
      <Text className="flex-1 text-base font-medium text-paleCobalt">{title}</Text>
      {onEdit && (
        <TouchableOpacity onPress={onEdit} className="mr-2">
          <Pencil size={20} color="#576BCD" />
        </TouchableOpacity>
      )}
      {onDelete && (
        <TouchableOpacity onPress={onDelete}>
          <Trash size={20} color="#576BCD" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SubRoutineTaskCard;
