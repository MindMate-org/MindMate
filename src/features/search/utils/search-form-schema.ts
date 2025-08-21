import { z } from 'zod';

import { getTranslations, SupportedLanguage } from '../../../lib/i18n';

export const createSearchFormSchema = (language: SupportedLanguage) => {
  const t = getTranslations(language);

  return z.object({
    name: z.string().min(1, {
      message: t.locale.startsWith('en')
        ? 'Item name is required.'
        : '물건 이름은 필수 입력 사항입니다.',
    }),
    category: z.string().min(1, {
      message: t.locale.startsWith('en')
        ? 'Category is required.'
        : '카테고리는 필수 입력 사항입니다.',
    }),
    location: z.string().min(1, {
      message: t.locale.startsWith('en')
        ? 'Location is required.'
        : '간략한 위치는 필수 입력 사항입니다.',
    }),
    description: z.string().optional(),
  });
};

// 기존 호환성을 위한 기본 스키마 (한국어)
export const searchFormSchema = createSearchFormSchema('ko' as SupportedLanguage);

export type SearchFormSchema = z.infer<typeof searchFormSchema>;
