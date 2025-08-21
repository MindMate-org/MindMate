import { router } from 'expo-router';
import { BookOpen, Clock, Search, RefreshCcw, UserRound, Settings } from 'lucide-react-native';
import { Text, View, TouchableOpacity, Image } from 'react-native';
import { useEffect, useState } from 'react';

import FadeInView from '../src/components/ui/fade-in-view';
import { useThemeColors } from '../src/components/providers/theme-provider';
import { useI18n } from '../src/hooks/use-i18n';
import { Colors } from '../src/constants/colors';
import { useUserName, useRecordScreenLoadTime, useSetUserName } from '../src/store/app-store';
import { AddressBookService } from '../src/features/address-book/services';

export default function HomeScreen() {
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
  const userName = useUserName();
  const setUserName = useSetUserName();
  const recordScreenLoadTime = useRecordScreenLoadTime();
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  // 사용자 정보 확인 및 온보딩 체크
  useEffect(() => {
    const checkUserInfo = async () => {
      try {
        // 내 정보(is_me = 1)가 있는지 확인
        const myContact = await AddressBookService.fetchGetMyContact();
        
        if (!myContact || !myContact.name) {
          // 사용자 정보가 없으면 온보딩으로 이동
          router.replace('/onboarding/welcome');
          return;
        }
        
        // 데이터베이스에서 가져온 사용자 이름을 글로벌 상태에 저장
        setUserName(myContact.name);
        
        setIsCheckingUser(false);
      } catch (error) {
        console.log('사용자 정보 확인 중 오류:', error);
        // 오류가 발생해도 온보딩으로 이동 (안전한 처리)
        router.replace('/onboarding/welcome');
      }
    };

    checkUserInfo();
  }, []);

  // 화면 로드 시간 측정
  useEffect(() => {
    if (isCheckingUser) return;
    
    const startTime = Date.now();
    
    const timer = setTimeout(() => {
      const loadTime = Date.now() - startTime;
      recordScreenLoadTime('home', loadTime);
    }, 100); // 화면 렌더링 완료 후 측정
    
    return () => clearTimeout(timer);
  }, [recordScreenLoadTime, isCheckingUser]);

  const menuItems = [
    {
      title: t.landing.writeDiary,
      route: '/(tabs)/diary',
      icon: <BookOpen color="#576BCD" size={64} />,
      backgroundColor: isDark ? themeColors.surface : '#C9EFEF', // teal
    },
    {
      title: t.landing.viewSchedule,
      route: '/schedule',
      icon: <Clock color="#576BCD" size={64} />,
      backgroundColor: isDark ? themeColors.surface : '#FFE5BC', // paleYellow
    },
    {
      title: t.landing.findItems,
      route: '/search',
      icon: <Search color="#576BCD" size={64} />,
      backgroundColor: isDark ? themeColors.surface : '#FFD7DD', // pink
    },
    {
      title: t.landing.viewRoutine,
      route: '/(tabs)/routine',
      icon: <RefreshCcw color="#576BCD" size={64} />,
      backgroundColor: isDark ? themeColors.surface : '#BDC7FF', // foggyBlue
    },
    {
      title: t.landing.viewContacts,
      route: '/address-book',
      icon: <UserRound color="#576BCD" size={64} />,
      backgroundColor: isDark ? themeColors.surface : '#FFFFFF', // white
    },
    {
      title: t.common.settings,
      route: '/settings',
      icon: <Settings color={isDark ? '#576BCD' : '#FFFFFF'} size={64} />,
      backgroundColor: isDark ? themeColors.surface : '#576BCD', // paleCobalt
    },
  ];

  const handlePress = (route: string) => {
    router.push(route);
  };

  // 사용자 정보 확인 중이면 빈 화면 표시
  if (isCheckingUser) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? themeColors.backgroundSecondary : '#576BCD',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: themeColors.primaryText,
          }}
        >
          MIND MATE
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        position: 'relative',
        flex: 1,
        backgroundColor: isDark ? themeColors.backgroundSecondary : '#576BCD',
      }}
    >
      <Image
        source={require('../assets/main-pg-bg-shape.png')}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          zIndex: 0,
          width: '100%',
          opacity: isDark ? 0.3 : 1,
        }}
        resizeMode="cover"
      />
      <View style={{ paddingTop: 40 }}>
        <Text
          style={{
            marginBottom: 24,
            marginTop: 8,
            textAlign: 'center',
            fontSize: 18,
            fontWeight: 'bold',
            color: themeColors.primaryText,
          }}
        >
          MIND MATE
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: themeColors.background,
        }}
      >
        <View
          style={{
            flex: 1,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            backgroundColor: themeColors.background,
            paddingHorizontal: 24,
            paddingBottom: 24,
          }}
        >
          <View style={{ marginBottom: 32, marginTop: 32, position: 'relative' }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: themeColors.primary,
              }}
            >
              {t.landing.welcome}
            </Text>
            <Text
              style={{
                marginTop: 4,
                fontSize: 20,
                fontWeight: 'bold',
                color: themeColors.text,
              }}
            >
              {userName || '사용자'}님!
            </Text>
            <Text
              style={{
                marginTop: 4,
                fontSize: 16,
                fontWeight: 'bold',
                color: themeColors.primary,
              }}
            >
              {t.landing.subtitle}
            </Text>
            <Image
              style={{
                position: 'absolute',
                bottom: 32,
                right: 0,
                zIndex: 20,
                height: 40,
                width: 40,
              }}
              source={require('../assets/winking-face-png.png')}
            />
            <Image
              style={{
                position: 'absolute',
                bottom: 8,
                right: 40,
                zIndex: 20,
                height: 80,
                width: 80,
              }}
              source={require('../assets/grinning.png')}
            />
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            {menuItems.map((item, index) => (
              <FadeInView
                key={index}
                delay={index * 150}
                style={{
                  marginBottom: 12,
                  width: '47%',
                  aspectRatio: 1,
                }}
              >
                <TouchableOpacity
                  onPress={() => handlePress(item.route)}
                  activeOpacity={0.8}
                  style={{
                    height: '100%',
                    padding: 16,
                    backgroundColor: isDark ? themeColors.surface : item.backgroundColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                    shadowColor: themeColors.shadow,
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: isDark ? 0.3 : 0.1,
                    shadowRadius: 4,
                    elevation: 5,
                  }}
                >
                  <View style={{ marginBottom: 8 }}>{item.icon}</View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: 'bold',
                      color: isDark
                        ? themeColors.text
                        : item.backgroundColor === '#576BCD'
                          ? '#FFFFFF'
                          : '#576BCD',
                      textAlign: 'center',
                    }}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              </FadeInView>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
