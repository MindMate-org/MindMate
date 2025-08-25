import { Audio } from 'expo-av';
import { z } from 'zod';

/**
 * 일기에서 사용할 수 있는 기분 상태 타입
 *
 * 5단계의 기분을 나타내며, 각각 고유한 이모지와 라벨을 가집니다.
 *
 * @example
 * ```typescript
 * const mood: MoodType = 'happy';
 * ```
 */
export type MoodType = 'very-happy' | 'happy' | 'neutral' | 'sad' | 'very-sad';

/**
 * 기분 옵션 정보를 담는 타입
 *
 * UI에서 기분을 표시할 때 필요한 모든 정보를 포함합니다.
 */
export type MoodOptionType = {
  /** 기분 값 */
  value: MoodType;
  /** 표시할 이모지 */
  emoji: string;
  /** 기분 이름 */
  label: string;
  /** 기분에 대한 설명 */
  description: string;
};

/**
 * 사용 가능한 모든 기분 옵션들 (기본 - 하위 호환성)
 *
 * UI에서 기분 선택 목록을 렌더링할 때 사용됩니다.
 * 각 옵션은 이모지, 라벨, 설명을 포함합니다.
 *
 * @readonly
 * @deprecated Use getMoodOptions() instead for i18n support
 */
export const MOOD_OPTIONS: MoodOptionType[] = [
  {
    value: 'very-happy',
    emoji: '😊',
    label: '매우 행복해요',
    description: '정말 기분이 좋고 행복한 하루',
  },
  {
    value: 'happy',
    emoji: '🙂',
    label: '행복해요',
    description: '기분이 좋고 즐거운 하루',
  },
  {
    value: 'neutral',
    emoji: '😐',
    label: '보통이에요',
    description: '평범하고 무난한 하루',
  },
  {
    value: 'sad',
    emoji: '😞',
    label: '슬퍼요',
    description: '마음이 아프고 우울한 기분',
  },
  {
    value: 'very-sad',
    emoji: '😠',
    label: '매우 슬퍼요',
    description: '힘들고 어려운 하루',
  },
];

/**
 * 언어별 기분 옵션을 반환하는 함수
 * @param locale 언어 코드 ('ko' | 'en')
 * @returns 해당 언어의 기분 옵션 배열
 */
export const getMoodOptions = (locale: string = 'ko'): MoodOptionType[] => {
  const isEnglish = locale.startsWith('en');

  return [
    {
      value: 'very-happy',
      emoji: '😊',
      label: isEnglish ? 'Very Happy' : '매우 행복해요',
      description: isEnglish ? 'Really good and happy day' : '정말 기분이 좋고 행복한 하루',
    },
    {
      value: 'happy',
      emoji: '🙂',
      label: isEnglish ? 'Happy' : '행복해요',
      description: isEnglish ? 'Good and pleasant day' : '기분이 좋고 즐거운 하루',
    },
    {
      value: 'neutral',
      emoji: '😐',
      label: isEnglish ? 'Neutral' : '보통이에요',
      description: isEnglish ? 'Ordinary and normal day' : '평범하고 무난한 하루',
    },
    {
      value: 'sad',
      emoji: '😞',
      label: isEnglish ? 'Sad' : '슬퍼요',
      description: isEnglish ? 'Feeling down and blue' : '마음이 아프고 우울한 기분',
    },
    {
      value: 'very-sad',
      emoji: '😠',
      label: isEnglish ? 'Very Sad' : '매우 슬퍼요',
      description: isEnglish ? 'Difficult and challenging day' : '힘들고 어려운 하루',
    },
  ];
};

/**
 * 일기 텍스트 스타일 설정 타입
 *
 * 일기 작성 시 텍스트의 모양과 배경을 커스터마이징하기 위한 설정들입니다.
 */
export type DiaryStyleType = {
  /** 폰트 연및 (CSS font-family 값) */
  fontFamily: string;
  /** 폰트 크기 (px 단위) */
  fontSize: number;
  /** 텍스트 정렬 */
  textAlign: 'left' | 'center' | 'right';
  /** 텍스트 색상 (HEX 형식) */
  textColor: string;
  /** 배경 색상 (HEX 형식) */
  backgroundColor: string;
};

/**
 * 일기에 체부된 미디어 파일 정보 타입
 *
 * 이미지, 비디오, 음성 파일의 정보를 담습니다.
 */
export type DiaryMediaType = {
  /** 미디어 고유 ID */
  id: string;
  /** 미디어 타입 */
  type: 'image' | 'video' | 'audio';
  /** 파일 경로 */
  uri: string;
  /** 음성/비디오의 재생 시간 (초 단위, 선택사항) */
  duration?: number;
  /** 오디오 파일명 (선택사항) */
  name?: string;
};

/**
 * 음성 녹음 상태 정보 타입
 *
 * 음성 녹음 기능의 현재 상태와 정보를 관리합니다.
 */
export type RecordingStateType = {
  /** 현재 녹음 중인지 여부 */
  isRecording: boolean;
  /** 녹음 진행 시간 (초 단위) */
  duration: number;
  /** 녹음 시작 시각 (선택사항) */
  startTime?: Date;
  /** Expo Audio Recording 인스턴스 (선택사항) */
  recording?: Audio.Recording;
};

/**
 * 일기 작성 폼의 유효성 검사 스키마
 *
 * Zod를 사용하여 React Hook Form에서 사용할 수 있는 유효성 검사 규칙을 정의합니다.
 *
 * @example
 * ```typescript
 * import { zodResolver } from '@hookform/resolvers/zod';
 *
 * const form = useForm<DiaryFormDataType>({
 *   resolver: zodResolver(diaryFormSchema),
 *   defaultValues: { ... }
 * });
 * ```
 */
export const diaryFormSchema = z.object({
  /** 일기 제목 (필수, 최소 1글자) */
  title: z.string().min(1, '제목을 입력해주세요'),
  /** 일기 내용 (필수, 최소 1글자) */
  content: z.string().min(1, '내용을 입력해주세요'),
  /** 오늘의 기분 (필수) */
  mood: z.enum(['very-happy', 'happy', 'neutral', 'sad', 'very-sad'], {
    required_error: '오늘의 기분을 선택해주세요',
    invalid_type_error: '오늘의 기분을 선택해주세요',
  }),
  /** 체부할 미디어 파일 목록 */
  media: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['image', 'video', 'audio']),
      uri: z.string(),
      duration: z.number().optional(),
    }),
  ),
  /** 텍스트 스타일 설정 */
  style: z.object({
    fontFamily: z.string(),
    fontSize: z.number(),
    textAlign: z.enum(['left', 'center', 'right']),
    textColor: z.string(),
    backgroundColor: z.string(),
  }),
});

/**
 * 일기 작성 폼에서 사용하는 데이터 타입
 *
 * diaryFormSchema에서 자동으로 추론되는 TypeScript 타입입니다.
 * React Hook Form과 Zod 유효성 검사에서 함께 사용됩니다.
 *
 * @example
 * ```typescript
 * const onSubmit = (data: DiaryFormDataType) => {
 *   * };
 * ```
 */
export type DiaryFormDataType = z.infer<typeof diaryFormSchema>;
