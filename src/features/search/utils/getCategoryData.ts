import { SupportedLanguage } from '../../../lib/i18n';
import { getSearchCategories } from '../constants/search-category-constants';

// 한국어-영어 카테고리 매핑
const categoryMapping: Record<string, string> = {
  // 한국어 -> 영어 키
  전체: 'all',
  개인용품: 'personal',
  모바일: 'mobile',
  전자제품: 'electronics',
  주방용품: 'kitchen',
  // 영어 -> 영어 키 (역방향 호환)
  All: 'all',
  'Personal Items': 'personal',
  Mobile: 'mobile',
  Electronics: 'electronics',
  Kitchen: 'kitchen',
};

/**
 * 카테고리의 아이콘과 색상을 반환하는 함수
 * @param label - 카테고리의 라벨 (한국어 또는 영어)
 * @param language - 현재 언어 설정
 * @returns { icon: Component, color: string }
 */
export const getCategoryData = (label: string, language: SupportedLanguage = 'ko') => {
  const searchCategories = getSearchCategories(language);

  // 1. 직접 매칭 시도 (같은 언어)
  let foundCategory = searchCategories.find((category) => category.label === label);

  // 2. 직접 매칭 실패시, 크로스 언어 매칭 시도
  if (!foundCategory) {
    const categoryKey = categoryMapping[label];
    if (categoryKey) {
      // 현재 언어의 모든 카테고리에서 동일한 키를 가진 카테고리 찾기
      foundCategory = searchCategories.find((category) => {
        return categoryMapping[category.label] === categoryKey;
      });
    }
  }

  return {
    icon: foundCategory?.icon,
    color: foundCategory?.color ?? 'foggyBlue',
  };
};
