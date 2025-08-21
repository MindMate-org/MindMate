/**
 * 다국어 지원 훅
 */

import { getTranslations } from '../lib/i18n';
import { useLanguage } from '../store/app-store';

export const useI18n = () => {
  const language = useLanguage();

  const t = getTranslations(language);

  return {
    t,
    language,
  };
};
