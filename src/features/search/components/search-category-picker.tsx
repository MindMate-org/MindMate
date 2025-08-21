import DropDownPicker, { DropDownPickerProps } from 'react-native-dropdown-picker';

import { useThemeColors } from '../../../components/providers/theme-provider';
import { useI18n } from '../../../hooks/use-i18n';

const SearchCategoryPicker = (props: DropDownPickerProps<any>) => {
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();

  return (
    <DropDownPicker
      listMode="MODAL"
      placeholder={
        t.locale.startsWith('en') ? 'Please select a category' : '카테고리를 선택해 주세요'
      }
      placeholderStyle={{
        color: themeColors.textSecondary,
        fontSize: 18,
      }}
      textStyle={{
        color: themeColors.text,
        fontSize: 18,
      }}
      style={{
        borderWidth: 0,
        borderRadius: 12,
        backgroundColor: themeColors.surface,
        paddingHorizontal: 16,
        shadowColor: themeColors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      dropDownContainerStyle={{
        borderWidth: 0,
        borderRadius: 12,
        backgroundColor: themeColors.surface,
        shadowColor: themeColors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      modalContentContainerStyle={{
        backgroundColor: themeColors.background,
      }}
      modalTitleStyle={{
        color: themeColors.text,
      }}
      listItemLabelStyle={{
        color: themeColors.text,
      }}
      selectedItemLabelStyle={{
        color: themeColors.primary,
      }}
      selectedItemContainerStyle={{
        backgroundColor: themeColors.accent,
      }}
      {...props}
    />
  );
};

export default SearchCategoryPicker;
