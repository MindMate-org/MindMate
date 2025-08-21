import { notificationService } from '../../../lib/notification-service';
import type { ScheduleType } from '../types/schedule-types';

// 일정 알림 훅 (새로운 통합 시스템 사용)
export const useScheduleAlarm = () => {
  // 일정 알림 설정
  const scheduleAlarm = async (schedule: ScheduleType): Promise<boolean> => {
    try {
      // 일정 시간을 Date 객체로 변환
      const scheduleDateTime = new Date(schedule.time);
      const now = new Date();

      // 과거 시간이면 알림 설정하지 않음
      if (scheduleDateTime <= now) {
        return true; // 과거 시간도 정상 처리로 간주
      }

      // 통합 알림 서비스 사용
      const success = await notificationService.scheduleNotification(
        schedule.id.toString(),
        'schedule',
        '일정 알림',
        `"${schedule.title}" 일정이 시작됩니다!`,
        scheduleDateTime,
        false // 일정은 일회성 알림
      );

      if (success) {
        console.log(`✅ 일정 알림 설정 완료: ${schedule.title} - ${scheduleDateTime.toLocaleString('ko-KR')}`);
      } else {
        }

      return success;
    } catch (error) {
      return false;
    }
  };

  // 일정 알림 취소
  const cancelAlarm = async (scheduleId: number): Promise<boolean> => {
    try {
      const success = await notificationService.cancelNotification(scheduleId.toString(), 'schedule');
      
      if (success) {
        } else {
        }

      return success;
    } catch (error) {
      return false;
    }
  };

  // 특정 일정의 알림 조회
  const getScheduleAlarms = async (scheduleId: number) => {
    try {
      return await notificationService.getScheduledNotifications(scheduleId.toString(), 'schedule');
    } catch (error) {
      return [];
    }
  };

  // 모든 일정 알림 취소
  const cancelAllScheduleAlarms = async (): Promise<boolean> => {
    try {
      // 모든 일정 알림 조회 후 취소
      const allScheduleAlarms = await notificationService.getScheduledNotifications(undefined, 'schedule');
      
      let successCount = 0;
      for (const alarm of allScheduleAlarms) {
        const scheduleId = alarm.content.data?.itemId;
        if (scheduleId) {
          const success = await notificationService.cancelNotification(String(scheduleId), 'schedule');
          if (success) successCount++;
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  // 알림 서비스 초기화
  const initializeAlarms = async (): Promise<boolean> => {
    return await notificationService.initialize();
  };

  return {
    scheduleAlarm,
    cancelAlarm,
    getScheduleAlarms,
    cancelAllScheduleAlarms,
    initializeAlarms,
    isInitialized: true, // 새 시스템에서는 항상 초기화됨
  };
};