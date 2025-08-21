import React from 'react';
import { TouchableOpacity } from 'react-native';

import { useThemeColors } from '../../../components/providers/theme-provider';
import { useI18n } from '../../../hooks/use-i18n';
import { getCategoryData } from '../utils/getCategoryData';

type SearchCategoryButtonProps = {
  label: string;
  onPress?: (props: string) => void;
  isSelected: boolean;
};

const SearchCategoryButton = ({ label, onPress, isSelected }: SearchCategoryButtonProps) => {
  const { language } = useI18n();
  const { isDark } = useThemeColors();
  const { icon: Icon, color } = getCategoryData(label, language);

  return (
    <TouchableOpacity
      style={{
        height: 50,
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        backgroundColor: getBackgroundColor(color),
      }}
      onPress={() => onPress?.(label)}
    >
      {Icon && <Icon size={24} color={isDark ? '#FFFFFF' : '#000000'} />}
    </TouchableOpacity>
  );
};

const getBackgroundColor = (color: string) => {
  const colorMap: { [key: string]: string } = {
    paleCobalt: '#576BCD',
    foggyBlue: '#9BB5D6',
    paleYellow: '#F5E6A8',
    pink: '#F4A6CD',
    teal: '#14b8a6',
  };
  return colorMap[color] || '#576BCD';
};

export default SearchCategoryButton;
