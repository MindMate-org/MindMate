import * as ImagePicker from 'expo-image-picker';

import { getTranslations } from './i18n';
import { CustomAlertManager } from '../components/ui/custom-alert';
import { db } from '../hooks/use-initialize-database';
import { useGlobalStore } from '../store/global-store';
import { MediaType } from '../types/common-db-types';

type fetchInsertMediaType = {
  media: MediaType[];
  owner_type: string;
  owner_id: number;
};

/**
 * sqlite에 미디어 저장 함수
 * @param media - [{uri : string, type : "image" | "video" | "livePhoto" | "pairedVideo" | undefined}] 미디어 배열
 * @param owner_type - 예: 'schedule', 'diary', 'contact'
 * @param owner_id - 해당 도메인 테이블의 고유 ID
 * @returns - 그대로 반환
 */
export const fetchInsertMedia = async (
  media: MediaType[],
  owner_type: string,
  owner_id: number,
): Promise<fetchInsertMediaType> => {
  await Promise.all(
    media.map((item) =>
      db.runAsync(
        `
          INSERT INTO media (owner_type, owner_id, media_type, file_path)
          VALUES (?, ?, ?, ?)
        `,
        [owner_type, owner_id, item.type ?? null, item.uri],
      ),
    ),
  );
  return { media, owner_type, owner_id };
};

/**
 * 미디어 선택 함수
 * @param mode - 'single' | 'multiple' 선택 모드
 * @returns - 단일: {uri : string, type : "image" | "video" | "livePhoto" | "pairedVideo" | undefined}, 다중: 배열
 */
export const pickMedia = async (mode: 'single' | 'multiple' = 'single') => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  const { language } = useGlobalStore.getState();
  const t = getTranslations(language);
  const isEnglish = language.startsWith('en');

  const options = [
    isEnglish ? 'Take Photo' : '카메라로 촬영',
    mode === 'multiple'
      ? isEnglish
        ? 'Choose Multiple from Gallery (up to 5)'
        : '갤러리에서 다중 선택 (최대 5개)'
      : isEnglish
        ? 'Choose from Gallery'
        : '갤러리에서 선택',
    isEnglish ? 'Cancel' : '취소',
  ];

  if (status !== 'granted') {
    CustomAlertManager.error(
      isEnglish
        ? 'Please allow gallery access in system settings.'
        : '시스템 설정에서 갤러리 접근 권한을 허용해 주세요.',
    );
    return;
  }
  return new Promise((resolve) => {
    CustomAlertManager.alert(
      isEnglish ? 'Add Media' : '미디어 추가',
      isEnglish ? 'Choose how to add media.' : '미디어를 추가할 방법을 선택하세요.',
      [
        {
          text: options[0],
          onPress: async () => {
            try {
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images', 'videos', 'livePhotos'],
                // allowsEditing: true,
                // aspect: [4, 3],
                quality: 1,
              });
              if (!result.canceled) {
                const uri = result.assets[0].uri;
                const type = result.assets[0].type;
                const newImage = { uri, type };
                return resolve(newImage);
              }
            } catch (error) {
              CustomAlertManager.error(isEnglish ? 'Image upload error' : '이미지 업로드 에러');
            }
          },
        },
        {
          text: options[1],
          onPress: async () => {
            try {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images', 'videos', 'livePhotos'],
                // allowsEditing: true,
                // aspect: [4, 3],
                quality: 1,
                allowsMultipleSelection: mode === 'multiple',
                selectionLimit: mode === 'multiple' ? 5 : 1,
              });
              if (!result.canceled) {
                if (mode === 'multiple') {
                  const newImages = result.assets.map((asset) => ({
                    uri: asset.uri,
                    type: asset.type,
                  }));
                  return resolve(newImages);
                } else {
                  const uri = result.assets[0].uri;
                  const type = result.assets[0].type;
                  const newImage = { uri, type };
                  return resolve(newImage);
                }
              }
            } catch (error) {
              CustomAlertManager.error(isEnglish ? 'Image upload error' : '이미지 업로드 에러');
            }
          },
        },
        { text: options[2], style: 'cancel' },
      ],
    );
  });
};
