/**
 * 디바운스된 검색을 위한 최적화된 훅
 * - 검색 입력에 대한 지연 처리
 * - 메모리 누수 방지
 * - 성능 최적화
 */
import { useEffect, useState, useRef } from 'react';

export interface UseDebouncedSearchOptions {
  delay?: number;
  minLength?: number;
}

export const useDebouncedSearch = (searchText: string, options: UseDebouncedSearchOptions = {}) => {
  const { delay = 300, minLength = 0 } = options;
  const [debouncedSearchText, setDebouncedSearchText] = useState(searchText);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    // 최소 길이 체크
    if (searchText.length < minLength && searchText.length > 0) {
      return;
    }

    // 이전 타이머 정리
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchText, delay, minLength]);

  // 컴포넌트 언마운트 시 클린업
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedSearchText;
};
