import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import { RoutineType } from '../types';

// 알람 설정 타입
export type AlarmSchedule = {
  id: string;
  routineId: string;
  routineName: string;
  time: string; // HH:mm 형식
  repeatCycle: string;
  isEnabled: boolean;
};

// 알람 훅
export const useAlarm = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  // 알람 초기화
  const initializeAlarms = async () => {
    try {
      // 알람 권한 요청
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('권한 필요', '알람 기능을 사용하려면 알림 권한이 필요합니다.');
        return false;
      }

      // 알람 설정
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
      console.error('알람 초기화 실패:', error);
      return false;
    }
  };

  // 알람 설정
  const scheduleAlarm = async (routine: RoutineType, targetDate: Date) => {
    if (!isInitialized) {
      const initialized = await initializeAlarms();
      if (!initialized) return false;
    }

    try {
      // 기존 알람 제거
      await cancelAlarm(routine.id);

      if (!routine.alarmTime) return true;

      // 알람 시간 파싱
      const [hours, minutes] = routine.alarmTime.split(':').map(Number);
      // targetDate를 KST 기준으로 보정
      const alarmDate = new Date(targetDate);
      alarmDate.setHours(hours, minutes, 0, 0);

      // 현재 시각과 alarmDate의 차이(밀리초)
      const now = new Date();
      const diff = alarmDate.getTime() - now.getTime();

      // 2초 이하(=즉시 울릴 위험)면 무조건 다음날로 이동
      if (diff <= 2000) {
        alarmDate.setDate(alarmDate.getDate() + 1);
      }

      // 예약 직전 로그
      console.log(
        '[알람 예약] now:',
        now.toLocaleString(),
        'alarmDate:',
        alarmDate.toLocaleString(),
        'diff(ms):',
        alarmDate.getTime() - now.getTime(),
      );

      // 예약까지 남은 초 계산
      const seconds = Math.max(1, Math.floor((alarmDate.getTime() - now.getTime()) / 1000));

      // 과거 시간이면 다음 날로 설정
      if (alarmDate <= new Date()) {
        alarmDate.setDate(alarmDate.getDate() + 1);
      }

      // 알람 ID 생성
      const alarmId = `routine_${routine.id}_${targetDate.toISOString().split('T')[0]}`;

      // 알람 스케줄링
      await Notifications.scheduleNotificationAsync({
        identifier: alarmId,
        content: {
          title: '루틴 알림',
          body: `"${routine.name}" 루틴을 시작할 시간입니다!`,
          data: {
            routineId: routine.id,
            routineName: routine.name,
            type: 'routine_alarm',
          },
        },
        trigger: { seconds } as any,
      });

      console.log(`알람 설정 완료: ${routine.name} - ${alarmDate.toLocaleString()}`);
      return true;
    } catch (error) {
      console.error('알람 설정 실패:', error);
      return false;
    }
  };

  // 알람 취소
  const cancelAlarm = async (routineId: string) => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const routineAlarms = scheduledNotifications.filter(
        (notification) => notification.content.data?.routineId === routineId,
      );

      for (const alarm of routineAlarms) {
        await Notifications.cancelScheduledNotificationAsync(alarm.identifier);
      }

      console.log(`알람 취소 완료: ${routineId}`);
      return true;
    } catch (error) {
      console.error('알람 취소 실패:', error);
      return false;
    }
  };

  // 반복 알람 설정
  const scheduleRecurringAlarm = async (routine: RoutineType, startDate: Date, endDate?: Date) => {
    if (!isInitialized) {
      const initialized = await initializeAlarms();
      if (!initialized) return false;
    }

    try {
      if (!routine.alarmTime) return true;

      const [hours, minutes] = routine.alarmTime.split(':').map(Number);
      const currentDate = new Date(startDate);
      const end = endDate ? new Date(endDate) : new Date();
      end.setDate(end.getDate() + 30); // 최대 30일 후까지

      let successCount = 0;
      let failCount = 0;

      while (currentDate <= end) {
        // 해당 날짜에 루틴이 실행되어야 하는지 확인
        const shouldRun = shouldRunOnDate(routine, currentDate);

        if (shouldRun) {
          const alarmDate = new Date(currentDate);
          alarmDate.setHours(hours, minutes, 0, 0);

          // 과거 시간이면 건너뛰기
          if (alarmDate > new Date()) {
            const alarmId = `routine_${routine.id}_${currentDate.toISOString().split('T')[0]}`;

            await Notifications.scheduleNotificationAsync({
              identifier: alarmId,
              content: {
                title: '루틴 알림',
                body: `"${routine.name}" 루틴을 시작할 시간입니다!`,
                data: {
                  routineId: routine.id,
                  routineName: routine.name,
                  type: 'routine_alarm',
                },
              },
              trigger: { date: alarmDate } as any,
            });
            successCount++;
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      console.log(
        `반복 알람 설정 완료: ${routine.name} - ${successCount}개 성공, ${failCount}개 실패`,
      );
      return true;
    } catch (error) {
      console.error('반복 알람 설정 실패:', error);
      return false;
    }
  };

  // 모든 알람 조회
  const getAllAlarms = async () => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      return scheduledNotifications.filter(
        (notification) => notification.content.data?.type === 'routine_alarm',
      );
    } catch (error) {
      console.error('알람 조회 실패:', error);
      return [];
    }
  };

  // 특정 루틴의 알람 조회
  const getRoutineAlarms = async (routineId: string) => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      return scheduledNotifications.filter(
        (notification) => notification.content.data?.routineId === routineId,
      );
    } catch (error) {
      console.error('루틴 알람 조회 실패:', error);
      return [];
    }
  };

  // 모든 알람 취소
  const cancelAllAlarms = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('모든 알람 취소 완료');
      return true;
    } catch (error) {
      console.error('모든 알람 취소 실패:', error);
      return false;
    }
  };

  return {
    isInitialized,
    initializeAlarms,
    scheduleAlarm,
    scheduleRecurringAlarm,
    cancelAlarm,
    getAllAlarms,
    getRoutineAlarms,
    cancelAllAlarms,
  };
};

// 루틴이 특정 날짜에 실행되어야 하는지 확인하는 함수
const shouldRunOnDate = (routine: RoutineType, date: Date): boolean => {
  const routineStartDate = new Date(routine.createdAt);
  const targetDate = new Date(date);

  // 루틴 시작일 이전이면 false
  if (targetDate < routineStartDate) return false;

  // 반복 설정에 따른 확인
  switch (routine.repeatCycle) {
    case '없음':
      return isSameDay(targetDate, routineStartDate);

    case '매일':
      return true;

    default:
      // 복잡한 반복 패턴은 utils.ts의 shouldRunOnDate 함수 사용
      // 여기서는 기본적인 패턴만 처리
      if (routine.repeatCycle.startsWith('매주')) {
        const weekday = routine.repeatCycle.split(' ')[1];
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        const targetWeekday = weekdays[targetDate.getDay()];
        return weekday === targetWeekday;
      }

      if (routine.repeatCycle.startsWith('매달')) {
        const day = parseInt(routine.repeatCycle.split(' ')[1]);
        return targetDate.getDate() === day;
      }

      return false;
  }
};

// 두 날짜가 같은 날인지 확인
const isSameDay = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};
