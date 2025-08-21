import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Audio } from 'expo-av';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react-native';
import React, { useState, useEffect, useRef } from 'react';
import { View, Image, TouchableOpacity, Dimensions, Text, StyleSheet } from 'react-native';

import { Colors } from '../../../constants/colors';

type MediaSliderProps = {
  media: Array<{
    id: number;
    mediaType: string;
    filePath: string;
  }>;
  height?: number;
};

const { width: screenWidth } = Dimensions.get('window');

const MediaSlider = ({ media, height = 200 }: MediaSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<Video>(null);

  const currentMedia = media[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  };

  const handleAudioPress = async () => {
    try {
      if (!isAudioPlaying) {
        if (sound) {
          await sound.unloadAsync();
        }

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: currentMedia.filePath },
          { shouldPlay: true },
        );

        setSound(newSound);
        setIsAudioPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) {
            return;
          }

          if (!status.isPlaying && status.didJustFinish) {
            setIsAudioPlaying(false);
            setSound(null);
          }
        });
      } else {
        if (sound) {
          await sound.pauseAsync();
          setIsAudioPlaying(false);
        }
      }
    } catch (error) {
      }
  };

  const handleVideoPress = async () => {
    try {
      setVideoError(null);

      if (!isVideoPlaying) {
        setIsVideoLoading(true);
        await videoRef.current?.playAsync();
      } else {
        await videoRef.current?.pauseAsync();
      }
    } catch (error) {
      setVideoError('비디오를 재생할 수 없습니다');
      setIsVideoLoading(false);
    }
  };

  const onVideoPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsVideoPlaying(status.isPlaying);
      setIsVideoLoading(false);

      if (status.didJustFinish) {
        setIsVideoPlaying(false);
      }
    } else if ('error' in status) {
      setVideoError('비디오를 로드할 수 없습니다');
      setIsVideoLoading(false);
      setIsVideoPlaying(false);
    }
  };

  // 슬라이드 변경 시 미디어 정리
  useEffect(() => {
    setIsAudioPlaying(false);
    setIsVideoPlaying(false);
    setIsVideoLoading(false);
    setVideoError(null);

    if (sound) {
      sound.unloadAsync();
      setSound(null);
    }

    // 비디오 일시정지
    if (videoRef.current) {
      videoRef.current.pauseAsync();
    }
  }, [currentIndex]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  if (media.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.mediaContainer, { height }]}>
        {currentMedia.mediaType === 'image' ? (
          <Image
            source={{ uri: currentMedia.filePath }}
            style={styles.media}
            resizeMode="contain"
          />
        ) : currentMedia.mediaType === 'video' ? (
          <View style={styles.media}>
            <Video
              ref={videoRef}
              source={{ uri: currentMedia.filePath }}
              style={styles.media}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls={true}
              isLooping={false}
              shouldPlay={false}
              onPlaybackStatusUpdate={onVideoPlaybackStatusUpdate}
              onError={(error) => {
                setVideoError('비디오 파일을 재생할 수 없습니다');
                setIsVideoLoading(false);
              }}
              onLoadStart={() => {
                setIsVideoLoading(true);
                setVideoError(null);
              }}
              onLoad={() => {
                setIsVideoLoading(false);
              }}
            />
            {(videoError || isVideoLoading) && (
              <View style={styles.videoControlOverlay}>
                <View style={styles.videoControlButton}>
                  {videoError ? (
                    <Text style={styles.errorText}>재생 불가</Text>
                  ) : (
                    <Text style={styles.loadingText}>로딩 중...</Text>
                  )}
                </View>
              </View>
            )}
          </View>
        ) : currentMedia.mediaType === 'audio' ? (
          <TouchableOpacity onPress={handleAudioPress} style={styles.audioContainer}>
            {isAudioPlaying ? (
              <Pause size={48} color={Colors.paleCobalt} />
            ) : (
              <Play size={48} color={Colors.paleCobalt} />
            )}
            <Text style={styles.audioText}>{isAudioPlaying ? '재생 중...' : '음성 파일 재생'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* 좌우 네비게이션 버튼 */}
      {media.length > 1 && (
        <>
          <TouchableOpacity onPress={handlePrevious} style={styles.prevButton}>
            <ChevronLeft size={24} color={Colors.paleCobalt} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
            <ChevronRight size={24} color={Colors.paleCobalt} />
          </TouchableOpacity>
        </>
      )}

      {/* 페이지 인디케이터 */}
      {media.length > 1 && (
        <View style={styles.indicatorContainer}>
          {media.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicatorDot,
                index === currentIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  mediaContainer: {
    marginHorizontal: 0,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderRadius: 16,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  audioContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.paleCobalt,
    backgroundColor: '#F5F8FF',
  },
  audioText: {
    marginTop: 12,
    color: Colors.paleCobalt,
    fontSize: 14,
  },
  prevButton: {
    position: 'absolute',
    left: 8,
    top: '50%',
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(204, 212, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -16 }],
  },
  nextButton: {
    position: 'absolute',
    right: 8,
    top: '50%',
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(204, 212, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -16 }],
  },
  indicatorContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicatorDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.paleCobalt,
  },
  inactiveDot: {
    backgroundColor: '#999999',
  },
  videoControlOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  videoControlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 30,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
    minHeight: 60,
  },
  errorText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
});

export { MediaSlider };
