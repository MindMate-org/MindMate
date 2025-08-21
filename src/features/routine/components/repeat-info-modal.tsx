import { CheckCircle, AlertTriangle, X } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Modal from 'src/components/ui/modal';

/**
 * 반복 설정 안내 모달
 * @param visible - 모달 표시 여부
 * @param onClose - 닫기 콜백
 * @param className - 추가 스타일 클래스
 */
type RepeatInfoModalProps = {
  visible: boolean;
  onClose: () => void;
  className?: string;
};

const repeatList = [
  { label: '매일', example: '예: 매일' },
  { label: 'X일마다', example: '예: 2일마다 (→ 이름 간격으로 반복)' },
  {
    label: '매주 요일',
    example: '예: 매주 수요일, 매주 월, 화, 수, 목, 금, 토, 일 중 하나 사용가능',
  },
  { label: '매달 특정일', example: '예: 매달 20일' },
  {
    label: '매달 X번째 주의 요일',
    example: '예: 매달 셋째주 수요일 (첫째주, 둘째주, 셋째주, 넷째주, 마지막 주 중 하나 + 요일)',
  },
];

const RepeatInfoModal = ({ visible, onClose, className = '' }: RepeatInfoModalProps) => {
  return (
    <Modal visible={visible} onClose={onClose} className={className}>
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-paleCobalt">반복 설정 안내</Text>
        <TouchableOpacity onPress={onClose}>
          <X size={24} color="#FF4848" />
        </TouchableOpacity>
      </View>
      <ScrollView className="max-h-[400px]">
        <Text className="mb-2 text-xs text-gray">
          루틴의 반복 주기를 아래 형식 중 하나로 입력해 주세요.
          {'\n'}입력된 형식에 맞게 정확히 작성해야 하며, 표준 표현만 인식됩니다.
        </Text>
        {/* 사용 가능한 형식 */}
        <View className="mb-2 flex-row items-center gap-2">
          <CheckCircle size={18} color="#36C46F" />
          <Text className="font-bold text-green-600">사용 가능한 형식</Text>
        </View>
        <View className="mb-2">
          {repeatList.map((item, idx) => (
            <View key={idx} className="mb-1">
              <View className="flex-row items-center">
                <Text className="mr-2 text-xs font-bold text-paleCobalt">{idx + 1}.</Text>
                <Text className="text-xs font-medium text-black">{item.label}</Text>
              </View>
              <View className="ml-5 flex-row items-center">
                <Text className="mr-2 text-paleCobalt">•</Text>
                <Text className="text-xs text-gray">{item.example}</Text>
              </View>
            </View>
          ))}
        </View>
        {/* 경고 안내 */}
        <View className="mb-2 flex-row items-center gap-2">
          <AlertTriangle size={18} color="#FF4848" className="mr-1" />
          <Text className="text-red font-bold">반복 설정 안내</Text>
        </View>
        <Text className="text-red text-xs">
          띄어쓰기 하여 입력해주세요. (예: 매주수요일 ❌, 매주 수요일 O)
          {'\n'}형식 이외의 문장은 지원되지 않습니다. (예: 격주 수요일, 월수금마다 ❌)
        </Text>
      </ScrollView>
    </Modal>
  );
};

export default RepeatInfoModal;
