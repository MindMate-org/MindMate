import { useIsFocused } from '@react-navigation/native';
import { useEffect, useRef } from 'react';

export const useFocusPage = (callback: () => void) => {
  const isFocused = useIsFocused();
  const isFirstRender = useRef(true);
  const callbackRef = useRef(callback);

  // callback ref를 항상 최신으로 유지
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (isFocused && !isFirstRender.current) {
      // 첫 렌더링이 아닌 경우에만 콜백 실행 (페이지 재진입 시에만)
      callbackRef.current();
    }
    isFirstRender.current = false;
  }, [isFocused]); // callback 의존성 제거
};
