import { Bell, MapPin, Users } from 'lucide-react-native';
import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

import { useThemeColors } from '../../../components/providers/theme-provider';
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
  const { theme: themeColors } = useThemeColors();
  
  return (
    <View style={{
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 16,
    }}>
      {/* 장소 */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <MapPin size={20} color={themeColors.primary} />
        <TextInput
          style={{
            marginLeft: 12,
            flex: 1,
            fontSize: 16,
            color: themeColors.text,
          }}
          placeholder="서울시 마포구 마포나루길 467"
          placeholderTextColor={themeColors.textSecondary}
          value={location}
          onChangeText={onLocationChange}
        />
      </View>

      {/* 알람 */}
      <TouchableOpacity 
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}
        onPress={onAlarmPress}
      >
        <Bell size={20} color={themeColors.primary} />
        <Text style={{
          marginLeft: 12,
          fontSize: 16,
          color: themeColors.text,
        }}>미리 알림 받지 않음</Text>
      </TouchableOpacity>

      {/* 참가자 */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <Users size={20} color={themeColors.primary} />
        <TextInput
          style={{
            marginLeft: 12,
            flex: 1,
            fontSize: 16,
            color: themeColors.text,
          }}
          placeholder="참가자 입력"
          placeholderTextColor={themeColors.textSecondary}
          value={companion}
          onChangeText={onCompanionChange}
        />
      </View>
    </View>
  );
};
