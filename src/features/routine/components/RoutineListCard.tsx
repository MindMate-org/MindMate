import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Pencil, Trash } from 'lucide-react-native';

/**
 * 루틴 리스트 카드 컴포넌트
 * @param title - 루틴 이름
 * @param time - 시간
 * @param duration - 기간/소요시간
 * @param onPress - 카드 클릭 시 콜백
 * @param onEdit - 편집 아이콘 클릭 시 콜백
 * @param onDelete - 삭제 아이콘 클릭 시 콜백
 * @param className - 추가 스타일 클래스
 */
type RoutineListCardProps = {
  title: string;
  time: string;
  duration: string;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
};

const RoutineListCard = ({
  title,
  time,
  duration,
  onPress,
  onEdit,
  onDelete,
  className = '',
}: RoutineListCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`mb-3 w-full flex-row rounded-xl bg-white shadow-dropShadow ${className}`}
      style={{ height: 96, position: 'relative' }}
    >
      <View className="w-2 rounded-l-xl bg-paleCobalt" />
      <View style={{ position: 'absolute', top: 16, right: 20, flexDirection: 'row', zIndex: 2 }}>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={{ marginRight: 8 }}>
            <Pencil size={24} color="#576BCD" />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity onPress={onDelete}>
            <Trash size={24} color="#576BCD" />
          </TouchableOpacity>
        )}
      </View>
      <View className="h-full flex-1 pl-4 pr-4">
        <View className="h-full flex-1 justify-center">
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#576BCD', marginBottom: 4 }}>
            {title}
          </Text>
          <Text style={{ fontSize: 20, color: '#576BCD' }}>
            {time} ~{duration}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RoutineListCard;
