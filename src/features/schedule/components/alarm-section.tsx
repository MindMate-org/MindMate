import { Bell, MapPin, Users } from 'lucide-react-native';
import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

import { Colors } from '../../../constants/colors';

interface AlarmSectionProps {
  location: string;
  companion: string;
  onLocationChange: (location: string) => void;
  onCompanionChange: (companion: string) => void;
  onAlarmPress?: () => void;
}

/**
 * 일정 전용 알림 및 부가정보 섹션
 *
 * 장소, 참가자, 알림 설정을 위한 UI를 제공합니다.
 * 일정 생성/수정에서만 사용됩니다.
 */
export const AlarmSection: React.FC<AlarmSectionProps> = ({
  location,
  companion,
  onLocationChange,
  onCompanionChange,
  onAlarmPress,
}) => {
  return (
    <View className="space-y-4 bg-white px-4 py-4">
      {/* 장소 */}
      <View className="flex-row items-center">
        <MapPin size={20} color={Colors.paleCobalt} />
        <TextInput
          className="text-gray-700 ml-3 flex-1 text-base"
          placeholder="서울시 마포구 마포나루길 467"
          placeholderTextColor="#6B7280"
          value={location}
          onChangeText={onLocationChange}
        />
      </View>

      {/* 알람 */}
      <TouchableOpacity className="flex-row items-center" onPress={onAlarmPress}>
        <Bell size={20} color={Colors.paleCobalt} />
        <Text className="text-gray-700 ml-3 text-base">미리 알림 받지 않음</Text>
      </TouchableOpacity>

      {/* 참가자 */}
      <View className="flex-row items-center">
        <Users size={20} color={Colors.paleCobalt} />
        <TextInput
          className="text-gray-700 ml-3 flex-1 text-base"
          placeholder="참가자 입력"
          placeholderTextColor="#6B7280"
          value={companion}
          onChangeText={onCompanionChange}
        />
      </View>
    </View>
  );
};
