import { Coffee, Key, Laptop, Package, Tablet } from 'lucide-react-native';

import { getTranslations, SupportedLanguage } from '../../../lib/i18n';

export const getSearchCategories = (language: SupportedLanguage) => {
  const t = getTranslations(language);

  return [
    { icon: Package, label: t.common.categories.all, color: 'paleCobalt' },
    { icon: Key, label: t.common.categories.personal, color: 'foggyBlue' },
    { icon: Tablet, label: t.common.categories.mobile, color: 'paleYellow' },
    { icon: Laptop, label: t.common.categories.electronics, color: 'pink' },
    { icon: Coffee, label: t.common.categories.kitchen, color: 'teal' },
  ];
};
