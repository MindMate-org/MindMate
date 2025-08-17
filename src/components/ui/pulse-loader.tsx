import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

interface PulseLoaderProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * 맥박 효과 로더 컴포넌트
 * 부드러운 펄스 애니메이션을 제공합니다.
 */
const PulseLoader: React.FC<PulseLoaderProps> = ({
  size = 40,
  color = '#576BCD',
  className = '',
}) => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [pulse]);

  return (
    <View className={`items-center justify-center ${className}`}>
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ scale: pulse }],
        }}
      />
    </View>
  );
};

export default PulseLoader;
