import { useEffect, useState, useCallback, useRef } from 'react';

// 간단한 메모리 캐시
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30초 캐시

// 더 안전한 캐시 키 생성 (함수 + 의존성 기반)
let keyCounter = 0;
const functionKeys = new WeakMap<Function, string>();

const getCacheKey = (fn: Function) => {
  if (!functionKeys.has(fn)) {
    functionKeys.set(fn, `fn_${++keyCounter}_${Date.now()}`);
  }
  return functionKeys.get(fn)!;
};

export const useAsyncDataGet = <T>(getFn: () => Promise<T>, useCache = true) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const [isRefetch, setIsRefetch] = useState(false);
  const hasLoadedOnceRef = useRef(false);

  const refetch = () => {
    setIsRefetch(!isRefetch);
  };

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const cacheKey = getCacheKey(getFn);

      // 캐시 확인
      if (useCache) {
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          if (isMountedRef.current) {
            setData(cached.data);
            setLoading(false);
            hasLoadedOnceRef.current = true;
          }
          return;
        }
      }

      // 첫 로딩이거나 데이터가 없을 때만 로딩 상태 표시
      if (!hasLoadedOnceRef.current) {
        setLoading(true);
      }
      setError(null);
      const result = await getFn();

      if (isMountedRef.current) {
        setData(result);
        hasLoadedOnceRef.current = true;

        // 캐시 저장
        if (useCache) {
          cache.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
          });
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : '데이터를 가져오는 중 오류가 발생했습니다');
        setData(null);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [getFn, isRefetch, useCache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};
