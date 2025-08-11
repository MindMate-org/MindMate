import React from 'react';
import { View } from 'react-native';

type CommonBoxProps = {
  children: React.ReactNode;
  color?: string;
};

const colorMap: Record<string, string> = {
  black: 'border-l-black',
  gray: 'border-l-gray',
  white: 'border-l-white',
  teal: 'border-l-teal',
  paleYellow: 'border-l-paleYellow',
  pink: 'border-l-pink',
  turquoise: 'border-l-turquoise',
  foggyBlue: 'border-l-foggyBlue',
  paleCobalt: 'border-l-paleCobalt',
  red: 'border-l-red',
};

const CommonBox = ({ children, color }: CommonBoxProps) => {
  const borderLeftColor = color ? colorMap[color] : 'border-l-paleCobalt';
  return (
    <View className={`w-full rounded-md border-l-4 bg-white p-4 ${borderLeftColor}`}>
      {children}
    </View>
  );
};

export default CommonBox;
