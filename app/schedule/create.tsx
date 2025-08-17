import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert } from 'react-native';

import { EntryForm, EntryFormDataType } from '../../src/components/common/entry-form';
import { AlarmSection } from '../../src/features/schedule/components/alarm-section';
import { useScheduleAlarm } from '../../src/features/schedule/hooks/use-schedule-alarm';
import { fetchCreateSchedule, fetchAddMediaToSchedule } from '../../src/features/schedule/services/schedule-services';
import type { CreateScheduleDataType } from '../../src/features/schedule/types/schedule-types';

/**
 * 일정 작성 페이지
 *
 * 공통 EntryForm 컴포넌트를 사용하여 일기와 동일한 UI를 제공하며,
 * 일정 전용 알림 기능을 추가로 제공합니다.
 */
const CreateSchedulePage = () => {
  const router = useRouter();
  const { scheduleAlarm } = useScheduleAlarm();

  const [location, setLocation] = useState('');
  const [companion, setCompanion] = useState('');

  const handleSubmit = async (data: EntryFormDataType, audioUri?: string) => {
    try {
      const scheduleData: CreateScheduleDataType = {
        title: data.title,
        contents: data.content || undefined,
        time: new Date().toISOString(),
        location: location.trim() || undefined,
        companion: companion.trim() || undefined,
      };

      const newScheduleId = await fetchCreateSchedule(scheduleData);

      if (newScheduleId) {
        // 미디어 파일 저장
        const mediaFiles = data.media.map((media) => ({
          mediaType: media.type,
          filePath: media.uri,
        }));

        for (const media of mediaFiles) {
          await fetchAddMediaToSchedule({
            owner_id: newScheduleId,
            media_type: media.mediaType,
            file_path: media.filePath,
          });
        }

        // 알림 설정
        const mockSchedule = {
          id: newScheduleId,
          title: data.title,
          time: new Date().toISOString(),
          contents: data.content || undefined,
          location: location.trim() || undefined,
          companion: companion.trim() || undefined,
          is_completed: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await scheduleAlarm(mockSchedule);

        Alert.alert('완료', '일정이 저장되었습니다.', [
          { text: '확인', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('오류', '일정 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      Alert.alert('오류', '일정 저장 중 문제가 발생했습니다.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleAlarmPress = () => {
    // TODO: 알림 설정 모달 구현
    Alert.alert('알림', '알림 설정 기능은 곧 추가될 예정입니다.');
  };

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
      title="일정 작성하기"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      showMoodPicker={false}
      showAlarmSection={true}
      alarmSection={alarmSection}
    />
  );
};

export default CreateSchedulePage;
