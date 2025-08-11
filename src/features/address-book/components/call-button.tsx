import { Phone } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, Linking } from 'react-native';

const CallButton = ({ phoneNumber }: { phoneNumber: string }) => {
  const handleCall = () => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url);
  };
  return (
    <TouchableOpacity
      className="flex-1 flex-row items-center justify-center rounded-lg bg-paleCobalt px-3 py-2"
      onPress={handleCall}
    >
      <Phone size={14} color="white" />
      <Text className="ml-1 text-xs font-medium text-white">전화</Text>
    </TouchableOpacity>
  );
};

export default CallButton;
