/**
 * 일기 스타일 설정 관련 상수들
 *
 * 일기 작성 시 사용할 수 있는 스타일 옵션들을 정의합니다.
 */

/**
 * 사용 가능한 폰트 크기 옵션
 */
export const FONT_SIZE_OPTIONS = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40] as const;

/**
 * 사용 가능한 폰트 패밀리 옵션
 */
export const FONT_FAMILY_OPTIONS = [
  { value: 'default', label: '기본' },
  { value: 'System', label: '시스템' },
  { value: 'Georgia', label: '조지아' },
  { value: 'Times New Roman', label: '타임즈' },
  { value: 'Courier New', label: '쿠리어' },
  { value: 'Helvetica', label: '헬베티카' },
  { value: 'Arial', label: '아리얼' },
] as const;

/**
 * 언어별 폰트 패밀리 옵션 가져오기
 */
export const getFontFamilyOptions = (isEnglish: boolean) =>
  [
    { value: 'default', label: isEnglish ? 'Default' : '기본' },
    { value: 'System', label: isEnglish ? 'System' : '시스템' },
    { value: 'Georgia', label: isEnglish ? 'Georgia' : '조지아' },
    { value: 'Times New Roman', label: isEnglish ? 'Times' : '타임즈' },
    { value: 'Courier New', label: isEnglish ? 'Courier' : '쿠리어' },
    { value: 'Helvetica', label: isEnglish ? 'Helvetica' : '헬베티카' },
    { value: 'Arial', label: isEnglish ? 'Arial' : '아리얼' },
  ] as const;

/**
 * 텍스트 정렬 옵션
 */
export const TEXT_ALIGN_OPTIONS: Array<'left' | 'center' | 'right'> = ['left', 'center', 'right'];

/**
 * 텍스트 정렬 옵션의 한국어 라벨
 */
export const TEXT_ALIGN_LABELS: Record<'left' | 'center' | 'right', string> = {
  left: '왼쪽',
  center: '가운데',
  right: '오른쪽',
} as const;

/**
 * 언어별 텍스트 정렬 라벨 가져오기
 */
export const getTextAlignLabels = (
  isEnglish: boolean,
): Record<'left' | 'center' | 'right', string> => ({
  left: isEnglish ? 'Left' : '왼쪽',
  center: isEnglish ? 'Center' : '가운데',
  right: isEnglish ? 'Right' : '오른쪽',
});

/**
 * 사용 가능한 텍스트 색상 옵션
 */
export const TEXT_COLOR_OPTIONS = [
  '#000000', // 검정
  '#333333', // 진한 회색
  '#666666', // 회색
  '#2563EB', // 파란색
  '#DC2626', // 빨간색
  '#059669', // 초록색
  '#7C2D12', // 갈색
  '#7C3AED', // 보라색
  '#BE185D', // 분홍색
  '#EA580C', // 주황색
] as const;

/**
 * 사용 가능한 배경색 옵션
 */
export const BACKGROUND_COLOR_OPTIONS = [
  '#FFFFFF', // 화이트
  '#F8FAFC', // 연한 회색
  '#F1F5F9', // 슬레이트
  '#F0F9FF', // 연한 파랑
  '#ECFDF5', // 연한 초록
  '#FEFCE8', // 연한 노랑
  '#FEF2F2', // 연한 빨강
  '#FAF5FF', // 연한 보라
  '#FDF2F8', // 연한 핑크
  '#F5F7FF', // 연한 블루
  '#BDC7FF', // 연한 퍼플-블루
  '#C9EFEF', // 연한 터키석
  '#FFD7DD', // 연한 핑크
  '#E0E7FF', // 인디고
  '#DBEAFE', // 하늘
  // 다크모드용 어두운 색상들
  '#1F2937', // 다크 그레이
  '#111827', // 진한 다크 그레이
  '#374151', // 회색
  '#1E3A8A', // 다크 블루
  '#064E3B', // 다크 그린
  '#92400E', // 다크 옐로우
  '#991B1B', // 다크 레드
  '#581C87', // 다크 퍼플
  '#9D174D', // 다크 핑크
] as const;

/**
 * 기본 스타일 설정
 */
export const DEFAULT_DIARY_STYLE = {
  fontFamily: 'default',
  fontSize: 16,
  textAlign: 'left' as const,
  textColor: '#000000',
  backgroundColor: '#FFFFFF',
} as const;

/**
 * 다크모드용 기본 스타일 설정
 */
export const DEFAULT_DARK_DIARY_STYLE = {
  fontFamily: 'default',
  fontSize: 16,
  textAlign: 'left' as const,
  textColor: '#FFFFFF',
  backgroundColor: '#1F2937',
} as const;

/**
 * 테마에 따른 기본 스타일 가져오기
 */
export const getDefaultDiaryStyle = (isDark: boolean) => {
  return isDark ? DEFAULT_DARK_DIARY_STYLE : DEFAULT_DIARY_STYLE;
};
