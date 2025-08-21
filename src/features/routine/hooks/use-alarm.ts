// 일정 알림 기능을 사용하도록 임포트
import { useScheduleAlarm } from '../../schedule/hooks/use-schedule-alarm';
import { RoutineType } from '../types';

// 알람 설정 타입 (호환성을 위해 유지)
export type AlarmSchedule = {
  id: string;
  routineId: string;
  routineName: string;
  time: string; // HH:mm 형식
  repeatCycle: string;
  isEnabled: boolean;
};

// 루틴 알람 훅 (일정 알림 시스템 사용)
export const useAlarm = () => {
  const scheduleAlarmHook = useScheduleAlarm();

  // 루틴 알림 설정 (일정 형태로 변환)
  const scheduleRoutineAlarm = async (routine: RoutineType): Promise<boolean> => {
    if (!routine.alarmTime) {
      console.log('⚠️ 알림 시간이 설정되지 않은 루틴:', routine.name);
      return true; // 알림 시간이 없는 것은 정상 상황
    }

    try {
      // 알림 시간 파싱
      const [hours, minutes] = routine.alarmTime.split(':').map(Number);
      
      // 오늘 날짜로 알림 시간 설정
      const now = new Date();
      const alarmTime = new Date();
      alarmTime.setHours(hours, minutes, 0, 0);

      // 이미 지난 시간이면 내일로 설정
      if (alarmTime <= now) {
        alarmTime.setDate(alarmTime.getDate() + 1);
      }

      // 루틴을 일정 형태로 변환하여 일정 알림 시스템 사용
      const scheduleFormat = {
        id: routine.id,
        title: `루틴: ${routine.name}`,
        time: alarmTime.toISOString(),
        content: `"${routine.name}" 루틴을 시작할 시간입니다!`,
        category: 'routine' as any,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const success = await scheduleAlarmHook.scheduleAlarm(scheduleFormat);

      if (success) {
        console.log(`✅ 루틴 알림 설정 완료 (일정 시스템 사용): ${routine.name} - ${alarmTime.toLocaleString('ko-KR')}`);
      } else {
        console.error(`❌ 루틴 알림 설정 실패: ${routine.name}`);
      }

      return success;
    } catch (error) {
      console.error('❌ 루틴 알림 설정 중 오류:', error);
      return false;
    }
  };

  // 루틴 알림 취소
  const cancelRoutineAlarm = async (routineId: string): Promise<boolean> => {
    try {
      const success = await scheduleAlarmHook.cancelAlarm(parseInt(routineId));
      
      if (success) {
        console.log(`✅ 루틴 알림 취소 완료 (일정 시스템 사용): ${routineId}`);
      } else {
        console.error(`❌ 루틴 알림 취소 실패: ${routineId}`);
      }

      return success;
    } catch (error) {
      console.error('❌ 루틴 알림 취소 중 오류:', error);
      return false;
    }
  };

  // 모든 루틴 알림 조회
  const getRoutineAlarms = async (routineId?: string) => {
    try {
      if (routineId) {
        return await scheduleAlarmHook.getScheduleAlarms(parseInt(routineId));
      } else {
        // 모든 루틴 관련 알림 조회는 일정 시스템을 통해
        return [];
      }
    } catch (error) {
      console.error('❌ 루틴 알림 조회 중 오류:', error);
      return [];
    }
  };

  // 알림 서비스 초기화
  const initializeAlarms = async (): Promise<boolean> => {
    return await scheduleAlarmHook.initializeAlarms();
  };

  return {
    scheduleRoutineAlarm,
    cancelRoutineAlarm,
    getRoutineAlarms,
    initializeAlarms,
    // 기존 함수들은 deprecated로 표시하되 호환성을 위해 유지
    scheduleAlarm: scheduleRoutineAlarm,
    cancelAlarm: cancelRoutineAlarm,
    getAllAlarms: () => getRoutineAlarms(),
    cancelAllAlarms: () => scheduleAlarmHook.cancelAllScheduleAlarms(),
    isInitialized: true, // 새 시스템에서는 항상 초기화됨
  };
};