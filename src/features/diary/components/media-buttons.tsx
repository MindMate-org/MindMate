import { Image as ImageIcon, Video, Mic } from 'lucide-react-native';
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

import { useThemeColors } from '../../../components/providers/theme-provider';
import { useI18n } from '../../../hooks/use-i18n';
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
  const { theme: themeColors } = useThemeColors();
  const { t } = useI18n();

  return (
    <View
      style={{
        marginTop: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4,
        padding: 16,
      }}
    >
      {/* 이미지 버튼 */}
      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity
          onPress={onImagePress}
          style={{
            height: 64,
            width: 64,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 32,
            borderWidth: 2,
            borderColor: themeColors.primary,
          }}
        >
          <ImageIcon size={32} color={themeColors.primary} />
        </TouchableOpacity>
        <View style={{ minHeight: 16 }} />
      </View>

      {/* 비디오 버튼 */}
      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity
          onPress={onVideoPress}
          style={{
            height: 64,
            width: 64,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 32,
            borderWidth: 2,
            borderColor: themeColors.primary,
          }}
        >
          <Video size={32} color={themeColors.primary} />
        </TouchableOpacity>
        <View style={{ minHeight: 16 }} />
      </View>

      {/* 오디오 버튼 */}
      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity
          onPress={onAudioPress}
          style={{
            height: 64,
            width: 64,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 32,
            borderWidth: 2,
            borderColor: recordingState.isRecording ? Colors.red : themeColors.primary,
            backgroundColor: recordingState.isRecording ? '#FEE2E2' : 'transparent',
          }}
        >
          <Mic size={32} color={recordingState.isRecording ? Colors.red : themeColors.primary} />
        </TouchableOpacity>
        <View style={{ minHeight: 16 }}>
          <Text
            style={{
              marginTop: 4,
              fontSize: 12,
              fontWeight: '300',
              color: Colors.red,
              opacity: recordingState.isRecording ? 1 : 0,
            }}
          >
            {recordingState.duration}
            {t.locale.startsWith('en') ? 's' : '초'}
          </Text>
        </View>
      </View>

      {/* 스타일 버튼 */}
      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity
          onPress={onStylePress}
          style={{
            height: 64,
            width: 64,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 32,
            borderWidth: 2,
            borderColor: themeColors.primary,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: themeColors.primary,
            }}
          >
            Aa
          </Text>
        </TouchableOpacity>
        <View style={{ minHeight: 16 }} />
      </View>
    </View>
  );
};

export default MediaButtons;
