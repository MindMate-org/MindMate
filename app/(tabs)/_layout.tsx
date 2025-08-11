import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';

import CustomTopTabBar from '../../src/components/custom-top-tab-bar';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext(Navigator);

export default function TabLayout() {
  return (
    <MaterialTopTabs
      tabBar={(props) => <CustomTopTabBar {...props} />}
      screenOptions={{
        lazy: true,
      }}
    >
      <MaterialTopTabs.Screen name="diary" options={{ title: '일기', tabBarLabel: '일기' }} />
      <MaterialTopTabs.Screen name="schedule" options={{ title: '일정', tabBarLabel: '일정' }} />
      <MaterialTopTabs.Screen name="routine" options={{ title: '루틴', tabBarLabel: '루틴' }} />
      <MaterialTopTabs.Screen name="search" options={{ title: '찾기', tabBarLabel: '찾기' }} />
      <MaterialTopTabs.Screen
        name="address-book"
        options={{ title: '주소록', tabBarLabel: '주소록' }}
      />
    </MaterialTopTabs>
  );
}
