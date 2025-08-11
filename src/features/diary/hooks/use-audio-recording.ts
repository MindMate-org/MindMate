import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { useState, useEffect } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { Alert } from 'react-native';

import { DiaryMediaType, RecordingStateType } from '../types';
import { useMediaUpload } from './use-media-upload';

/**
 * 오디오 녹음 관리 훅
 *
 * 음성 녹음 기능을 제공하며, 업로드 상태를 관리합니다.
 * 업로드 중일 때는 새로운 녹음을 시작할 수 없습니다.
 *
 * @param watchedMedia - 현재 미디어 목록
 * @param setValue - 폼 값 설정 함수
 * @returns 녹음 상태 및 제어 함수들
 */
export const useAudioRecording = (
  watchedMedia: DiaryMediaType[],
  setValue: UseFormSetValue<any>,
) => {
  const { uploadState, startUpload, finishUpload, setError } = useMediaUpload();
  const [recordingState, setRecordingState] = useState<RecordingStateType>({
    isRecording: false,
    duration: 0,
  });
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [recordingInterval, setRecordingInterval] = useState<ReturnType<typeof setInterval> | null>(
    null,
  );

  useEffect(() => {
    return () => {
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
    };
  }, [recordingInterval]);

  /**
   * 음성 파일 선택 처리
   *
   * DocumentPicker를 사용하여 기존 음성 파일을 선택할 수 있습니다.
   */
  const handleAudioFilePicker = async () => {
    try {
      if (uploadState.isUploading) {
        Alert.alert('업로드 중', '미디어 업로드가 완료될 때까지 기다려주세요.');
        return;
      }

      startUpload();

      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        // 음성 파일 처리 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newMedia: DiaryMediaType = {
          id: Date.now().toString(),
          type: 'audio',
          uri: asset.uri,
          duration: undefined, // 선택된 파일의 경우 duration 정보가 없을 수 있음
        };

        setValue('media', [...watchedMedia, newMedia]);
        Alert.alert('성공', '음성 파일이 추가되었습니다.');
      }

      finishUpload();
    } catch (error) {
      console.error('음성 파일 선택 실패:', error);
      setError('음성 파일 선택 중 오류가 발생했습니다.');
      Alert.alert('오류', '음성 파일 선택 중 오류가 발생했습니다.');
    }
  };

  /**
   * 오디오 녹음 시작/중지 처리
   *
   * 업로드 중일 때는 새로운 녹음을 시작할 수 없습니다.
   * 녹음 완료 시 자동으로 미디어 목록에 추가됩니다.
   */
  /**
   * 직접 녹음 시작
   */
  const startRecording = async () => {
    try {
      // 업로드 중일 때는 새로운 녹음 시작 불가
      if (uploadState.isUploading) {
        Alert.alert('업로드 중', '미디어 업로드가 완료될 때까지 기다려주세요.');
        return;
      }

      // 녹음 시작
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '음성 녹음을 위해 마이크 권한이 필요합니다.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      const startTime = new Date();
      setRecordingState({
        isRecording: true,
        startTime,
        duration: 0,
        recording,
      });

      // 녹음 시간 업데이트
      const interval = setInterval(() => {
        setRecordingState((prev) => ({
          ...prev,
          duration: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
        }));
      }, 1000);
      setRecordingInterval(interval);
    } catch (error) {
      console.error('음성 녹음 실패:', error);
      setError('음성 녹음 중 오류가 발생했습니다.');
      Alert.alert('오류', '음성 녹음 중 오류가 발생했습니다.');
    }
  };

  const handleAudioRecording = async () => {
    try {
      if (recordingState.isRecording) {
        // 녹음 중지
        if (recordingState.recording) {
          startUpload();
          await recordingState.recording.stopAndUnloadAsync();
          const uri = recordingState.recording.getURI();
          if (uri) {
            setAudioUri(uri);
            const newMedia: DiaryMediaType = {
              id: Date.now().toString(),
              type: 'audio',
              uri: uri,
              duration: recordingState.duration,
            };
            setValue('media', [...watchedMedia, newMedia]);
            Alert.alert('녹음 완료', '음성이 저장되었습니다.');
          }
          finishUpload();
        }
        if (recordingInterval) {
          clearInterval(recordingInterval);
          setRecordingInterval(null);
        }
        setRecordingState({ isRecording: false, duration: 0 });
      } else {
        // 녹음 시작 전 선택 옵션 제공
        const options = ['음성 녹음하기', '파일에서 선택', '취소'];
        Alert.alert('음성 추가', '음성을 추가할 방법을 선택하세요.', [
          {
            text: options[0],
            onPress: startRecording,
          },
          {
            text: options[1],
            onPress: handleAudioFilePicker,
          },
          { text: options[2], style: 'cancel' },
        ]);
      }
    } catch (error) {
      console.error('음성 처리 실패:', error);
      setError('음성 처리 중 오류가 발생했습니다.');
      Alert.alert('오류', '음성 처리 중 오류가 발생했습니다.');
    }
  };

  return {
    recordingState,
    audioUri,
    handleAudioRecording,
    handleAudioFilePicker,
    uploadState,
  };
};
