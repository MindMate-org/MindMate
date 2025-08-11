/**
 * 루틴 관련 유틸리티 함수들
 */

import { RepeatCycleType, RepeatCycleDetail, WeekOrderType, WeekdayType } from './types';

/**
 * 반복 설정 문자열을 파싱하는 함수
 * @param cycle - 파싱할 반복 설정 문자열
 * @returns 파싱된 반복 설정 상세 정보 또는 null
 */
export const parseRepeatCycle = (cycle: string): RepeatCycleDetail | null => {
  // 앞뒤 공백 제거
  const trimmedCycle = cycle.trim();

  // 매일
  if (trimmedCycle === '매일') {
    return { type: 'daily', value: {} };
  }

  // X일마다
  if (trimmedCycle.endsWith('일마다')) {
    const intervalStr = trimmedCycle.replace('일마다', '');
    const interval = parseInt(intervalStr);
    if (!isNaN(interval) && interval > 0) {
      return {
        type: 'interval',
        value: { interval },
      };
    }
  }

  // 매주 요일
  if (trimmedCycle.startsWith('매주 ')) {
    const weekday = trimmedCycle.replace('매주 ', '');
    const weekdays = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
    if (weekdays.includes(weekday)) {
      return {
        type: 'weekly',
        value: { weekday: weekday.replace('요일', '') as WeekdayType },
      };
    }
  }

  // 매달 X일
  if (trimmedCycle.startsWith('매달 ') && trimmedCycle.endsWith('일')) {
    const dayStr = trimmedCycle.replace('매달 ', '').replace('일', '');
    const day = parseInt(dayStr);
    if (!isNaN(day) && day >= 1 && day <= 31) {
      return {
        type: 'monthly',
        value: { day },
      };
    }
  }

  // 매달 X번째주 요일
  if (trimmedCycle.startsWith('매달 ')) {
    const weekOrders = ['첫째주', '둘째주', '셋째주', '넷째주', '마지막주'];
    const weekdays = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];

    for (const weekOrder of weekOrders) {
      if (trimmedCycle.includes(weekOrder + ' ')) {
        const parts = trimmedCycle.replace('매달 ', '').split(' ');
        if (parts.length === 2 && parts[0] === weekOrder && weekdays.includes(parts[1])) {
          return {
            type: 'monthlyWeek',
            value: {
              weekOrder: weekOrder as WeekOrderType,
              weekday: parts[1].replace('요일', '') as WeekdayType,
            },
          };
        }
      }
    }
  }

  return null; // 파싱 실패
};

/**
 * 반복 설정 상세 정보를 문자열로 변환하는 함수
 * @param detail - 변환할 반복 설정 상세 정보
 * @returns 반복 설정 문자열
 */
export const formatRepeatCycle = (detail: RepeatCycleDetail): RepeatCycleType => {
  switch (detail.type) {
    case 'daily':
      return '매일';
    case 'interval':
      return `${detail.value.interval}일마다` as RepeatCycleType;
    case 'weekly':
      return `매주 ${detail.value.weekday}` as RepeatCycleType;
    case 'monthly':
      return `매달 ${detail.value.day}일` as RepeatCycleType;
    case 'monthlyWeek':
      return `매달 ${detail.value.weekOrder} ${detail.value.weekday}` as RepeatCycleType;
    default:
      throw new Error('Invalid repeat cycle detail');
  }
};


/**
 * 특정 날짜에 루틴이 실행되어야 하는지 확인하는 함수
 * @param routine - 루틴 정보 (생성 날짜 포함)
 * @param targetDate - 확인할 날짜 (Date 객체)
 * @returns 해당 날짜에 루틴이 실행되어야 하면 true
 */
export const shouldRunOnDate = (
  routine: { id: string; name: string; repeatCycle: RepeatCycleType; createdAt: string },
  targetDate: Date,
): boolean => {
  const detail = parseRepeatCycle(routine.repeatCycle);

  if (!detail) {
    return false;
  }

  // 'YYYY-MM-DD' 문자열로만 비교
  const createdStr = routine.createdAt.slice(0, 10);
  const targetStr = [
    targetDate.getFullYear(),
    (targetDate.getMonth() + 1).toString().padStart(2, '0'),
    targetDate.getDate().toString().padStart(2, '0'),
  ].join('-');

  // 생성일 이전은 무조건 false
  if (targetStr < createdStr) return false;

  // 반복 조건에 따라 정확히 판단
  switch (detail.type) {
    case 'daily':
      return true;
    case 'interval': {
      // daysDiff 계산도 문자열로만
      const created = new Date(createdStr + 'T00:00:00');
      const target = new Date(targetStr + 'T00:00:00');
      const daysDiff = Math.floor((target.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff % (detail.value.interval || 1) === 0;
    }
    case 'weekly': {
      const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
      const targetWeekday = weekdays[new Date(targetStr + 'T00:00:00').getDay()];
      return targetWeekday === detail.value.weekday;
    }
    case 'monthly': {
      const targetDay = new Date(targetStr + 'T00:00:00').getDate();

      // 날짜가 다르면 false
      if (targetDay !== detail.value.day) {
        return false;
      }

      // 생성일과 같은 월이면 true (생성일 이후의 해당 날짜)
      const createdDate = new Date(createdStr + 'T00:00:00');
      const targetDate = new Date(targetStr + 'T00:00:00');

      // 같은 년도, 같은 월이면 생성일 이후의 해당 날짜인지 확인
      if (
        createdDate.getFullYear() === targetDate.getFullYear() &&
        createdDate.getMonth() === targetDate.getMonth()
      ) {
        return targetDate.getDate() >= createdDate.getDate();
      }

      // 다른 월이면 생성일 이후의 월인지 확인
      return targetDate > createdDate;
    }
    case 'monthlyWeek': {
      // 기존 로직으로 해당 주차 요일인지 확인
      const date = new Date(targetStr + 'T00:00:00');
      const isCorrectWeekday = isNthWeekOfMonth(
        date,
        detail.value.weekOrder!,
        detail.value.weekday!,
      );

      if (!isCorrectWeekday) {
        return false;
      }

      // 생성일 이후의 해당 월인지 확인
      const createdDate = new Date(createdStr + 'T00:00:00');
      const targetDate = new Date(targetStr + 'T00:00:00');

      // 같은 년도, 같은 월이면 생성일 이후의 해당 날짜인지 확인
      if (
        createdDate.getFullYear() === targetDate.getFullYear() &&
        createdDate.getMonth() === targetDate.getMonth()
      ) {
        return targetDate.getDate() >= createdDate.getDate();
      }

      // 다른 월이면 생성일 이후의 월인지 확인
      return targetDate > createdDate;
    }
    default:
      return false;
  }
};

/**
 * 특정 월의 N번째 주 요일인지 확인하는 함수
 * @param date - 확인할 날짜
 * @param weekOrder - 주차 (첫째주, 둘째주, ...)
 * @param weekday - 요일
 * @returns 해당 주차의 요일이면 true
 */
const isNthWeekOfMonth = (date: Date, weekOrder: string, weekday: string): boolean => {
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const targetWeekdayIndex = weekdays.indexOf(weekday);

  // 해당 월의 첫 번째 해당 요일을 찾습니다
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstWeekday = firstDay.getDay();
  const daysToAdd = (targetWeekdayIndex - firstWeekday + 7) % 7;
  const firstOccurrence = new Date(date.getFullYear(), date.getMonth(), 1 + daysToAdd);

  // 주차에 따른 날짜 계산
  let targetDate: Date;
  switch (weekOrder) {
    case '첫째주':
      targetDate = firstOccurrence;
      break;
    case '둘째주':
      targetDate = new Date(firstOccurrence.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    case '셋째주':
      targetDate = new Date(firstOccurrence.getTime() + 14 * 24 * 60 * 60 * 1000);
      break;
    case '넷째주':
      targetDate = new Date(firstOccurrence.getTime() + 21 * 24 * 60 * 60 * 1000);
      break;
    case '마지막주':
      // 다음 달의 첫 번째 해당 요일에서 7일을 빼면 마지막 주
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      const nextMonthFirstWeekday = nextMonth.getDay();
      const nextMonthDaysToAdd = (targetWeekdayIndex - nextMonthFirstWeekday + 7) % 7;
      const nextMonthFirstOccurrence = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        1 + nextMonthDaysToAdd,
      );
      targetDate = new Date(nextMonthFirstOccurrence.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    default:
      return false;
  }

  return date.getDate() === targetDate.getDate();
};

/**
 * 반복 설정의 다음 실행 날짜를 계산하는 함수
 * @param routine - 루틴 정보
 * @param fromDate - 시작 날짜 (기본값: 오늘)
 * @returns 다음 실행 날짜
 */
export const getNextRunDate = (
  routine: { repeatCycle: RepeatCycleType; createdAt: string },
  fromDate: Date = new Date(),
): Date => {
  const detail = parseRepeatCycle(routine.repeatCycle);
  if (!detail) return fromDate;

  // createdAt과 fromDate를 YYYY-MM-DD 형식으로 비교
  const createdStr = routine.createdAt.slice(0, 10);
  const fromStr = [
    fromDate.getFullYear(),
    (fromDate.getMonth() + 1).toString().padStart(2, '0'),
    fromDate.getDate().toString().padStart(2, '0'),
  ].join('-');

  // fromDate가 createdAt과 같다면, 시작 날짜로 간주하고 fromDate 반환
  if (fromStr === createdStr) {
    return new Date(fromDate);
  }

  const result = new Date(fromDate);

  switch (detail.type) {
    case 'daily':
      result.setDate(result.getDate() + 1);
      break;

    case 'interval':
      if (detail.value.interval) {
        result.setDate(result.getDate() + detail.value.interval);
      }
      break;

    case 'weekly':
      if (detail.value.weekday) {
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        const targetWeekdayIndex = weekdays.indexOf(detail.value.weekday);
        const currentWeekdayIndex = result.getDay();
        let daysToAdd = (targetWeekdayIndex - currentWeekdayIndex + 7) % 7;
        if (daysToAdd === 0) daysToAdd = 7; // 같은 요일이면 다음 주로
        result.setDate(result.getDate() + daysToAdd);
      }
      break;

    case 'monthly':
      if (detail.value.day) {
        result.setMonth(result.getMonth() + 1);
        result.setDate(detail.value.day);
      }
      break;

    case 'monthlyWeek':
      if (detail.value.weekOrder && detail.value.weekday) {
        result.setMonth(result.getMonth() + 1);
        result.setDate(1);
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        const targetWeekdayIndex = weekdays.indexOf(detail.value.weekday);
        const firstWeekday = result.getDay();
        const daysToAdd = (targetWeekdayIndex - firstWeekday + 7) % 7;

        let targetDay = 1 + daysToAdd;
        switch (detail.value.weekOrder) {
          case '첫째주':
            break;
          case '둘째주':
            targetDay += 7;
            break;
          case '셋째주':
            targetDay += 14;
            break;
          case '넷째주':
            targetDay += 21;
            break;
          case '마지막주':
            targetDay += 28;
            break;
        }
        result.setDate(targetDay);
      }
      break;
  }

  return result;
};

/**
 * 반복 설정을 사용자 친화적인 텍스트로 변환하는 함수
 * @param repeatCycle - 반복 설정
 * @returns 사용자 친화적인 설명
 */
export const getRepeatCycleDescription = (repeatCycle: RepeatCycleType): string => {
  const detail = parseRepeatCycle(repeatCycle);
  if (!detail) return '반복 설정 없음';

  switch (detail.type) {
    case 'daily':
      return '매일 반복';
    case 'interval':
      return `${detail.value.interval}일마다 반복`;
    case 'weekly':
      return `매주 ${detail.value.weekday}요일 반복`;
    case 'monthly':
      return `매달 ${detail.value.day}일 반복`;
    case 'monthlyWeek':
      return `매달 ${detail.value.weekOrder} ${detail.value.weekday}요일 반복`;
    default:
      return '알 수 없는 반복 설정';
  }
};
