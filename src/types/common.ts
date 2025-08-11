/**
 * 공통 타입 정의
 * @description 앱 전체에서 사용되는 공통 타입들을 정의합니다.
 */

// Base Entity 타입
export interface BaseEntityType {
  id: number;
  created_at: string;
  updated_at: string;
}

// Soft Delete 지원 Entity 타입
export interface SoftDeleteEntityType extends BaseEntityType {
  deleted_at?: string | null;
}

// 페이지네이션 타입
export interface PaginationType {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 정렬 타입
export interface SortType {
  field: string;
  order: 'asc' | 'desc';
}

// 필터 타입
export interface FilterType {
  keyword?: string;
  dateFrom?: string;
  dateTo?: string;
}

// API 응답 타입
export interface ApiResponseType<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 로딩 상태 타입
export interface LoadingStateType {
  isLoading: boolean;
  error: string | null;
  lastUpdated?: number;
}

// 컴포넌트 공통 Props 타입
export interface CommonComponentPropsType {
  className?: string;
  testID?: string;
  accessibilityLabel?: string;
}

// 이벤트 핸들러 타입
export type EventHandlerType<T = void> = () => T;
export type EventHandlerWithParamType<P, T = void> = (param: P) => T;

// 색상 타입
export type ColorType = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

// 크기 타입
export type SizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// 테마 타입
export type ThemeType = 'light' | 'dark';

// 언어 타입
export type LanguageType = 'ko' | 'en';

// 알림 타입
export interface NotificationType {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: number;
  duration?: number;
  action?: {
    label: string;
    onPress: EventHandlerType;
  };
}

// 날짜 범위 타입
export interface DateRangeType {
  startDate: string;
  endDate: string;
}

// 검색 결과 타입
export interface SearchResultType<T> {
  items: T[];
  query: string;
  total: number;
  searchTime: number;
}

// 유효성 검사 결과 타입
export interface ValidationResultType {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// 업로드 상태 타입
export interface UploadStateType {
  isUploading: boolean;
  progress: number;
  error?: string;
}

// 모달 Props 타입
export interface ModalPropsType extends CommonComponentPropsType {
  visible: boolean;
  onClose: EventHandlerType;
  title?: string;
  description?: string;
  showCloseButton?: boolean;
}

// 리스트 아이템 Props 타입
export interface ListItemPropsType<T = unknown> extends CommonComponentPropsType {
  data: T;
  onPress?: EventHandlerWithParamType<T>;
  onLongPress?: EventHandlerWithParamType<T>;
  selected?: boolean;
  disabled?: boolean;
}

// 폼 필드 Props 타입
export interface FormFieldPropsType extends CommonComponentPropsType {
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

// 카드 Props 타입
export interface CardPropsType extends CommonComponentPropsType {
  title?: string;
  subtitle?: string;
  onPress?: EventHandlerType;
  elevation?: number;
  variant?: 'default' | 'outlined' | 'filled';
}
