import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, Alert, ActivityIndicator, Text } from 'react-native';

import { Colors } from '../../../src/constants/colors';
import { EntryForm, EntryFormDataType } from '../../../src/components/common/entry-form';
import { AlarmSection } from '../../../src/features/schedule/components/alarm-section';
import { AlarmTimeModal } from '../../../src/features/schedule/components/alarm-time-modal';
import { useScheduleAlarm } from '../../../src/features/schedule/hooks/use-schedule-alarm';
import {
  fetchGetScheduleById,
  fetchUpdateSchedule,
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheduleId = parseInt(id, 10);
  const { scheduleAlarm } = useScheduleAlarm();

  const [schedule, setSchedule] = useState<ScheduleType | null>(null);
  const [location, setLocation] = useState('');
  const [companion, setCompanion] = useState('');
  const [alarmTime, setAlarmTime] = useState<Date | undefined>();
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<EntryFormDataType | undefined>();

  useEffect(() => {
    loadSchedule();
  }, [scheduleId]);

  const loadSchedule = async () => {
    try {
      const data = await fetchGetScheduleById(scheduleId);
      if (data) {
        setSchedule(data);
        setLocation(data.location || '');
        setCompanion(data.companion || '');
        setAlarmTime(data.time ? new Date(data.time) : undefined);

        // 초기 데이터 설정
        setInitialData({
          title: data.title,
          content: data.contents || '',
          media: [], // 일정은 현재 미디어를 지원하지 않음
          style: {
            fontFamily: 'default',
            fontSize: 16,
            textAlign: 'left',
            textColor: '#000000',
            backgroundColor: '#F5F7FF',
          },
        });
      } else {
        Alert.alert('오류', '일정을 찾을 수 없습니다.', [
          { text: '확인', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
      Alert.alert('오류', '일정을 불러오는 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: EntryFormDataType) => {
    try {
      const updateData: UpdateScheduleDataType = {
        title: data.title,
        contents: data.content || undefined,
        time: alarmTime ? alarmTime.toISOString() : (schedule?.time || new Date().toISOString()),
        location: location.trim() || undefined,
        companion: companion.trim() || undefined,
      };

      const success = await fetchUpdateSchedule(scheduleId, updateData);
      if (success) {
        // 알림 재설정 (알림 시간이 설정된 경우에만)
        if (alarmTime) {
          const updatedSchedule = {
            id: scheduleId,
            title: data.title,
            time: alarmTime.toISOString(),
            contents: data.content || undefined,
            location: location.trim() || undefined,
            companion: companion.trim() || undefined,
            is_completed: schedule?.is_completed || 0,
            created_at: schedule?.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          await scheduleAlarm(updatedSchedule);
        }

        Alert.alert('완료', '일정이 수정되었습니다.', [
          { text: '확인', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('오류', '일정 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      Alert.alert('오류', '일정 수정 중 문제가 발생했습니다.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleAlarmPress = () => {
    setShowAlarmModal(true);
  };

  const handleAlarmConfirm = (date: Date) => {
    setAlarmTime(date);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={Colors.paleCobalt} />
        <Text className="mt-2 text-paleCobalt">로딩 중...</Text>
      </SafeAreaView>
    );
  }

  if (!initialData) {
    Alert.alert('오류', '일정 정보를 찾을 수 없습니다.', [
      { text: '확인', onPress: () => router.back() },
    ]);
    return null;
  }

  const alarmSection = (
    <AlarmSection
      location={location}
      companion={companion}
      onLocationChange={setLocation}
      onCompanionChange={setCompanion}
      onAlarmPress={handleAlarmPress}
      alarmTime={alarmTime}
    />
  );

  return (
    <>
      <EntryForm
        title="일정 수정하기"
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        showMoodPicker={false}
        showAlarmSection={true}
        alarmSection={alarmSection}
      />

      <AlarmTimeModal
        isVisible={showAlarmModal}
        onClose={() => setShowAlarmModal(false)}
        onConfirm={handleAlarmConfirm}
        initialDate={alarmTime || new Date()}
      />
    </>
  );
};

export default EditSchedulePage;
