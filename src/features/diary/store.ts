/**
 * 일기 도메인 상태 관리
 * @description 일기 관련 전역 상태를 관리하는 Zustand 스토어입니다.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { DiaryStyleType, MoodType } from './types';

/**
 * 일기 필터 타입 정의
 * @description 일기 목록을 필터링하기 위한 조건들을 정의합니다.
 */
export interface DiaryFilterType {
  period?: 'all' | 'today' | 'week' | 'month' | 'year';
  mood?: MoodType | null;
  keyword?: string;
  isFavorite?: boolean;
}

/**
 * 일기 정렬 타입 정의
 * @description 일기 목록의 정렬 기준과 순서를 정의합니다.
 */
export interface DiarySortType {
  field: 'createdAt' | 'updatedAt' | 'title';
  order: 'asc' | 'desc';
}

/**
 * 일기 스토어 상태 타입 정의
 * @description 일기 도메인의 상태와 액션들을 정의합니다.
 */
export interface DiaryStoreStateType {
  // 필터 및 정렬 상태
  filter: DiaryFilterType;
  sort: DiarySortType;

  // UI 상태
  isSearchMode: boolean;
  selectedDiaryId: number | null;
  currentStyle: DiaryStyleType;

  // 액션
  setFilter: (filter: Partial<DiaryFilterType>) => void;
  resetFilter: () => void;
  setSort: (sort: DiarySortType) => void;
  setSearchMode: (isSearchMode: boolean) => void;
  setSelectedDiary: (id: number | null) => void;
  setCurrentStyle: (style: DiaryStyleType) => void;

  // 복합 액션
  toggleFavoriteFilter: () => void;
  resetAllFilters: () => void;
}

/**
 * 일기 도메인 Zustand 스토어
 * @description 일기 관련 전역 상태를 관리합니다.
 * - 필터링 및 정렬 상태
 * - 검색 모드 상태
 * - 현재 선택된 일기 및 스타일
 * - 각종 액션 메서드들
 */
export const useDiaryStore = create<DiaryStoreStateType>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // 초기 상태
      filter: {
        period: 'all',
        mood: null,
        keyword: '',
        isFavorite: false,
      },
      sort: {
        field: 'createdAt',
        order: 'desc',
      },
      isSearchMode: false,
      selectedDiaryId: null,
      currentStyle: {
        fontFamily: 'default',
        fontSize: 16,
        textAlign: 'left',
        textColor: '#000000',
        backgroundColor: '#F5F7FF',
      },

      // 액션
      setFilter: (newFilter) =>
        set((state) => {
          state.filter = { ...state.filter, ...newFilter };
        }),

      resetFilter: () =>
        set((state) => {
          state.filter = {
            period: 'all',
            mood: null,
            keyword: '',
            isFavorite: false,
          };
        }),

      setSort: (sort) =>
        set((state) => {
          state.sort = sort;
        }),

      setSearchMode: (isSearchMode) =>
        set((state) => {
          state.isSearchMode = isSearchMode;
        }),

      setSelectedDiary: (id) =>
        set((state) => {
          state.selectedDiaryId = id;
        }),

      setCurrentStyle: (style) =>
        set((state) => {
          state.currentStyle = style;
        }),

      // 복합 액션
      toggleFavoriteFilter: () =>
        set((state) => {
          state.filter.isFavorite = !state.filter.isFavorite;
        }),

      resetAllFilters: () =>
        set((state) => {
          state.filter = {
            period: 'all',
            mood: null,
            keyword: '',
            isFavorite: false,
          };
          state.sort = {
            field: 'createdAt',
            order: 'desc',
          };
          state.isSearchMode = false;
        }),
    })),
  ),
);

// Selector 훅들
export const useDiaryFilter = () => useDiaryStore((state) => state.filter);
export const useDiarySort = () => useDiaryStore((state) => state.sort);
export const useDiarySearchMode = () => useDiaryStore((state) => state.isSearchMode);
export const useSelectedDiary = () => useDiaryStore((state) => state.selectedDiaryId);
export const useCurrentDiaryStyle = () => useDiaryStore((state) => state.currentStyle);

// 액션 훅
export const useDiaryActions = () =>
  useDiaryStore((state) => ({
    setFilter: state.setFilter,
    resetFilter: state.resetFilter,
    setSort: state.setSort,
    setSearchMode: state.setSearchMode,
    setSelectedDiary: state.setSelectedDiary,
    setCurrentStyle: state.setCurrentStyle,
    toggleFavoriteFilter: state.toggleFavoriteFilter,
    resetAllFilters: state.resetAllFilters,
  }));

/**
 * 일기 필터링을 위한 computed selector
 * @param keyword 검색 키워드
 * @param mood 기분 필터
 * @param period 기간 필터
 */
export const useDiaryFilterSelector = (keyword?: string, mood?: MoodType | null, period?: string) =>
  useDiaryStore((state) => ({
    ...state.filter,
    ...(keyword !== undefined && { keyword }),
    ...(mood !== undefined && { mood }),
    ...(period !== undefined && { period }),
  }));
