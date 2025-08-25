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
        paddingBottom: 32,
        gap: 8,
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
            paddingVertical: 8, // 터치 영역 확대
            minHeight: 30, // 최소 높이 확보
          }}
          placeholder={
            t.locale.startsWith('en')
              ? 'Please enter the desired location.'
              : '일정 장소를 입력해주세요.'
          }
          placeholderTextColor={themeColors.textSecondary}
          value={location}
          onChangeText={onLocationChange}
          multiline={false}
          textAlignVertical="center"
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
            paddingVertical: 8, // 터치 영역 확대
            minHeight: 40, // 최소 높이 확보
          }}
          placeholder={t.locale.startsWith('en') ? 'Enter participants' : '참가자 입력'}
          placeholderTextColor={themeColors.textSecondary}
          value={companion}
          onChangeText={onCompanionChange}
          multiline={false}
          textAlignVertical="center"
        />
      </View>
    </View>
  );
};
