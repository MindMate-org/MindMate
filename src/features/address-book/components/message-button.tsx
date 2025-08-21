import { Mail } from 'lucide-react-native';
import { TouchableOpacity, Text, Linking } from 'react-native';
import { useI18n } from '../../../hooks/use-i18n';
import { useThemeColors } from '../../../components/providers/theme-provider';

const MessageButton = ({ phoneNumber }: { phoneNumber: string }) => {
  const { t } = useI18n();
  const { theme: themeColors } = useThemeColors();
  const isEnglish = t.locale.startsWith('en');

  const handleMessage = () => {
    Linking.openURL(`sms:${phoneNumber}`);
  };

  return (
    <TouchableOpacity
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: themeColors.primary,
        backgroundColor: themeColors.background,
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
      onPress={handleMessage}
    >
      <Mail size={14} color={themeColors.primary} />
      <Text
        style={{
          marginLeft: 4,
          fontSize: 12,
          fontWeight: '500',
          color: themeColors.primary,
        }}
      >
        {isEnglish ? 'Message' : '문자'}
      </Text>
    </TouchableOpacity>
  );
};

export default MessageButton;
