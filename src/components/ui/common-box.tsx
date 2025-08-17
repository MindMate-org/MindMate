import { View } from 'react-native';

import { useThemeColors } from '../providers/theme-provider';

type CommonBoxProps = {
  children: React.ReactNode;
  color?: string;
};

const colorMap: Record<string, string> = {
  black: '#000000',
  gray: '#6B7280',
  white: '#FFFFFF',
  teal: '#14B8A6',
  paleYellow: '#FEF3C7',
  pink: '#EC4899',
  turquoise: '#06B6D4',
  foggyBlue: '#93C5FD',
  paleCobalt: '#576BCD',
  red: '#EF4444',
};

const CommonBox = ({ children, color }: CommonBoxProps) => {
  const { theme: themeColors, isDark } = useThemeColors();
  const borderLeftColor = color ? colorMap[color] : colorMap.paleCobalt;
  
  return (
    <View style={{
      width: '100%',
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: borderLeftColor,
      backgroundColor: themeColors.surface,
      padding: 16,
      shadowColor: themeColors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 2,
      elevation: 2,
    }}>
      {children}
    </View>
  );
};

export default CommonBox;
