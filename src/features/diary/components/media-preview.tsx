import { Audio, Video as ExpoVideo, ResizeMode } from 'expo-av';
import { Mic, X, Volume2, Play } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Text, ActivityIndicator } from 'react-native';

import { Colors } from '../../../constants/colors';
import { DiaryMediaType } from '../types';

type MediaPreviewProps = {
  media: DiaryMediaType[];
  onRemove: (id: string) => void;
  isUploading?: boolean;
};

type PlayingState = {
  [key: string]: {
    isPlaying: boolean;
    sound?: Audio.Sound;
  };
};

/**
 * 첨부된 미디어 미리보기 컴포넌트
 *
 * 이미지, 비디오, 오디오 파일의 미리보기와 재생 기능을 제공합니다.
 * 업로드 중인 상태도 시각적으로 표시합니다.
 *
 * @param media - 미디어 파일 목록
 * @param onRemove - 미디어 제거 콜백
 * @param isUploading - 업로드 중인지 여부
 */
const MediaPreview = ({ media, onRemove, isUploading = false }: MediaPreviewProps) => {
  const [playingState, setPlayingState] = useState<PlayingState>({});

  if (media.length === 0) return null;

  /**
   * 오디오 재생/일시정지 토글
   */
  const toggleAudioPlayback = async (item: DiaryMediaType) => {
    try {
      const currentState = playingState[item.id];

      if (currentState?.isPlaying) {
        // 일시정지
        await currentState.sound?.pauseAsync();
        setPlayingState((prev) => ({
          ...prev,
          [item.id]: { ...prev[item.id], isPlaying: false },
        }));
      } else {
        // 재생
        if (currentState?.sound) {
          await currentState.sound.playAsync();
        } else {
          const { sound } = await Audio.Sound.createAsync({ uri: item.uri });
          await sound.playAsync();

          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              setPlayingState((prev) => ({
                ...prev,
                [item.id]: { ...prev[item.id], isPlaying: false },
              }));
            }
          });

          setPlayingState((prev) => ({
            ...prev,
            [item.id]: { sound, isPlaying: true },
          }));
          return;
        }

        setPlayingState((prev) => ({
          ...prev,
          [item.id]: { ...prev[item.id], isPlaying: true },
        }));
      }
    } catch (error) {
      }
  };

  return (
    <View>
      {isUploading && (
        <View className="mx-4 mb-2 flex-row items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
          <ActivityIndicator size="small" color={Colors.paleCobalt} />
          <Text className="text-sm text-paleCobalt">미디어 업로드 중...</Text>
        </View>
      )}

      <ScrollView horizontal className="px-4 pb-4" showsHorizontalScrollIndicator={false}>
        {media.map((item) => {
          const isAudioPlaying = playingState[item.id]?.isPlaying || false;

          return (
            <View key={item.id} className="relative mr-2 h-20 w-20">
              {item.type === 'image' ? (
                <Image
                  source={{ uri: item.uri }}
                  className="h-full w-full rounded-lg"
                  resizeMode="cover"
                />
              ) : item.type === 'video' ? (
                <View className="h-full w-full overflow-hidden rounded-lg">
                  <ExpoVideo
                    source={{ uri: item.uri }}
                    className="h-full w-full"
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={false}
                    useNativeControls={false}
                    style={{ backgroundColor: '#000' }}
                  />
                  <View className="absolute inset-0 items-center justify-center bg-black/30">
                    <Play size={24} color={Colors.white} fill={Colors.white} />
                  </View>
                  <View className="absolute bottom-1 right-1 rounded bg-black/70 px-1">
                    <Text className="text-xs text-white">
                      {item.duration ? `${Math.floor(item.duration)}s` : '동영상'}
                    </Text>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  className="h-full w-full items-center justify-center rounded-lg bg-gray"
                  onPress={() => toggleAudioPlayback(item)}
                  disabled={isUploading}
                >
                  {isAudioPlaying ? (
                    <View className="items-center">
                      <Volume2 size={20} color={Colors.white} />
                      <View className="mt-1 h-1 w-12 overflow-hidden rounded-full bg-white/30">
                        <View className="h-full w-8 rounded-full bg-white" />
                      </View>
                    </View>
                  ) : (
                    <Mic size={32} color={Colors.white} />
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => onRemove(item.id)}
                className="bg-red absolute -right-0 -top-0 h-6 w-6 items-center justify-center rounded-full"
                disabled={isUploading}
              >
                <X size={12} color={Colors.white} />
              </TouchableOpacity>

              {isUploading && (
                <View className="absolute inset-0 items-center justify-center rounded-lg bg-black/50">
                  <ActivityIndicator size="small" color={Colors.white} />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default MediaPreview;
