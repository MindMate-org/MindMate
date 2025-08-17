import { router } from 'expo-router';
import { BookOpen, Clock, Search, RefreshCcw, UserRound, Settings } from 'lucide-react-native';
import { Text, View, TouchableOpacity, Image } from 'react-native';

import FadeInView from '../src/components/ui/fade-in-view';
import { useThemeColors } from '../src/components/providers/theme-provider';
import { useI18n } from '../src/hooks/use-i18n';
import { Colors } from '../src/constants/colors';

export default function HomeScreen() {
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
  
  const menuItems = [
    {
      title: t.landing.writeDiary,
      route: '/(tabs)/diary',
      icon: <BookOpen color={themeColors.primary} size={64} />,
      backgroundColor: '#14b8a6',
    },
    {
      title: t.landing.viewSchedule,
      route: '/schedule',
      icon: <Clock color={themeColors.primary} size={64} />,
      backgroundColor: '#fef3c7',
    },
    {
      title: t.landing.findItems,
      route: '/search',
      icon: <Search color={themeColors.primary} size={64} />,
      backgroundColor: '#fecaca',
    },
    {
      title: t.landing.viewRoutine,
      route: '/(tabs)/routine',
      icon: <RefreshCcw color={themeColors.primary} size={64} />,
      backgroundColor: '#bfdbfe',
    },
    {
      title: t.landing.viewContacts,
      route: '/address-book',
      icon: <UserRound color={themeColors.primary} size={64} />,
      backgroundColor: themeColors.surface,
    },
    {
      title: t.common.settings,
      route: '/settings',
      icon: <Settings color={themeColors.primary} size={64} />,
      backgroundColor: themeColors.surface,
    },
  ];

  const handlePress = (route: string) => {
    router.push(route);
  };

  return (
    <View style={{ position: 'relative', flex: 1, backgroundColor: themeColors.primary }}>
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
        <Text style={{
          marginBottom: 24,
          marginTop: 16,
          textAlign: 'center',
          fontSize: 18,
          fontWeight: 'bold',
          color: themeColors.primaryText,
        }}>MIND MATE</Text>
      </View>

      <View style={{
        flex: 1,
        justifyContent: 'flex-end',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        backgroundColor: themeColors.backgroundSecondary,
      }}>
        <View style={{
          flex: 1,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          backgroundColor: themeColors.background,
          paddingHorizontal: 24,
          paddingBottom: 24,
        }}>
          <View style={{ marginBottom: 32, marginTop: 32, position: 'relative' }}>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: themeColors.primary,
            }}>{t.landing.welcome}</Text>
            <Text style={{
              marginTop: 4,
              fontSize: 20,
              fontWeight: 'bold',
              color: themeColors.text,
            }}>김유저님!</Text>
            <Text style={{
              marginTop: 4,
              fontSize: 16,
              fontWeight: 'bold',
              color: themeColors.primary,
            }}>
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
          <View style={{
            flex: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>
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
                      color: themeColors.text,
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
