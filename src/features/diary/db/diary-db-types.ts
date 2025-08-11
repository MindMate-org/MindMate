/**
 * 일기 DB 관련 타입 정의 (코드 컨벤션 적용)
 */

/**
 * 일기 테이블 스키마 타입
 */
export type DiaryTableType = {
  /** 일기 ID */
  id: number;
  /** 제목 */
  title: string | null;
  /** 내용 */
  body: string | null;
  /** 폰트 패밀리 */
  font: string | null;
  /** 폰트 크기 */
  font_size: number | null;
  /** 텍스트 정렬 */
  text_align: string | null;
  /** 텍스트 색상 */
  text_color: string | null;
  /** 배경 색상 */
  background_color: string | null;
  /** 오디오 파일 URI */
  audio_uri: string | null;
  /** 기분/감정 */
  mood: string | null;
  /** 생성 일시 */
  created_at: string | null;
  /** 수정 일시 */
  updated_at: string | null;
  /** 삭제 일시 */
  deleted_at: string | null;
  /** 북마크 여부 */
  is_favorite: number | null;
};

/**
 * 미디어 테이블 스키마 타입 (공용)
 */
export type MediaTableType = {
  /** 미디어 ID */
  id: number;
  /** 소유자 타입 */
  owner_type: string;
  /** 소유자 ID */
  owner_id: number;
  /** 미디어 타입 */
  media_type: string;
  /** 파일 경로 */
  file_path: string;
  /** 생성 일시 */
  created_at: string;
};

/**
 * 일기 생성 DB 요청 타입
 */
export type DiaryCreateDbPayloadType = {
  /** 제목 */
  title: string;
  /** 내용 */
  body: string;
  /** 폰트 패밀리 */
  font: string;
  /** 폰트 크기 */
  fontSize: number;
  /** 텍스트 정렬 */
  textAlign: string;
  /** 텍스트 색상 */
  textColor?: string;
  /** 배경 색상 */
  backgroundColor?: string;
  /** 오디오 파일 URI */
  audioUri?: string;
  /** 기분/감정 */
  mood?: string;
};

/**
 * 일기 업데이트 DB 요청 타입
 */
export type DiaryUpdateDbPayloadType = Partial<DiaryCreateDbPayloadType> & {
  /** 일기 ID */
  id: number;
  /** 수정 일시 */
  updatedAt?: string;
};

/**
 * 미디어 생성 DB 요청 타입
 */
export type MediaCreateDbPayloadType = {
  /** 소유자 타입 */
  owner_type: 'diary';
  /** 소유자 ID (일기 ID) */
  owner_id: number;
  /** 미디어 타입 */
  media_type: 'image' | 'video' | 'audio';
  /** 파일 경로 */
  file_path: string;
};

/**
 * 일기 조회 결과 타입 (미디어 포함)
 */
export type DiaryWithMediaType = DiaryTableType & {
  /** 첨부된 미디어 목록 */
  media: MediaTableType[];
};

/**
 * 일기 검색 필터 DB 타입
 */
export type DiarySearchDbFilterType = {
  /** 시작 날짜 */
  startDate?: string;
  /** 종료 날짜 */
  endDate?: string;
  /** 기분 필터 */
  mood?: string;
  /** 미디어 포함 여부 */
  hasMedia?: boolean;
  /** 검색 키워드 */
  keyword?: string;
  /** 정렬 순서 */
  orderBy?: 'created_at' | 'updated_at' | 'title';
  /** 정렬 방향 */
  orderDirection?: 'ASC' | 'DESC';
  /** 페이지 크기 */
  limit?: number;
  /** 오프셋 */
  offset?: number;
};
