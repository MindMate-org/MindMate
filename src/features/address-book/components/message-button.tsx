import { Mail } from 'lucide-react-native';
import { TouchableOpacity, Text, Linking } from 'react-native';

const MessageButton = ({ phoneNumber }: { phoneNumber: string }) => {
  const handleMessage = () => {
    Linking.openURL(`sms:${phoneNumber}`);
  };

  return (
    <TouchableOpacity
      className="flex-1 flex-row items-center justify-center rounded-lg border border-paleCobalt px-3 py-2"
      onPress={handleMessage}
    >
      <Mail size={14} color="#576bcd" />
      <Text className="ml-1 text-xs font-medium text-paleCobalt">문자</Text>
    </TouchableOpacity>
  );
};

export default MessageButton;
