import { useRouter } from 'expo-router';
import { Heart, Calendar, BookOpen, Users, Search } from 'lucide-react-native';
import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';

import { useThemeColors } from '../../src/components/providers/theme-provider';
import { useI18n } from '../../src/hooks/use-i18n';

/**
 * 온보딩 환영 화면
 * 앱 소개 및 시작하기 버튼
 */
const WelcomeScreen = () => {
  const router = useRouter();
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();

  const features = [
    {
      icon: <BookOpen size={32} color={themeColors.primary} />,
      title: t.locale.startsWith('en') ? 'Daily Diary' : '일상 일기',
      description: t.locale.startsWith('en')
        ? 'Record your precious moments'
        : '소중한 순간들을 기록하세요',
    },
    {
      icon: <Calendar size={32} color={themeColors.primary} />,
      title: t.locale.startsWith('en') ? 'Smart Schedule' : '스마트 일정',
      description: t.locale.startsWith('en')
        ? 'Manage your time efficiently'
        : '효율적으로 시간을 관리하세요',
    },
    {
      icon: <Heart size={32} color={themeColors.primary} />,
      title: t.locale.startsWith('en') ? 'Healthy Routines' : '건강한 루틴',
      description: t.locale.startsWith('en') ? 'Build positive habits' : '긍정적인 습관을 만드세요',
    },
    {
      icon: <Users size={32} color={themeColors.primary} />,
      title: t.locale.startsWith('en') ? 'Address Book' : '주소록 관리',
      description: t.locale.startsWith('en')
        ? 'Keep your contacts organized'
        : '연락처를 체계적으로 관리하세요',
    },
    {
      icon: <Search size={32} color={themeColors.primary} />,
      title: t.locale.startsWith('en') ? 'Item Tracker' : '물건 찾기',
      description: t.locale.startsWith('en')
        ? 'Never lose your belongings'
        : '물건을 잃어버리지 마세요',
    },
  ];

  const handleStartPress = () => {
    router.push('/onboarding/user-info');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 24,
            paddingTop: 60,
            paddingBottom: 40,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* 헤더 */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: themeColors.primary + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 32,
              }}
            >
              <Text
                style={{
                  fontSize: 48,
                  fontWeight: 'bold',
                  color: themeColors.primary,
                }}
              >
                M
              </Text>
            </View>

            <Text
              style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: themeColors.text,
                textAlign: 'center',
                marginBottom: 12,
              }}
            >
              MIND MATE
            </Text>

            <Text
              style={{
                fontSize: 18,
                color: themeColors.textSecondary,
                textAlign: 'center',
                lineHeight: 24,
              }}
            >
              {t.locale.startsWith('en')
                ? 'Your Smart Companion\nfor Mental Care'
                : '마음을 돌보는\n스마트한 동반자'}
            </Text>
          </View>

          {/* 기능 소개 */}
          <View style={{ width: '100%', marginBottom: 40 }}>
            {features.map((feature, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: themeColors.surface,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  shadowColor: themeColors.shadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: themeColors.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                  }}
                >
                  {feature.icon}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: themeColors.text,
                      marginBottom: 4,
                    }}
                  >
                    {feature.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: themeColors.textSecondary,
                      lineHeight: 18,
                    }}
                  >
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* 시작하기 버튼 */}
          <View style={{ width: '100%' }}>
            <TouchableOpacity
              onPress={handleStartPress}
              style={{
                backgroundColor: themeColors.primary,
                borderRadius: 16,
                paddingVertical: 18,
                alignItems: 'center',
                shadowColor: themeColors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.4 : 0.2,
                shadowRadius: 8,
                elevation: 6,
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: themeColors.primaryText,
                }}
              >
                {t.locale.startsWith('en') ? 'Get Started' : '시작하기'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
