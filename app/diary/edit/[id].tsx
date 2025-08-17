import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, Alert, ActivityIndicator } from 'react-native';

import { EntryForm, EntryFormDataType } from '../../../src/components/common/entry-form';
import { useThemeColors } from '../../../src/components/providers/theme-provider';
import { Colors } from '../../../src/constants/colors';
import { DiaryService } from '../../../src/features/diary/services';
import { DiaryMediaType as FormMediaType } from '../../../src/features/diary/types';

type DiaryDetailType = Awaited<ReturnType<typeof DiaryService.getDiaryById>>;
type DiaryMediaType = Awaited<ReturnType<typeof DiaryService.getMediaByDiaryId>>;

/**
 * 일기 수정 페이지 컴포넌트
 *
 * 기존 일기를 불러와서 수정할 수 있는 페이지입니다.
 * 공통 EntryForm 컴포넌트를 사용하여 일정과 동일한 UI를 제공합니다.
 */
const DiaryEditPage = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme: themeColors, isDark } = useThemeColors();
  const [isLoading, setIsLoading] = useState(true);
  const [diary, setDiary] = useState<DiaryDetailType | null>(null);
  const [existingMedia, setExistingMedia] = useState<DiaryMediaType>([]);
  const [initialData, setInitialData] = useState<EntryFormDataType | undefined>();

  useEffect(() => {
    if (id && typeof id === 'string') {
      const numericId = parseInt(id, 10);
      if (!isNaN(numericId)) fetchDiaryData(numericId);
    }
  }, [id]);

  const fetchDiaryData = async (diaryId: number) => {
    try {
      setIsLoading(true);
      const [diaryData, mediaData] = await Promise.all([
        DiaryService.getDiaryById(diaryId),
        DiaryService.getMediaByDiaryId(diaryId),
      ]);

      if (diaryData) {
        setDiary(diaryData);
        setExistingMedia(mediaData);

        // 기존 미디어를 폼 미디어로 변환
        const formMedia: FormMediaType[] = mediaData.map((media) => ({
          id: media.id.toString(),
          type: media.media_type as 'image' | 'video' | 'audio',
          uri: media.file_path,
        }));

        // 초기 데이터 설정
        setInitialData({
          title: diaryData.title || '',
          content: diaryData.body || '',
          media: formMedia,
          style: {
            fontFamily: diaryData.font || 'default',
            fontSize: diaryData.font_size || 16,
            textAlign: (diaryData.text_align as 'left' | 'center' | 'right') || 'left',
            textColor: diaryData.text_color || (isDark ? '#FFFFFF' : '#000000'),
            backgroundColor: diaryData.background_color || '#FFFFFF',
          },
          mood: (diaryData.mood as any) || undefined,
        });
      }
    } catch (error) {
      console.error('일기 불러오기 실패:', error);
      Alert.alert('오류', '일기를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: EntryFormDataType, audioUri?: string) => {
    try {
      if (!diary || !id || typeof id !== 'string') {
        Alert.alert('오류', '일기 정보를 찾을 수 없습니다.');
        return;
      }

      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        Alert.alert('오류', '잘못된 일기 ID입니다.');
        return;
      }

      // 일기 정보 업데이트
      await DiaryService.updateDiary({
        id: numericId,
        title: data.title,
        body: data.content,
        font: data.style.fontFamily,
        fontSize: data.style.fontSize,
        textAlign: data.style.textAlign,
        textColor: data.style.textColor,
        backgroundColor: data.style.backgroundColor,
        mood: data.mood,
        audioUri: audioUri,
      });

      // 새 미디어 추가
      const newMediaFiles = data.media.filter(
        (media) => !existingMedia.some((existing) => existing.file_path === media.uri),
      );

      for (const media of newMediaFiles) {
        await DiaryService.addMedia({
          owner_type: 'diary' as const,
          media_type: media.type,
          file_path: media.uri,
          owner_id: numericId,
        });
      }

      Alert.alert('성공', '일기가 수정되었습니다.', [
        { text: '확인', onPress: () => router.replace('/(tabs)/diary') },
      ]);
    } catch (error) {
      console.error('일기 수정 실패:', error);
      Alert.alert('오류', '일기 수정 중 오류가 발생했습니다.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={Colors.paleCobalt} />
      </SafeAreaView>
    );
  }

  if (!initialData) {
    Alert.alert('오류', '일기를 찾을 수 없습니다.', [
      { text: '확인', onPress: () => router.back() },
    ]);
    return null;
  }

  return (
    <EntryForm
      title="일기 수정하기"
      initialData={initialData}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      showMoodPicker={true}
    />
  );
};

export default DiaryEditPage;
