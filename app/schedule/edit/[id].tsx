import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, Alert, ActivityIndicator, Text } from 'react-native';

import { Colors } from '../../../src/constants/colors';
import { EntryForm, EntryFormDataType } from '../../../src/components/common/entry-form';
import { AlarmSection } from '../../../src/features/schedule/components/alarm-section';
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
      const data = await fetchGetScheduleById(scheduleId);
      if (data) {
        setSchedule(data);
        setLocation(data.location || '');
        setCompanion(data.companion || '');

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
        time: schedule?.time || new Date().toISOString(),
        location: location.trim() || undefined,
        companion: companion.trim() || undefined,
      };

      const success = await fetchUpdateSchedule(scheduleId, updateData);
      if (success) {
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
    // TODO: 알림 설정 모달 구현
    Alert.alert('알림', '알림 설정 기능은 곧 추가될 예정입니다.');
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
    />
  );

  return (
    <EntryForm
      title="일정 수정하기"
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
