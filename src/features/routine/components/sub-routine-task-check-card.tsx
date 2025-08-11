import { Check } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

/**
 * 루틴 상세 하위 작업 체크 카드
 * @param label - 하위 작업명
 * @param checked - 체크 여부
 * @param onToggle - 체크 토글 콜백
 * @param className - 추가 스타일 클래스
 */
type SubRoutineTaskCheckCardProps = {
  label: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  className?: string;
};

const SubRoutineTaskCheckCard = ({
  label,
  checked,
  onToggle,
  className = '',
}: SubRoutineTaskCheckCardProps) => {
  return (
    <TouchableOpacity
      onPress={() => onToggle(!checked)}
      activeOpacity={0.85}
      className={`mb-2 flex-row items-center justify-between rounded-xl px-4 py-3 shadow-dropShadow ${checked ? 'bg-paleCobalt' : 'bg-white'} ${className}`}
    >
      <Text className={`text-base font-medium ${checked ? 'text-white' : 'text-paleCobalt'}`}>
        {label}
      </Text>
      <View
        className={`h-6 w-6 items-center justify-center rounded border-2 ${checked ? 'border-white bg-white' : 'border-paleCobalt bg-white'}`}
      >
        {checked && <Check size={18} color="#576BCD" strokeWidth={3} />}
      </View>
    </TouchableOpacity>
  );
};

export default SubRoutineTaskCheckCard;
