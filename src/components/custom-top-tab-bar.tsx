import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { router } from 'expo-router';
import { Settings } from 'lucide-react-native';
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

export default function CustomTopTabBar({
  state,
  descriptors,
  navigation,
}: MaterialTopTabBarProps) {
  // 디버깅용 로그 (개발 중에만 사용)
  if (process.env.NODE_ENV === 'development') {
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
    <View className="pt-safe bg-blue-50">
      {/* MIND MATE 타이틀 */}
      <View className="flex-row items-center justify-between px-4 py-3 sm:py-4">
        <View className="w-8" />
        <TouchableOpacity onPress={() => router.push('/')}>
          <Text className="text-lg font-bold text-blue-600 sm:text-xl lg:text-2xl">MIND MATE</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/settings')} className="rounded-full p-2">
          <Settings size={20} color="#576BCD" />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-center border-b border-t border-blue-600 bg-blue-50 px-2 py-2 sm:px-3">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];

          // 라벨 결정 로직 개선
          let label = route.name;
          if (typeof options.tabBarLabel === 'string') {
            label = options.tabBarLabel;
          } else if (options.title) {
            label = options.title;
          } else {
            // 기본 라벨 매핑
            const labelMap: { [key: string]: string } = {
              diary: '일기',
              schedule: '일정',
              routine: '루틴',
              search: '찾기',
              'address-book': '주소록',
            };
            label = labelMap[route.name] || route.name;
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
              className={`mx-1 flex-1 items-center justify-center rounded-lg px-2 py-2 sm:mx-2 sm:px-3 sm:py-3 ${
                isFocused ? 'bg-blue-600' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-xs sm:text-sm ${
                  isFocused ? 'font-bold text-white' : 'font-normal text-blue-600'
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
