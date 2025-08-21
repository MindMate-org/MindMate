import { ReactNode } from 'react';
import { Text } from 'react-native';

import { useThemeColors } from '../../../components/providers/theme-provider';

type AddressBookNameProps = {
  children: ReactNode;
};

const AddressBookName = ({ children }: AddressBookNameProps) => {
  const { theme: themeColors } = useThemeColors();

  return (
    <Text
      style={{
        fontSize: 20,
        fontWeight: 'bold',
        color: themeColors.text,
      }}
    >
      {children}
    </Text>
  );
};

export default AddressBookName;
