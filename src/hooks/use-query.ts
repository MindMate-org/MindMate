/**
 * 성능 최적화된 데이터 패칭 훅
 * - React Query 패턴 적용
 * - 메모리 누수 방지
 * - 스마트 캐싱
 * - 에러 복구 메커니즘
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export interface QueryOptions<T> {
  enabled?: boolean;
  staleTime?: number; // 캐시 유효 시간 (ms)
  cacheTime?: number; // 캐시 보관 시간 (ms)
  refetchOnMount?: boolean;
  refetchOnFocus?: boolean;
  refetchOnWindowFocus?: boolean;
  retry?: number;
  retryDelay?: number;
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export interface QueryResult<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
  invalidate: () => void;
}

// 글로벌 캐시 (간단한 메모리 캐시)
const queryCache = new Map<string, {
  data: any;
  timestamp: number;
  staleTime: number;
}>();

// 글로벌 캐시 무효화 함수
export const invalidateQueries = (keyPattern: string | string[]) => {
  const pattern = Array.isArray(keyPattern) ? keyPattern.join('-') : keyPattern;
  
  for (const [key] of queryCache) {
    if (key.includes(pattern)) {
      queryCache.delete(key);
    }
  }
};

export function useQuery<T>(
  key: string | string[], 
  queryFn: () => Promise<T>,
  options: QueryOptions<T> = {}
): QueryResult<T> {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5분 기본
    refetchOnMount = true,
    refetchOnFocus = false,
    retry = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const queryKey = Array.isArray(key) ? key.join('_') : key;
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // 캐시된 데이터 확인
  const getCachedData = useCallback(() => {
    const cached = queryCache.get(queryKey);
    if (cached && Date.now() - cached.timestamp < cached.staleTime) {
      return cached.data;
    }
    return null;
  }, [queryKey]);

  // 데이터 패칭 함수
  const fetchData = useCallback(async (isRefetch = false) => {
    if (!enabled) return;

    // 이미 실행 중인 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // 캐시된 데이터 확인 (refetch가 아닌 경우에만)
    if (!isRefetch) {
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
        return;
      }
    }

    try {
      setError(null);
      if (isRefetch) {
        setIsRefetching(true);
      } else {
        setIsLoading(true);
      }
      setIsFetching(true);

      const result = await queryFn();
      
      // 요청이 취소되었는지 확인
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setData(result);
      retryCountRef.current = 0;

      // 캐시 업데이트
      queryCache.set(queryKey, {
        data: result,
        timestamp: Date.now(),
        staleTime,
      });

      onSuccess?.(result);
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const error = err instanceof Error ? err : new Error('Unknown error');
      
      // 재시도 로직
      if (retryCountRef.current < retry) {
        retryCountRef.current++;
        timeoutRef.current = setTimeout(() => {
          fetchData(isRefetch);
        }, retryDelay * retryCountRef.current);
        return;
      }

      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
      setIsFetching(false);
    }
  }, [enabled, queryFn, getCachedData, staleTime, retry, retryDelay, onSuccess, onError, queryKey]);

  // refetch 함수
  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // invalidate 함수 - 캐시 무효화
  const invalidate = useCallback(() => {
    queryCache.delete(queryKey);
  }, [queryKey]);

  // 마운트 시 데이터 패칭
  useEffect(() => {
    if (enabled && refetchOnMount) {
      fetchData();
    }
  }, [enabled, refetchOnMount, fetchData]);

  // 포커스 시 리패칭 (옵션)
  useEffect(() => {
    if (!refetchOnFocus) return;

    const handleFocus = () => {
      if (enabled) {
        fetchData(true);
      }
    };

    // React Native에서는 AppState 사용
    const subscription = require('react-native').AppState?.addEventListener?.('change', (nextAppState: string) => {
      if (nextAppState === 'active') {
        handleFocus();
      }
    });

    return () => {
      subscription?.remove?.();
    };
  }, [refetchOnFocus, enabled, fetchData]);

  // 클린업
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    error,
    isLoading,
    isError: error !== null,
    isRefetching,
    isFetching,
    refetch,
    invalidate,
  };
}

// 뮤테이션을 위한 훅
export interface MutationOptions<T, TVariables> {
  onSuccess?: (data: T, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: T | undefined, error: Error | null, variables: TVariables) => void;
}

export interface MutationResult<T, TVariables> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  mutate: (variables: TVariables) => Promise<void>;
  reset: () => void;
}

export function useMutation<T, TVariables>(
  mutationFn: (variables: TVariables) => Promise<T>,
  options: MutationOptions<T, TVariables> = {}
): MutationResult<T, TVariables> {
  const { onSuccess, onError, onSettled } = options;
  
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(async (variables: TVariables) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await mutationFn(variables);
      setData(result);
      onSuccess?.(result, variables);
      onSettled?.(result, null, variables);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error, variables);
      onSettled?.(undefined, error, variables);
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, onSuccess, onError, onSettled]);

  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    mutate,
    reset,
  };
}

// 다중 쿼리를 위한 유틸리티
export function useQueries<T extends Record<string, any>>(
  queries: Array<{
    key: string | string[];
    queryFn: () => Promise<any>;
    options?: QueryOptions<any>;
  }>
) {
  const results = queries.map(({ key, queryFn, options }) => 
    useQuery(key, queryFn, options)
  );

  return results;
}