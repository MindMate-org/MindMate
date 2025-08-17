import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { router } from 'expo-router';
import { Settings } from 'lucide-react-native';
import React from 'react';
import { View, TouchableOpacity, Text, SafeAreaView } from 'react-native';

import { useThemeColors } from './providers/theme-provider';
import { useI18n } from '../hooks/use-i18n';

export default function CustomTopTabBar({
  state,
  descriptors,
  navigation,
}: MaterialTopTabBarProps) {
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
  // 디버깅용 로그 (개발 중에만 사용)
  if (__DEV__) {
    console.log(
      'Tab Routes:',
      state.routes.map((r, index) => ({
        index,
        name: r.name,
        label:
          descriptors[r.key]?.options?.title || descriptors[r.key]?.options?.tabBarLabel || r.name,
      })),
    );
  }

  return (
    <SafeAreaView
      style={{
        backgroundColor: isDark ? themeColors.surface : '#F0F3FF',
      }}
    >
      {/* MIND MATE 타이틀 */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: 32,
          paddingBottom: 16,
          
        }}
      >
        <View style={{ width: 32 }} />
        <TouchableOpacity onPress={() => router.push('/')}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: isDark ? themeColors.primary : '#576BCD',
            }}
          >
            MIND MATE
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          style={{ borderRadius: 20, padding: 8 }}
        >
          <Settings size={20} color={isDark ? themeColors.primary : '#576BCD'} />
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: themeColors.primary,
          backgroundColor: isDark ? themeColors.surface : '#F0F3FF',
          paddingHorizontal: 8,
          paddingVertical: 12,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];

          // 다국어 라벨 매핑
          const getLabelFromRoute = (routeName: string) => {
            const labelMap: { [key: string]: string } = {
              diary: t.tabs.diary,
              schedule: t.tabs.schedule,
              routine: t.tabs.routine,
              search: t.tabs.search,
              'address-book': t.tabs.addressBook,
            };
            return labelMap[routeName] || routeName;
          };

          let label = route.name;
          if (typeof options.tabBarLabel === 'string') {
            label = options.tabBarLabel;
          } else if (options.title) {
            label = options.title;
          } else {
            label = getLabelFromRoute(route.name);
          }

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={{
                marginHorizontal: 4,
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 12,
                backgroundColor: isFocused 
                  ? (isDark ? themeColors.primary : '#576BCD') 
                  : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: isFocused ? 'bold' : 'normal',
                  color: isFocused 
                    ? (isDark ? themeColors.primaryText : '#FFFFFF')
                    : (isDark ? themeColors.primary : '#576BCD'),
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
