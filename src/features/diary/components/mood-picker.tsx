import { Smile } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { useThemeColors } from '../../../components/providers/theme-provider';
import { useI18n } from '../../../hooks/use-i18n';
import { MoodType, MOOD_OPTIONS, getMoodOptions } from '../types';
import BaseModal from './base-modal';

type MoodPickerProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (mood: MoodType) => void;
};

/**
 * 기분 선택 모달 컴포넌트
 *
 * 사용자가 오늘의 기분을 선택할 수 있는 모달입니다.
 * 9가지 기분 옵션을 이모지와 함께 제공합니다.
 *
 * @param visible - 모달 표시 여부
 * @param onClose - 모달 닫기 콜백
 * @param onSelect - 기분 선택 콜백
 */
const MoodPicker = ({ visible, onClose, onSelect }: MoodPickerProps) => {
  const { theme: themeColors } = useThemeColors();
  const { t } = useI18n();

  return (
    <BaseModal visible={visible} onClose={onClose} height="50%" preventOutsideTouch>
      <Text
        style={{
          marginBottom: 16,
          textAlign: 'center',
          fontSize: 18,
          fontWeight: 'bold',
          color: themeColors.text,
        }}
      >
        {t.locale.startsWith('en') ? 'Select your mood today' : '오늘의 기분을 선택하세요'}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-around',
        }}
      >
        {getMoodOptions(t.locale).map((mood) => (
          <TouchableOpacity
            key={mood.value}
            onPress={() => onSelect(mood.value)}
            style={{
              marginBottom: 24,
              alignItems: 'center',
              width: '30%',
            }}
          >
            <Text style={{ fontSize: 36 }}>{mood.emoji}</Text>
            <Text
              style={{
                marginTop: 8,
                fontSize: 16,
                color: themeColors.text,
              }}
            >
              {mood.label}
            </Text>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 12,
                color: themeColors.textSecondary,
              }}
            >
              {mood.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </BaseModal>
  );
};

/**
 * 선택된 기분 표시 컴포넌트
 *
 * 선택된 기분의 이모지와 라벨을 표시합니다.
 *
 * @param mood - 표시할 기분 값
 */
const MoodDisplay = ({ mood }: { mood: MoodType }) => {
  const { theme: themeColors } = useThemeColors();
  const { t } = useI18n();
  const selectedMood = getMoodOptions(t.locale).find((m) => m.value === mood);
  return (
    <>
      <Text style={{ fontSize: 20 }}>{selectedMood?.emoji}</Text>
      <Text
        style={{
          fontSize: 14,
          color: themeColors.text,
        }}
      >
        {selectedMood?.label}
      </Text>
    </>
  );
};

/**
 * 기분 미선택시 표시 컴포넌트
 *
 * 기분이 선택되지 않았을 때 기본 안내 메시지를 표시합니다.
 */
const EmptyMoodDisplay = () => {
  const { theme: themeColors } = useThemeColors();
  const { t } = useI18n();
  return (
    <>
      <Smile size={20} color={themeColors.primary} />
      <Text
        style={{
          fontSize: 14,
          color: themeColors.text,
        }}
      >
        {t.locale.startsWith('en') ? "Today's Mood" : '오늘의 기분'}
      </Text>
    </>
  );
};

MoodPicker.MoodDisplay = MoodDisplay;
MoodPicker.EmptyMoodDisplay = EmptyMoodDisplay;

export default MoodPicker;
