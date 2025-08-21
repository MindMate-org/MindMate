/**
 * 기존 useAsyncDataGet을 대체하는 마이그레이션 헬퍼 훅
 * - 기존 코드의 호환성을 유지하면서 새로운 useQuery로 점진적 마이그레이션
 * - 동일한 API를 제공하지만 내부적으로 useQuery 사용
 */
import { useCallback } from 'react';

import { useQuery } from './use-query';

export interface EnhancedAsyncDataOptions<T> {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  retry?: number;
  refetchOnWindowFocus?: boolean;
  initialData?: T;
}

export interface EnhancedAsyncDataResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * useAsyncDataGet과 호환되는 API를 제공하는 개선된 훅
 * @param queryFn 비동기 데이터 fetching 함수
 * @param options 쿼리 옵션
 * @returns useAsyncDataGet과 동일한 형태의 결과
 */
export const useEnhancedAsyncDataGet = <T>(
  queryFn: () => Promise<T>,
  options: EnhancedAsyncDataOptions<T> = {},
): EnhancedAsyncDataResult<T> => {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5분
    cacheTime = 10 * 60 * 1000, // 10분
    retry = 3,
    refetchOnWindowFocus = false,
    initialData,
  } = options;

  // queryFn을 기반으로 고유한 쿼리 키 생성
  const queryKey = [queryFn.toString().slice(0, 50)];

  const {
    data,
    isLoading: loading,
    isError,
    error,
    refetch: originalRefetch,
  } = useQuery<T>(queryKey, queryFn, {
    enabled,
    staleTime,
    cacheTime,
    retry,
    refetchOnWindowFocus,
    initialData,
  });

  // useAsyncDataGet과 동일한 인터페이스로 refetch 함수 제공
  const refetch = useCallback(() => {
    originalRefetch();
  }, [originalRefetch]);

  return {
    data,
    loading,
    error: isError ? (error as Error) : null,
    refetch,
  };
};

/**
 * useAsyncDataGet을 점진적으로 마이그레이션하기 위한 유틸리티
 * 기존 코드에서 import만 바꾸면 됨
 * @deprecated 새 코드에서는 useQuery를 직접 사용하세요
 */
export const useAsyncDataGet = useEnhancedAsyncDataGet;
