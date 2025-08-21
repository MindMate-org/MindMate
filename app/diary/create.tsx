import { useRouter } from 'expo-router';
import React from 'react';

import { EntryForm, EntryFormDataType } from '../../src/components/common/entry-form';
import { CustomAlertManager } from '../../src/components/ui/custom-alert';
import { useI18n } from '../../src/hooks/use-i18n';
import { DiaryService } from '../../src/features/diary/services';

/**
 * 일기 작성 페이지 컴포넌트
 *
 * 공통 EntryForm 컴포넌트를 사용하여 일기를 작성합니다.
 * 일정과 동일한 UI를 제공하며, 기분 선택 기능을 포함합니다.
 */
const DiaryCreatePage = () => {
  const router = useRouter();
  const { t } = useI18n();

  const handleSubmit = async (data: EntryFormDataType, audioUri?: string) => {
    try {
      const mediaFiles = data.media.map((media) => ({
        ownerType: 'diary' as const,
        mediaType: media.type,
        filePath: media.uri,
      }));

      const diaryId = await DiaryService.createDiary({
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

      for (const media of mediaFiles) {
        await DiaryService.addMedia({
          owner_type: 'diary',
          owner_id: diaryId,
          media_type: media.mediaType,
          file_path: media.filePath,
        });
      }

      await CustomAlertManager.success(
        t.locale.startsWith('en') ? 'Diary saved successfully.' : '일기가 저장되었습니다.',
      );
      router.replace('/(tabs)/diary');
    } catch (error) {
      console.error('Diary save failed:', error);
      CustomAlertManager.error(
        t.locale.startsWith('en')
          ? 'An error occurred while saving the diary.'
          : '일기 저장 중 오류가 발생했습니다.',
      );
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <EntryForm
      title={t.diary.create}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      showMoodPicker={true}
    />
  );
};

export default DiaryCreatePage;
