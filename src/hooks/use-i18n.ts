/**
 * 다국어 지원 훅
 */

import { useGlobalStore } from '../store/global-store';
import { getTranslations } from '../lib/i18n';

export const useI18n = () => {
  const language = useGlobalStore((state) => state.language);
  
  const t = getTranslations(language);
  
  return {
    t,
    language,
  };
};