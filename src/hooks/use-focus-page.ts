import { useIsFocused } from '@react-navigation/native';
import { useEffect } from 'react';

export const useFocusPage = (callback: () => void) => {
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      // 페이지가 포커스될 때 실행
      callback();
    }
  }, [isFocused, callback]);
};
