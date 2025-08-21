import * as ImagePicker from 'expo-image-picker';
import { UseFormSetValue } from 'react-hook-form';

import { CustomAlertManager } from '../../../components/ui/custom-alert';
import { useI18n } from '../../../hooks/use-i18n';
import { DiaryMediaType } from '../types';
import { useMediaUpload } from './use-media-upload';

/**
 * 미디어 선택 관리 훅
 *
 * 이미지와 비디오 선택/촬영 기능을 제공하며,
 * 업로드 상태를 관리합니다.
 */
export const useMediaPicker = (watchedMedia: DiaryMediaType[], setValue: UseFormSetValue<any>) => {
  const { t } = useI18n();
  const { uploadState, startUpload, finishUpload, setError } = useMediaUpload();
  /**
   * 이미지 선택/촬영
   */
  const handleImagePicker = async () => {
    if (uploadState.isUploading) {
      CustomAlertManager.info(
        t.locale.startsWith('en')
          ? 'Please wait for media upload to complete.'
          : '미디어 업로드가 완료될 때까지 기다려주세요.',
        t.locale.startsWith('en') ? 'Uploading' : '업로드 중',
      );
      return;
    }

    const options = t.locale.startsWith('en')
      ? ['Take with camera', 'Select from album (5)', 'Cancel']
      : ['카메라로 촬영', '앨범에서 선택(5개)', '취소'];
    CustomAlertManager.alert(
      t.locale.startsWith('en') ? 'Add Image' : '이미지 추가',
      t.locale.startsWith('en') ? 'Select method' : '방법을 선택하세요',
      [
        {
          text: options[0],
          onPress: async () => {
            try {
              startUpload();
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
              });

              if (!result.canceled) {
                // 이미지 처리 시뮬레이션
                await new Promise((resolve) => setTimeout(resolve, 800));

                const newMedia: DiaryMediaType = {
                  id: Date.now().toString(),
                  type: 'image',
                  uri: result.assets[0].uri,
                };
                setValue('media', [...watchedMedia, newMedia]);
              }
              finishUpload();
            } catch (error) {
              setError(t.locale.startsWith('en') ? 'Image selection failed' : '이미지 선택 실패');
            }
          },
        },
        {
          text: options[1],
          onPress: async () => {
            try {
              startUpload();
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
                allowsMultipleSelection: true,
                selectionLimit: 5, // 최대 5개까지 선택 가능
              });

              if (!result.canceled) {
                // 이미지 처리 시뮬레이션
                await new Promise((resolve) => setTimeout(resolve, 800));

                const newMediaItems: DiaryMediaType[] = result.assets.map((asset, index) => ({
                  id: (Date.now() + index).toString(),
                  type: 'image',
                  uri: asset.uri,
                }));
                setValue('media', [...watchedMedia, ...newMediaItems]);
              }
              finishUpload();
            } catch (error) {
              setError(t.locale.startsWith('en') ? 'Image selection failed' : '이미지 선택 실패');
            }
          },
        },
        { text: options[2], style: 'cancel' },
      ],
    );
  };

  /**
   * 동영상 선택/촬영
   */
  const handleVideoPicker = async () => {
    if (uploadState.isUploading) {
      CustomAlertManager.info(
        t.locale.startsWith('en')
          ? 'Please wait for media upload to complete.'
          : '미디어 업로드가 완료될 때까지 기다려주세요.',
        t.locale.startsWith('en') ? 'Uploading' : '업로드 중',
      );
      return;
    }

    const options = t.locale.startsWith('en')
      ? ['Take with camera', 'Select from album (3)', 'Cancel']
      : ['카메라로 촬영', '앨범에서 선택(3개)', '취소'];
    CustomAlertManager.alert(
      t.locale.startsWith('en') ? 'Add Video' : '동영상 추가',
      t.locale.startsWith('en') ? 'Select method' : '방법을 선택하세요',
      [
        {
          text: options[0],
          onPress: async () => {
            try {
              startUpload();
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
              });

              if (!result.canceled) {
                // 비디오 처리 시뮬레이션 (용량에 따라 더 오래)
                const duration = result.assets[0].duration || 0;
                const processingTime = Math.max(2000, Math.min(duration * 100, 8000)); // 2-8초
                await new Promise((resolve) => setTimeout(resolve, processingTime));

                const newMedia: DiaryMediaType = {
                  id: Date.now().toString(),
                  type: 'video',
                  uri: result.assets[0].uri,
                  duration: result.assets[0].duration ?? undefined,
                };
                setValue('media', [...watchedMedia, newMedia]);
              }
              finishUpload();
            } catch (error) {
              setError(t.locale.startsWith('en') ? 'Video selection failed' : '비디오 선택 실패');
            }
          },
        },
        {
          text: options[1],
          onPress: async () => {
            try {
              startUpload();
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
                allowsMultipleSelection: true,
                selectionLimit: 3, // 비디오는 용량이 커서 3개까지만
              });

              if (!result.canceled) {
                // 비디오 처리 시뮬레이션 (용량에 따라 더 오래)
                const totalDuration = result.assets.reduce(
                  (sum, asset) => sum + (asset.duration || 0),
                  0,
                );
                const processingTime = Math.max(2000, Math.min(totalDuration * 100, 10000)); // 2-10초
                await new Promise((resolve) => setTimeout(resolve, processingTime));

                const newMediaItems: DiaryMediaType[] = result.assets.map((asset, index) => ({
                  id: (Date.now() + index).toString(),
                  type: 'video',
                  uri: asset.uri,
                  duration: asset.duration ?? undefined,
                }));
                setValue('media', [...watchedMedia, ...newMediaItems]);
              }
              finishUpload();
            } catch (error) {
              setError(t.locale.startsWith('en') ? 'Video selection failed' : '비디오 선택 실패');
            }
          },
        },
        { text: options[2], style: 'cancel' },
      ],
    );
  };

  return {
    handleImagePicker,
    handleVideoPicker,
    uploadState,
  };
};
