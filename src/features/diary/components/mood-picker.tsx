import { Smile } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { Colors } from '../../../constants/colors';
import { MoodType, MOOD_OPTIONS } from '../types';
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
  return (
    <BaseModal visible={visible} onClose={onClose} height="40%" preventOutsideTouch>
      <Text className="mb-4 text-center text-lg font-bold">오늘의 기분을 선택하세요</Text>
      <View className="flex-row flex-wrap justify-around">
        {MOOD_OPTIONS.map((mood) => (
          <TouchableOpacity
            key={mood.value}
            onPress={() => onSelect(mood.value)}
            className="mb-6 items-center"
            style={{ width: '30%' }}
          >
            <Text className="text-4xl">{mood.emoji}</Text>
            <Text className="mt-2 text-base">{mood.label}</Text>
            <Text className="text-ellipsis text-center text-xs text-gray">{mood.description}</Text>
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
  const selectedMood = MOOD_OPTIONS.find((m) => m.value === mood);
  return (
    <>
      <Text className="text-xl">{selectedMood?.emoji}</Text>
      <Text className="text-sm text-black">{selectedMood?.label}</Text>
    </>
  );
};

/**
 * 기분 미선택시 표시 컴포넌트
 *
 * 기분이 선택되지 않았을 때 기본 안내 메시지를 표시합니다.
 */
const EmptyMoodDisplay = () => {
  return (
    <>
      <Smile size={20} color={Colors.paleCobalt} />
      <Text className="text-sm text-black">오늘의 기분</Text>
    </>
  );
};

MoodPicker.MoodDisplay = MoodDisplay;
MoodPicker.EmptyMoodDisplay = EmptyMoodDisplay;

export default MoodPicker;
