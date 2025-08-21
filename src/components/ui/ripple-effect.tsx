import React, { useRef } from 'react';
import { TouchableOpacity, Animated, View, ViewStyle, GestureResponderEvent } from 'react-native';

interface RippleEffectProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  className?: string;
  rippleColor?: string;
  disabled?: boolean;
}

/**
 * 터치 시 리플 효과를 제공하는 컴포넌트
 * Material Design의 리플 효과를 구현합니다.
 */
const RippleEffect: React.FC<RippleEffectProps> = ({
  children,
  onPress,
  style,
  className = '',
  rippleColor = 'rgba(87, 107, 205, 0.2)',
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePress = (event: GestureResponderEvent) => {
    if (disabled) return;

    // 리플 애니메이션
    scaleAnim.setValue(0);
    opacityAnim.setValue(1);

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.(event);
  };

  return (
    <TouchableOpacity
      className={className}
      style={[{ overflow: 'hidden' }, style]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={{ position: 'relative' }}>
        {children}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: rippleColor,
            borderRadius: 50,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
          pointerEvents="none"
        />
      </View>
    </TouchableOpacity>
  );
};

export default RippleEffect;
