import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';

import { EntryForm, EntryFormDataType } from '../../src/components/common/entry-form';
import { CustomAlertManager } from '../../src/components/ui/custom-alert';
import { useI18n } from '../../src/hooks/use-i18n';
import { AlarmSection } from '../../src/features/schedule/components/alarm-section';
import { useScheduleAlarm } from '../../src/features/schedule/hooks/use-schedule-alarm';
import {
  fetchCreateSchedule,
  fetchAddMediaToSchedule,
} from '../../src/features/schedule/services/schedule-services';
import type { CreateScheduleDataType } from '../../src/features/schedule/types/schedule-types';
import { notificationService } from '../../src/lib/notification-service';

/**
 * 일정 작성 페이지
 *
 * 공통 EntryForm 컴포넌트를 사용하여 일기와 동일한 UI를 제공하며,
 * 일정 전용 알림 기능을 추가로 제공합니다.
 */
const CreateSchedulePage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { scheduleAlarm } = useScheduleAlarm();

  const [location, setLocation] = useState('');
  const [companion, setCompanion] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(true);

  const handleSubmit = async (data: EntryFormDataType, audioUri?: string) => {
    try {
      const scheduleData: CreateScheduleDataType = {
        title: data.title,
        contents: data.content || undefined,
        time: selectedDateTime.toISOString(),
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

        // 알림 설정 (사용자가 활성화한 경우에만)
        if (notificationEnabled) {
          // 알림 서비스 직접 사용하여 정확한 시간에 알림 설정
          const success = await notificationService.scheduleNotification(
            newScheduleId.toString(),
            'schedule',
            t.locale.startsWith('en') ? 'Schedule Reminder' : '일정 알림',
            t.locale.startsWith('en')
              ? `"${data.title}" is starting!`
              : `"${data.title}" 일정이 시작됩니다!`,
            selectedDateTime,
            false, // 일회성 알림
          );

          if (success) {
            console.log(`✅ 일정 알림 설정 완료: ${selectedDateTime.toLocaleString('ko-KR')}`);
          } else {
            console.warn(`⚠️ 일정 알림 설정 실패 - 시간이 유효하지 않을 수 있습니다.`);
          }
        }

        await CustomAlertManager.success(
          t.locale.startsWith('en') ? 'Schedule saved successfully.' : '일정이 저장되었습니다.',
        );
        router.push('/(tabs)/schedule');
      } else {
        CustomAlertManager.error(
          t.locale.startsWith('en') ? 'Failed to save schedule.' : '일정 저장에 실패했습니다.',
        );
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      CustomAlertManager.error(
        t.locale.startsWith('en')
          ? 'An error occurred while saving the schedule.'
          : '일정 저장 중 문제가 발생했습니다.',
      );
    }
  };

  const handleCancel = () => {
    router.push('/(tabs)/schedule');
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      // 시간은 유지하고 날짜만 변경
      const newDateTime = new Date(selectedDateTime);
      newDateTime.setFullYear(date.getFullYear());
      newDateTime.setMonth(date.getMonth());
      newDateTime.setDate(date.getDate());
      setSelectedDateTime(newDateTime);
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(false);
    if (time) {
      // 날짜는 유지하고 시간만 변경
      const newDateTime = new Date(selectedDateTime);
      newDateTime.setHours(time.getHours());
      newDateTime.setMinutes(time.getMinutes());
      newDateTime.setSeconds(0);
      newDateTime.setMilliseconds(0);
      setSelectedDateTime(newDateTime);
    }
  };

  const handleAlarmPress = async () => {
    // 간단한 구현: 날짜/시간/알림 설정을 순서대로 보여주기
    return new Promise<void>((resolve) => {
      CustomAlertManager.alert(
        t.locale.startsWith('en') ? 'Schedule Settings' : '일정 설정',
        t.locale.startsWith('en') ? 'Choose an option:' : '옵션을 선택하세요:',
        [
          {
            text: t.locale.startsWith('en') ? '📅 Date' : '📅 날짜',
            onPress: () => {
              setShowDatePicker(true);
              resolve();
            },
          },
          {
            text: t.locale.startsWith('en') ? '🕒 Time' : '🕒 시간',
            onPress: () => {
              setShowTimePicker(true);
              resolve();
            },
          },
          {
            text: notificationEnabled
              ? t.locale.startsWith('en')
                ? '🔕 Turn Off'
                : '🔕 알림 끄기'
              : t.locale.startsWith('en')
                ? '🔔 Turn On'
                : '🔔 알림 켜기',
            onPress: () => {
              setNotificationEnabled(!notificationEnabled);
              resolve();
            },
          },
          {
            text: t.locale.startsWith('en') ? 'Cancel' : '취소',
            style: 'cancel',
            onPress: () => resolve(),
          },
        ],
      );
    });
  };

  const alarmSection = (
    <AlarmSection
      location={location}
      companion={companion}
      onLocationChange={setLocation}
      onCompanionChange={setCompanion}
      onAlarmPress={handleAlarmPress}
      scheduledTime={selectedDateTime}
      notificationEnabled={notificationEnabled}
    />
  );

  return (
    <>
      <EntryForm
        title={t.locale.startsWith('en') ? 'Create Schedule' : '일정 작성하기'}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        showMoodPicker={false}
        showAlarmSection={true}
        alarmSection={alarmSection}
      />

      {/* 날짜 선택기 */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDateTime}
          mode="date"
          display="default"
          locale={t.locale.startsWith('en') ? 'en_US' : 'ko_KR'}
          onChange={handleDateChange}
        />
      )}

      {/* 시간 선택기 */}
      {showTimePicker && (
        <DateTimePicker
          value={selectedDateTime}
          mode="time"
          display="default"
          locale={t.locale.startsWith('en') ? 'en_US' : 'ko_KR'}
          onChange={handleTimeChange}
        />
      )}
    </>
  );
};

export default CreateSchedulePage;
