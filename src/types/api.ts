/**
 * API 응답 및 요청에 대한 엄격한 타입 정의
 * - 런타임 타입 검증
 * - API 계약 명시
 * - 타입 안전성 보장
 */
import { z } from 'zod';

// ============================================================================
// 기본 API 응답 구조
// ============================================================================

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
      details: z.unknown().optional(),
    })
    .optional(),
  metadata: z
    .object({
      timestamp: z.string(),
      requestId: z.string().optional(),
    })
    .optional(),
});

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    timestamp: string;
    requestId?: string;
  };
};

// ============================================================================
// 데이터베이스 공통 필드
// ============================================================================

export const BaseEntitySchema = z.object({
  id: z.number().int().positive(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type BaseEntity = z.infer<typeof BaseEntitySchema>;

// ============================================================================
// Diary 관련 타입들
// ============================================================================

export const DiarySchema = BaseEntitySchema.extend({
  title: z.string().min(1, '제목은 필수입니다').max(100, '제목이 너무 깁니다'),
  content: z.string().min(1, '내용은 필수입니다').max(10000, '내용이 너무 깁니다'),
  mood: z.enum(['very_happy', 'happy', 'neutral', 'sad', 'very_sad']).optional(),
  weather: z.string().optional(),
  location: z.string().optional(),
  is_favorite: z.number().int().min(0).max(1).default(0),
  is_deleted: z.number().int().min(0).max(1).default(0),
  deleted_at: z.string().datetime().nullable().optional(),
  style: z
    .object({
      fontFamily: z.string(),
      fontSize: z.number().positive(),
      textAlign: z.enum(['left', 'center', 'right']),
      textColor: z.string(),
      backgroundColor: z.string(),
    })
    .optional(),
});

export const CreateDiarySchema = DiarySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateDiarySchema = CreateDiarySchema.partial();

export type Diary = z.infer<typeof DiarySchema>;
export type CreateDiaryData = z.infer<typeof CreateDiarySchema>;
export type UpdateDiaryData = z.infer<typeof UpdateDiarySchema>;

// ============================================================================
// Schedule 관련 타입들
// ============================================================================

export const ScheduleSchema = BaseEntitySchema.extend({
  title: z.string().min(1, '제목은 필수입니다').max(100),
  contents: z.string().max(1000).optional(),
  time: z.string().datetime(),
  location: z.string().max(200).optional(),
  companion: z.string().max(200).optional(),
  is_completed: z.number().int().min(0).max(1).default(0),
  reminder_time: z.string().datetime().optional(),
  repeat_pattern: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']).default('none'),
});

export const CreateScheduleSchema = ScheduleSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateScheduleSchema = CreateScheduleSchema.partial();

export type Schedule = z.infer<typeof ScheduleSchema>;
export type CreateScheduleData = z.infer<typeof CreateScheduleSchema>;
export type UpdateScheduleData = z.infer<typeof UpdateScheduleSchema>;

// ============================================================================
// AddressBook 관련 타입들
// ============================================================================

export const ContactTagSchema = BaseEntitySchema.extend({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, '올바른 색상 코드를 입력하세요'),
});

export const ContactSchema = BaseEntitySchema.extend({
  name: z.string().min(1, '이름은 필수입니다').max(100),
  phone_number: z.string().regex(/^[+]?[0-9\-\s()]{10,20}$/, '올바른 전화번호 형식을 입력하세요'),
  email: z.string().email('올바른 이메일 형식을 입력하세요').optional(),
  address: z.string().max(500).optional(),
  memo: z.string().max(1000).optional(),
  profile_image: z.string().url().optional().or(z.literal('')),
  is_self: z.number().int().min(0).max(1).default(0),
  birthday: z.string().datetime().optional(),
  company: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
});

export const CreateContactSchema = ContactSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateContactSchema = CreateContactSchema.partial();

export type ContactTag = z.infer<typeof ContactTagSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type CreateContactData = z.infer<typeof CreateContactSchema>;
export type UpdateContactData = z.infer<typeof UpdateContactSchema>;

// ============================================================================
// Search 관련 타입들
// ============================================================================

export const SearchItemSchema = BaseEntitySchema.extend({
  name: z.string().min(1, '물건 이름은 필수입니다').max(100),
  category: z.string().min(1, '카테고리는 필수입니다').max(50),
  location: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  image: z.string().url().optional(),
  purchase_date: z.string().datetime().optional(),
  purchase_price: z.number().positive().optional(),
  warranty_expiry: z.string().datetime().optional(),
  is_important: z.number().int().min(0).max(1).default(0),
});

export const CreateSearchItemSchema = SearchItemSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateSearchItemSchema = CreateSearchItemSchema.partial();

export type SearchItem = z.infer<typeof SearchItemSchema>;
export type CreateSearchItemData = z.infer<typeof CreateSearchItemSchema>;
export type UpdateSearchItemData = z.infer<typeof UpdateSearchItemSchema>;

// ============================================================================
// Routine 관련 타입들
// ============================================================================

export const RoutineTaskSchema = BaseEntitySchema.extend({
  routine_id: z.number().int().positive(),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  order: z.number().int().min(0),
  is_completed: z.number().int().min(0).max(1).default(0),
  completed_at: z.string().datetime().optional(),
});

export const RoutineSchema = BaseEntitySchema.extend({
  title: z.string().min(1, '루틴 제목은 필수입니다').max(100),
  description: z.string().max(500).optional(),
  start_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, '올바른 시간 형식(HH:MM)을 입력하세요'),
  end_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, '올바른 시간 형식(HH:MM)을 입력하세요'),
  repeat_days: z.string().regex(/^[0-6,]*$/, '올바른 요일 형식을 입력하세요'), // 0=일요일, 6=토요일
  is_active: z.number().int().min(0).max(1).default(1),
  notification_enabled: z.number().int().min(0).max(1).default(1),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
});

export const CreateRoutineSchema = RoutineSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateRoutineSchema = CreateRoutineSchema.partial();

export type RoutineTask = z.infer<typeof RoutineTaskSchema>;
export type Routine = z.infer<typeof RoutineSchema>;
export type CreateRoutineData = z.infer<typeof CreateRoutineSchema>;
export type UpdateRoutineData = z.infer<typeof UpdateRoutineSchema>;

// ============================================================================
// 유틸리티 타입들
// ============================================================================

// 페이지네이션
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).optional(),
});

export const PaginatedResponseSchema = z.object({
  data: z.array(z.unknown()),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

export type PaginationParams = z.infer<typeof PaginationSchema>;
export type PaginatedResponse<T = unknown> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

// 정렬 옵션
export const SortSchema = z.object({
  field: z.string(),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

export type SortParams = z.infer<typeof SortSchema>;

// 필터 옵션
export const FilterSchema = z.object({
  field: z.string(),
  operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'like', 'in']),
  value: z.unknown(),
});

export type FilterParams = z.infer<typeof FilterSchema>;

// ============================================================================
// 런타임 검증 유틸리티
// ============================================================================

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new Error(
      `데이터 검증 실패: ${result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ')}`,
    );
  }

  return result.data;
}

export function validateDataSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
