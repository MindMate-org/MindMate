/**
 * 다국어 지원 훅
 */

import { useLanguage } from '../store/app-store';
import { getTranslations } from '../lib/i18n';

export const useI18n = () => {
  const language = useLanguage();

  const t = getTranslations(language);

  return {
    t,
    language,
  };
};
