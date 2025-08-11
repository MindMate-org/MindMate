import { Image as ImageIcon, Video, Mic } from 'lucide-react-native';
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

import { Colors } from '../../../constants/colors';
import { RecordingStateType } from '../types';

type MediaButtonsProps = {
  onImagePress: () => void;
  onVideoPress: () => void;
  onAudioPress: () => void;
  onStylePress: () => void;
  recordingState: RecordingStateType;
};

const MediaButtons = ({
  onImagePress,
  onVideoPress,
  onAudioPress,
  onStylePress,
  recordingState,
}: MediaButtonsProps) => {
  return (
    <View className="mt-4 items-center justify-between gap-1 p-4">
      {/* 이미지 버튼 */}
      <View className="items-center">
        <TouchableOpacity
          onPress={onImagePress}
          className="h-16 w-16 items-center justify-center rounded-full border-2 border-paleCobalt"
        >
          <ImageIcon size={32} color={Colors.paleCobalt} />
        </TouchableOpacity>
        <View className="min-h-[16px]" />
      </View>

      {/* 비디오 버튼 */}
      <View className="items-center">
        <TouchableOpacity
          onPress={onVideoPress}
          className="h-16 w-16 items-center justify-center rounded-full border-2 border-paleCobalt"
        >
          <Video size={32} color={Colors.paleCobalt} />
        </TouchableOpacity>
        <View className="min-h-[16px]" />
      </View>

      {/* 오디오 버튼 */}
      <View className="items-center">
        <TouchableOpacity
          onPress={onAudioPress}
          className={`h-16 w-16 items-center justify-center rounded-full border-2 ${
            recordingState.isRecording ? 'border-red-500 bg-red-100' : 'border-paleCobalt'
          }`}
        >
          <Mic size={32} color={recordingState.isRecording ? Colors.red : Colors.paleCobalt} />
        </TouchableOpacity>
        <View className="min-h-[16px]">
          <Text
            className="mt-1 text-xs font-light text-red-500"
            style={{ opacity: recordingState.isRecording ? 1 : 0 }}
          >
            {recordingState.duration}초
          </Text>
        </View>
      </View>

      {/* 스타일 버튼 */}
      <View className="items-center">
        <TouchableOpacity
          onPress={onStylePress}
          className="h-16 w-16 items-center justify-center rounded-full border-2 border-paleCobalt"
        >
          <Text className="text-lg font-bold text-paleCobalt">Aa</Text>
        </TouchableOpacity>
        <View className="min-h-[16px]" />
      </View>
    </View>
  );
};

export default MediaButtons;
