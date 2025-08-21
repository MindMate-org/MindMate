import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { useState, useEffect } from 'react';
import { UseFormSetValue } from 'react-hook-form';

import { CustomAlertManager } from '../../../components/ui/custom-alert';
import { useI18n } from '../../../hooks/use-i18n';
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
  const { t } = useI18n();
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
        CustomAlertManager.error(
          t.locale.startsWith('en') ? 'Uploading' : '업로드 중',
          t.locale.startsWith('en')
            ? 'Please wait for media upload to complete.'
            : '미디어 업로드가 완료될 때까지 기다려주세요.',
        );
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
        CustomAlertManager.success(
          t.locale.startsWith('en') ? 'Audio file has been added.' : '음성 파일이 추가되었습니다.',
          t.locale.startsWith('en') ? 'Success' : '성공',
        );
      }

      finishUpload();
    } catch (error) {
      setError(
        t.locale.startsWith('en')
          ? 'An error occurred while selecting the audio file.'
          : '음성 파일 선택 중 오류가 발생했습니다.',
      );
      CustomAlertManager.error(
        t.locale.startsWith('en') ? 'Error' : '오류',
        t.locale.startsWith('en')
          ? 'An error occurred while selecting the audio file.'
          : '음성 파일 선택 중 오류가 발생했습니다.',
      );
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
        CustomAlertManager.error(
          t.locale.startsWith('en') ? 'Uploading' : '업로드 중',
          t.locale.startsWith('en')
            ? 'Please wait for media upload to complete.'
            : '미디어 업로드가 완료될 때까지 기다려주세요.',
        );
        return;
      }

      // 권한 상태 확인
      const { status: currentStatus } = await Audio.getPermissionsAsync();

      if (currentStatus === 'undetermined') {
        // 권한이 아직 요청되지 않았을 때, 사용자에게 설명 제공
        return new Promise<void>((resolve) => {
          CustomAlertManager.alert(
            t.locale.startsWith('en') ? 'Microphone Permission' : '마이크 권한',
            t.locale.startsWith('en')
              ? 'This app needs access to your microphone to record voice memos for your diary entries. Your recordings are stored locally on your device.'
              : '일기에 음성 메모를 녹음하기 위해 마이크 접근 권한이 필요합니다. 녹음된 내용은 기기에 안전하게 저장됩니다.',
            [
              {
                text: t.locale.startsWith('en') ? 'Cancel' : '취소',
                style: 'cancel',
                onPress: () => resolve(),
              },
              {
                text: t.locale.startsWith('en') ? 'Allow' : '허용',
                onPress: async () => {
                  const { status } = await Audio.requestPermissionsAsync();
                  if (status === 'granted') {
                    await proceedWithRecording();
                  } else {
                    CustomAlertManager.error(
                      t.locale.startsWith('en') ? 'Permission Denied' : '권한 거부됨',
                      t.locale.startsWith('en')
                        ? 'Microphone permission is required for voice recording. Please enable it in your device settings.'
                        : '음성 녹음을 위해 마이크 권한이 필요합니다. 기기 설정에서 권한을 허용해주세요.',
                    );
                  }
                  resolve();
                },
              },
            ],
          );
        });
      } else if (currentStatus === 'granted') {
        await proceedWithRecording();
      } else {
        CustomAlertManager.error(
          t.locale.startsWith('en') ? 'Permission Required' : '권한 필요',
          t.locale.startsWith('en')
            ? 'Microphone permission is required for voice recording. Please enable it in your device settings.'
            : '음성 녹음을 위해 마이크 권한이 필요합니다. 기기 설정에서 권한을 허용해주세요.',
        );
        return;
      }
    } catch (error) {
      setError(
        t.locale.startsWith('en')
          ? 'An error occurred during voice recording.'
          : '음성 녹음 중 오류가 발생했습니다.',
      );
      CustomAlertManager.error(
        t.locale.startsWith('en') ? 'Error' : '오류',
        t.locale.startsWith('en')
          ? 'An error occurred during voice recording.'
          : '음성 녹음 중 오류가 발생했습니다.',
      );
    }
  };

  /**
   * 실제 녹음 진행
   */
  const proceedWithRecording = async () => {
    try {
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
      setError(
        t.locale.startsWith('en')
          ? 'An error occurred during voice recording.'
          : '음성 녹음 중 오류가 발생했습니다.',
      );
      CustomAlertManager.error(
        t.locale.startsWith('en') ? 'Error' : '오류',
        t.locale.startsWith('en')
          ? 'An error occurred during voice recording.'
          : '음성 녹음 중 오류가 발생했습니다.',
      );
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
            CustomAlertManager.success(
              t.locale.startsWith('en') ? 'Voice has been saved.' : '음성이 저장되었습니다.',
              t.locale.startsWith('en') ? 'Recording Complete' : '녹음 완료',
            );
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
        const options = t.locale.startsWith('en')
          ? ['Record Voice', 'Select from Files', 'Cancel']
          : ['음성 녹음하기', '파일에서 선택', '취소'];
        CustomAlertManager.alert(
          t.locale.startsWith('en') ? 'Add Voice' : '음성 추가',
          t.locale.startsWith('en')
            ? 'Please select how to add voice.'
            : '음성을 추가할 방법을 선택하세요.',
          [
            {
              text: options[0],
              onPress: startRecording,
            },
            {
              text: options[1],
              onPress: handleAudioFilePicker,
            },
            { text: options[2], style: 'cancel' },
          ],
        );
      }
    } catch (error) {
      setError(
        t.locale.startsWith('en')
          ? 'An error occurred while processing audio.'
          : '음성 처리 중 오류가 발생했습니다.',
      );
      CustomAlertManager.error(
        t.locale.startsWith('en') ? 'Error' : '오류',
        t.locale.startsWith('en')
          ? 'An error occurred while processing audio.'
          : '음성 처리 중 오류가 발생했습니다.',
      );
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
