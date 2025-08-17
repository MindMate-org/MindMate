import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  Text,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';

interface AnimatedButtonProps {
  onPress: (event: GestureResponderEvent) => void;
  title: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  title,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  style,
  textStyle,
  testID,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-100 border border-gray-300';
      case 'outline':
        return 'bg-transparent border border-paleCobalt';
      case 'ghost':
        return 'bg-transparent';
      case 'danger':
        return 'bg-red-500 border border-red-500';
      case 'primary':
      default:
        return 'bg-paleCobalt border border-paleCobalt';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-2 rounded-md';
      case 'large':
        return 'px-8 py-4 rounded-xl';
      case 'medium':
      default:
        return 'px-6 py-3 rounded-lg';
    }
  };

  const getTextVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'text-gray-700';
      case 'outline':
        return 'text-paleCobalt';
      case 'ghost':
        return 'text-paleCobalt';
      case 'danger':
        return 'text-white';
      case 'primary':
      default:
        return 'text-white';
    }
  };

  const getTextSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'text-sm font-medium';
      case 'large':
        return 'text-lg font-semibold';
      case 'medium':
      default:
        return 'text-base font-medium';
    }
  };

  const getDisabledStyles = () => {
    if (disabled || loading) {
      return 'opacity-50';
    }
    return '';
  };

  const buttonStyles = [
    'flex-row items-center justify-center',
    getVariantStyles(),
    getSizeStyles(),
    getDisabledStyles(),
    className,
  ].join(' ');

  const textStyles = [getTextVariantStyles(), getTextSizeStyles()].join(' ');

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      <TouchableOpacity
        className={buttonStyles}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        testID={testID}
      >
        {icon && iconPosition === 'left' && (
          <Animated.View style={{ marginRight: 8 }}>{icon}</Animated.View>
        )}

        <Text className={textStyles} style={textStyle}>
          {loading ? '처리 중...' : title}
        </Text>

        {icon && iconPosition === 'right' && (
          <Animated.View style={{ marginLeft: 8 }}>{icon}</Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AnimatedButton;
