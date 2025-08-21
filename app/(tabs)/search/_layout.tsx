import { Stack } from 'expo-router';
import { ANIMATION_CONFIG } from '../../../src/constants/animations';

export default function SearchLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        ...ANIMATION_CONFIG.pageTransition,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
