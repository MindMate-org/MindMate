import React from 'react';
import { TouchableOpacity } from 'react-native';

import { getCategoryData } from '../utils/getCategoryData';

type SearchCategoryButtonProps = {
  label: string;
  onPress?: (props: string) => void;
  isSelected: boolean;
};

const SearchCategoryButton = ({ label, onPress, isSelected }: SearchCategoryButtonProps) => {
  const { icon: Icon, color } = getCategoryData(label);

  return (
    <TouchableOpacity
      className={`h-[50px] w-[50px] items-center justify-center rounded-xl ${
        isSelected ? ' bg-white' : `bg-${color}`
      }`}
      onPress={() => onPress?.(label)}
    >
      {Icon && <Icon size={24} />}
    </TouchableOpacity>
  );
};

export default SearchCategoryButton;
