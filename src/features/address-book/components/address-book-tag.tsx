import React, { ReactNode } from 'react';
import { Text } from 'react-native';

type AddressBookLabel = {
  children: ReactNode;
};

const AddressBookTag = ({ children }: AddressBookLabel) => {
  return (
    <Text className="rounded-full bg-paleCobalt/10 px-2 py-1 text-xs font-medium text-paleCobalt">
      {children}
    </Text>
  );
};

export default AddressBookTag;
