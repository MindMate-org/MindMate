import { Phone } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, Linking } from 'react-native';

import { useThemeColors } from '../../../components/providers/theme-provider';
import { useI18n } from '../../../hooks/use-i18n';

const CallButton = ({ phoneNumber }: { phoneNumber: string }) => {
  const { t } = useI18n();
  const { theme: themeColors } = useThemeColors();
  const isEnglish = t.locale.startsWith('en');

  const handleCall = () => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url);
  };

  return (
    <TouchableOpacity
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: themeColors.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
      onPress={handleCall}
    >
      <Phone size={14} color={themeColors.primaryText} />
      <Text
        style={{
          marginLeft: 4,
          fontSize: 12,
          fontWeight: '500',
          color: themeColors.primaryText,
        }}
      >
        {isEnglish ? 'Call' : '전화'}
      </Text>
    </TouchableOpacity>
  );
};

export default CallButton;
