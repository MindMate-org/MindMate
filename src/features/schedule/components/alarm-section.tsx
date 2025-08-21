import { Bell, MapPin, Users } from 'lucide-react-native';
import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

import { useThemeColors } from '../../../components/providers/theme-provider';
import { useI18n } from '../../../hooks/use-i18n';

interface AlarmSectionProps {
  location: string;
  companion: string;
  onLocationChange: (location: string) => void;
  onCompanionChange: (companion: string) => void;
  onAlarmPress?: () => void;
  scheduledTime?: Date;
  notificationEnabled?: boolean;
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
  scheduledTime,
  notificationEnabled = false,
}) => {
  const { theme: themeColors } = useThemeColors();
  const { t } = useI18n();

  const getNotificationText = () => {
    if (!scheduledTime) {
      return t.locale.startsWith('en') ? 'No advance notifications' : '미리 알림 받지 않음';
    }

    const timeString = scheduledTime.toLocaleString(t.locale.startsWith('en') ? 'en-US' : 'ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (notificationEnabled) {
      return t.locale.startsWith('en') ? `Notify at ${timeString}` : `${timeString}에 알림`;
    } else {
      return t.locale.startsWith('en')
        ? `Scheduled for ${timeString} (No notification)`
        : `${timeString} 예정 (알림 없음)`;
    }
  };

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 16,
      }}
    >
      {/* 장소 */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <MapPin size={20} color={themeColors.primary} />
        <TextInput
          style={{
            marginLeft: 12,
            flex: 1,
            fontSize: 16,
            color: themeColors.text,
          }}
          placeholder={
            t.locale.startsWith('en')
              ? '467 Maponaru-gil, Mapo-gu, Seoul'
              : '서울시 마포구 마포나루길 467'
          }
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
        <Bell
          size={20}
          color={notificationEnabled ? themeColors.primary : themeColors.textSecondary}
        />
        <Text
          style={{
            marginLeft: 12,
            fontSize: 16,
            color: notificationEnabled ? themeColors.text : themeColors.textSecondary,
          }}
        >
          {getNotificationText()}
        </Text>
      </TouchableOpacity>

      {/* 참가자 */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Users size={20} color={themeColors.primary} />
        <TextInput
          style={{
            marginLeft: 12,
            flex: 1,
            fontSize: 16,
            color: themeColors.text,
          }}
          placeholder={t.locale.startsWith('en') ? 'Enter participants' : '참가자 입력'}
          placeholderTextColor={themeColors.textSecondary}
          value={companion}
          onChangeText={onCompanionChange}
        />
      </View>
    </View>
  );
};
