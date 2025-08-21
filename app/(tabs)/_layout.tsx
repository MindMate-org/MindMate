import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';

import CustomTopTabBar from '../../src/components/custom-top-tab-bar';
import { ANIMATION_CONFIG } from '../../src/constants/animations';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext(Navigator);

export default function TabLayout() {
  return (
    <MaterialTopTabs
      tabBar={(props) => <CustomTopTabBar {...props} />}
      screenOptions={{
        lazy: true,
        ...ANIMATION_CONFIG.tabTransition,
      }}
    >
      <MaterialTopTabs.Screen name="diary" />
      <MaterialTopTabs.Screen name="schedule" />
      <MaterialTopTabs.Screen name="routine" />
      <MaterialTopTabs.Screen name="search" />
      <MaterialTopTabs.Screen name="address-book" />
    </MaterialTopTabs>
  );
}
