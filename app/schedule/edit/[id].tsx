import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, ActivityIndicator, Text } from 'react-native';

import { EntryForm, EntryFormDataType } from '../../../src/components/common/entry-form';
import { CustomAlertManager } from '../../../src/components/ui/custom-alert';
import { useI18n } from '../../../src/hooks/use-i18n';
import { Colors } from '../../../src/constants/colors';
import { useThemeColors } from '../../../src/components/providers/theme-provider';
import { AlarmSection } from '../../../src/features/schedule/components/alarm-section';
import {
  fetchGetScheduleById,
  fetchUpdateSchedule,
  fetchGetMediaByScheduleId,
  fetchAddMediaToSchedule,
  fetchDeleteAllMediaByScheduleId,
} from '../../../src/features/schedule/services/schedule-services';
import type {
  ScheduleType,
  UpdateScheduleDataType,
} from '../../../src/features/schedule/types/schedule-types';

/**
 * 일정 편집 페이지
 *
 * 공통 EntryForm 컴포넌트를 사용하여 일기와 동일한 UI를 제공하며,
 * 일정 전용 알림 기능을 추가로 제공합니다.
 */
const EditSchedulePage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { theme: themeColors } = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheduleId = parseInt(id, 10);

  const [schedule, setSchedule] = useState<ScheduleType | null>(null);
  const [location, setLocation] = useState('');
  const [companion, setCompanion] = useState('');
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<EntryFormDataType | undefined>();

  useEffect(() => {
    loadSchedule();
  }, [scheduleId]);

  const loadSchedule = async () => {
    try {
      const [data, mediaData] = await Promise.all([
        fetchGetScheduleById(scheduleId),
        fetchGetMediaByScheduleId(scheduleId),
      ]);
      
      if (data) {
        setSchedule(data);
        setLocation(data.location || '');
        setCompanion(data.companion || '');

        // 미디어 데이터를 EntryForm 형식으로 변환
        const media = mediaData.map((m) => ({
          id: m.id.toString(),
          type: m.media_type as 'image' | 'video' | 'audio',
          uri: m.file_path,
        }));

        // 초기 데이터 설정
        setInitialData({
          title: data.title,
          content: data.contents || '',
          media,
          style: {
            fontFamily: 'default',
            fontSize: 16,
            textAlign: 'left',
            textColor: themeColors.text,
            backgroundColor: themeColors.surface,
          },
        });
      } else {
        CustomAlertManager.error(t.locale.startsWith('en') ? 'Schedule not found.' : '일정을 찾을 수 없습니다.');
        router.back();
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
      CustomAlertManager.error(t.locale.startsWith('en') ? 'An error occurred while loading the schedule.' : '일정을 불러오는 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: EntryFormDataType) => {
    try {
      const updateData: UpdateScheduleDataType = {
        title: data.title,
        contents: data.content || undefined,
        time: schedule?.time || new Date().toISOString(),
        location: location.trim() || undefined,
        companion: companion.trim() || undefined,
      };

      const success = await fetchUpdateSchedule(scheduleId, updateData);
      if (success) {
        // 기존 미디어 모두 삭제
        await fetchDeleteAllMediaByScheduleId(scheduleId);

        // 새로운 미디어 저장
        const mediaFiles = data.media.map((media) => ({
          mediaType: media.type,
          filePath: media.uri,
        }));

        for (const media of mediaFiles) {
          await fetchAddMediaToSchedule({
            owner_id: scheduleId,
            media_type: media.mediaType,
            file_path: media.filePath,
          });
        }

        await CustomAlertManager.success(t.locale.startsWith('en') ? 'Schedule has been updated.' : '일정이 수정되었습니다.');
        router.back();
      } else {
        CustomAlertManager.error(t.locale.startsWith('en') ? 'Failed to update schedule.' : '일정 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      CustomAlertManager.error(t.locale.startsWith('en') ? 'An error occurred while updating the schedule.' : '일정 수정 중 문제가 발생했습니다.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleAlarmPress = () => {
    // TODO: 알림 설정 모달 구현
    CustomAlertManager.info(t.locale.startsWith('en') ? 'Notification settings feature will be added soon.' : '알림 설정 기능은 곧 추가될 예정입니다.');
  };

  if (loading) {
    return (
      <SafeAreaView style={{ 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: themeColors.background 
      }}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={{ 
          marginTop: 8, 
          color: themeColors.text 
        }}>{t.locale.startsWith('en') ? 'Loading...' : '로딩 중...'}</Text>
      </SafeAreaView>
    );
  }

  if (!initialData) {
    CustomAlertManager.error(t.locale.startsWith('en') ? 'Schedule information not found.' : '일정 정보를 찾을 수 없습니다.');
    router.back();
    return null;
  }

  const alarmSection = (
    <AlarmSection
      location={location}
      companion={companion}
      onLocationChange={setLocation}
      onCompanionChange={setCompanion}
      onAlarmPress={handleAlarmPress}
    />
  );

  return (
    <EntryForm
      title={t.locale.startsWith('en') ? 'Edit Schedule' : '일정 수정하기'}
      initialData={initialData}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      showMoodPicker={false}
      showAlarmSection={true}
      alarmSection={alarmSection}
    />
  );
};

export default EditSchedulePage;
