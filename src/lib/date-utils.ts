/**
 * 통합된 날짜/시간 포맷팅 유틸리티
 */

export type DateFormat = 'full' | 'date' | 'time' | 'short' | 'relative';
export type TimeFormat = '12h' | '24h';

const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * 시간을 포맷팅하는 헬퍼 함수
 * @param date - Date 객체
 * @param format - 시간 형식 (12h | 24h)
 * @returns 포맷팅된 시간 문자열
 */
export const formatTime = (date: Date, format: TimeFormat = '12h'): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');

  if (format === '24h') {
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  const period = hours >= 12 ? '오후' : '오전';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${period} ${displayHours}:${minutes}`;
};

/**
 * 날짜를 포맷팅하는 헬퍼 함수
 * @param date - Date 객체
 * @returns 포맷팅된 날짜 문자열
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = WEEKDAYS_KO[date.getDay()];

  return `${year}년 ${month}월 ${day}일 ${weekday}요일`;
};

/**
 * 상대적 시간을 포맷팅하는 헬퍼 함수
 * @param date - Date 객체
 * @returns 상대적 시간 문자열 (예: "방금 전", "3시간 전", "2일 전")
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return '방금 전';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}일 전`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}개월 전`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}년 전`;
};

/**
 * 통합된 날짜/시간 포맷팅 함수
 * @param input - Date 객체, ISO 문자열, 또는 현재 시간 사용 (undefined)
 * @param formatType - 포맷 타입
 * @param timeFormat - 시간 형식 (12h | 24h)
 * @returns 포맷팅된 문자열
 */
export const formatDateTime = (
  input?: Date | string,
  formatType: DateFormat = 'full',
  timeFormat: TimeFormat = '12h',
): string => {
  const date = input ? (typeof input === 'string' ? new Date(input) : input) : new Date();

  switch (formatType) {
    case 'full':
      return `${formatDate(date)} ${formatTime(date, timeFormat)}`;
    case 'date':
      return formatDate(date);
    case 'time':
      return formatTime(date, timeFormat);
    case 'short':
      return `${date.getMonth() + 1}.${date.getDate()} ${formatTime(date, timeFormat)}`;
    case 'relative':
      return formatRelativeTime(date);
    default:
      return `${formatDate(date)} ${formatTime(date, timeFormat)}`;
  }
};

/**
 * 날짜 문자열을 포맷팅 (하위 호환성 유지)
 * @param datetime - ISO 날짜 문자열
 * @returns 포맷팅된 날짜 시간 문자열
 */
export const formatDateTimeString = (datetime: string): string => {
  return formatDateTime(datetime, 'full', '12h');
};

/**
 * KST(UTC+9) 기준 날짜 문자열로 변환
 * @param date - Date 객체 (기본값: 현재 시간)
 * @returns YYYY-MM-DD 형식 문자열
 */
export const toKSTDateString = (date: Date = new Date()): string => {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
};

/**
 * 두 날짜가 같은 날인지 확인
 * @param date1 - 첫 번째 날짜
 * @param date2 - 두 번째 날짜
 * @returns 같은 날이면 true
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * 날짜가 오늘인지 확인
 * @param date - 확인할 날짜
 * @returns 오늘이면 true
 */
export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};
