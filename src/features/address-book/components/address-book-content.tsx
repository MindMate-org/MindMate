import React, { ReactNode } from 'react';
import { Text } from 'react-native';

import { useThemeColors } from '../../../components/providers/theme-provider';

type AddressBOokContentProps = {
  children: ReactNode;
};

const AddressBookContent = ({ children }: AddressBOokContentProps) => {
  const { theme: themeColors } = useThemeColors();
  
  return (
    <Text style={{
      fontSize: 12,
      color: themeColors.textSecondary,
    }}>
      {children}
    </Text>
  );
};

export default AddressBookContent;
