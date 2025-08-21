import { Plus } from 'lucide-react-native';
import { Image, Text, TouchableOpacity } from 'react-native';

type ImageButtonProps = {
  onPress: () => void;
  className?: string;
  image?: string;
  variant?: 'default' | 'primary';
  disabled?: boolean;
};

/**
 * @deprecated 이 컴포넌트는 더 이상 사용되지 않습니다. MediaPicker 컴포넌트를 사용하세요.
 */
const ImageButton = ({
  onPress,
  image,
  variant = 'primary',
  disabled,
  className,
}: ImageButtonProps) => {
  const getBackgroundStyle = () => {
    switch (variant) {
      case 'primary':
        return 'bg-paleCobalt';
      case 'default':
      default:
        return 'bg-white';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return 'white';
      case 'default':
      default:
        return '#576bcd';
    }
  };

  return (
    <TouchableOpacity
      className={`h-[72px] w-[72px] items-center justify-center rounded-xl ${getBackgroundStyle()} shadow-dropShadow ${
        disabled ? 'opacity-50' : ''
      } ${className || ''}`}
      onPress={onPress}
      disabled={disabled}
    >
      {image ? (
        <Image
          className="h-[72px] w-[72px] rounded-xl"
          source={{ uri: image }}
          resizeMode="cover"
        />
      ) : (
        <Text>
          <Plus color={getIconColor()} strokeWidth={4} />
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default ImageButton;
