import { searchCategories } from '../constants/search-category-constants';

/**
 * 카테고리의 아이콘과 색상을 반환하는 함수
 * @param label - 카테고리의 라벨
 * @returns { icon: Component, color: string }
 */
export const getCategoryData = (label: string) => {
  const foundCategory = searchCategories.find((category) => category.label === label);
  return {
    icon: foundCategory?.icon,
    color: foundCategory?.color ?? 'foggyBlue',
  };
};
