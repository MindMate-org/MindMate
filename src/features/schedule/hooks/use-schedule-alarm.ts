import * as Notifications from 'expo-notifications';
import { useState } from 'react';
import { Alert } from 'react-native';

import type { ScheduleType } from '../types/schedule-types';

// 일정 알림 훅
export const useScheduleAlarm = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  // 알림 초기화
  const initializeAlarms = async () => {
    try {
      // 알림 권한 요청
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('권한 필요', '알림 기능을 사용하려면 알림 권한이 필요합니다.');
        return false;
      }

      // 알림 설정
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      setIsInitialized(true);
      return true;
    } catch (error) {
      console.error('일정 알림 초기화 실패:', error);
      return false;
    }
  };

  // 일정 알림 설정
  const scheduleAlarm = async (schedule: ScheduleType) => {
    if (!isInitialized) {
      const initialized = await initializeAlarms();
      if (!initialized) return false;
    }

    try {
      // 기존 알림 제거
      await cancelAlarm(schedule.id);

      // 일정 시간을 로컬 시간대로 정확히 파싱
      const scheduleDateTime = new Date(schedule.time);
      const now = new Date();

      // 로컬 시간대로 알람 시간 설정 (UTC 오프셋 보정)
      const alarmDate = new Date(scheduleDateTime.getTime());

      // 과거 시간이면 알림 설정하지 않음
      if (alarmDate <= now) {
        console.log(`과거 일정이므로 알림 설정하지 않음: ${schedule.title}`);
        return true;
      }

      console.log(
        '[일정 알림 예약] 일정 시간:',
        scheduleDateTime.toLocaleString('ko-KR'),
        '예약된 알람:',
        alarmDate.toLocaleString('ko-KR'),
        '정확한 시간:',
        `${alarmDate.getHours()}:${alarmDate.getMinutes()}:${alarmDate.getSeconds()}`,
      );

      // 알림 ID를 고유하게 생성
      const alarmId = `schedule_${schedule.id}_${Date.now()}`;

      // 일정 알림 스케줄링
      await Notifications.scheduleNotificationAsync({
        identifier: alarmId,
        content: {
          title: '일정 알림',
          body: `"${schedule.title}" 일정이 시작됩니다!`,
          data: {
            scheduleId: schedule.id,
            scheduleTitle: schedule.title,
            type: 'schedule_alarm',
          },
        },
        trigger: { date: alarmDate } as any,
      });

      console.log(`일정 알림 설정 완료: ${schedule.title} - ${alarmDate.toLocaleString()}`);
      return true;
    } catch (error) {
      console.error('일정 알림 설정 실패:', error);
      return false;
    }
  };

  // 일정 알림 취소
  const cancelAlarm = async (scheduleId: number) => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const scheduleAlarms = scheduledNotifications.filter(
        (notification) => notification.content.data?.scheduleId === scheduleId,
      );

      for (const alarm of scheduleAlarms) {
        await Notifications.cancelScheduledNotificationAsync(alarm.identifier);
      }

      console.log(`일정 알림 취소 완료: ${scheduleId}`);
      return true;
    } catch (error) {
      console.error('일정 알림 취소 실패:', error);
      return false;
    }
  };

  // 특정 일정의 알림 조회
  const getScheduleAlarms = async (scheduleId: number) => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      return scheduledNotifications.filter(
        (notification) => notification.content.data?.scheduleId === scheduleId,
      );
    } catch (error) {
      console.error('일정 알림 조회 실패:', error);
      return [];
    }
  };

  // 모든 일정 알림 취소
  const cancelAllScheduleAlarms = async () => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const scheduleAlarms = scheduledNotifications.filter(
        (notification) => notification.content.data?.type === 'schedule_alarm',
      );

      for (const alarm of scheduleAlarms) {
        await Notifications.cancelScheduledNotificationAsync(alarm.identifier);
      }

      console.log('모든 일정 알림 취소 완료');
      return true;
    } catch (error) {
      console.error('모든 일정 알림 취소 실패:', error);
      return false;
    }
  };

  return {
    isInitialized,
    initializeAlarms,
    scheduleAlarm,
    cancelAlarm,
    getScheduleAlarms,
    cancelAllScheduleAlarms,
  };
};
