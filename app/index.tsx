import { router } from 'expo-router';
import { BookOpen, Clock, Search, RefreshCcw, UserRound } from 'lucide-react-native';
import { Text, View, TouchableOpacity, Image } from 'react-native';

import { Colors } from '../src/constants/colors';

export default function HomeScreen() {
  const menuItems = [
    {
      title: '일기 쓰기',
      route: '/(tabs)/diary',
      icon: <BookOpen color={Colors.paleCobalt} size={64} />,
      color: 'bg-teal',
    },
    {
      title: '일정 보기',
      route: '/schedule',
      icon: <Clock color={Colors.paleCobalt} size={64} />,
      color: 'bg-paleYellow',
    },
    {
      title: '물건 찾기',
      route: '/search',
      icon: <Search color={Colors.paleCobalt} size={64} />,
      color: 'bg-pink',
    },
    {
      title: '루틴 보기',
      route: '/(tabs)/routine',
      icon: <RefreshCcw color={Colors.paleCobalt} size={64} />,
      color: 'bg-foggyBlue',
    },
    {
      title: '연락처 보기',
      route: '/address-book',
      icon: <UserRound color={Colors.paleCobalt} size={64} />,
      color: 'bg-white',
    },
    {
      title: '설정',
      route: '/address-book',
      icon: <UserRound color={Colors.foggyBlue} size={64} />,
      color: 'bg-paleCobalt',
    },
  ];

  const handlePress = (route: string) => {
    router.push(route);
  };

  return (
    <View className="relative flex-1 bg-paleCobalt">
      <Image
        source={require('../assets/main-pg-bg-shape.png')}
        className="absolute bottom-0 left-0 z-0 w-full"
        resizeMode="cover"
      />
      <View className="pt-safe">
        <Text className="mb-6 mt-8 text-center text-lg font-bold text-white">MIND MATE</Text>
      </View>

      <View className="flex-1 justify-end rounded-t-3xl bg-foggyBlue">
        <View className="flex-1 rounded-t-2xl bg-turquoise px-6 pb-6">
          <View className="mb-8 mt-8">
            <Text className="text-md font-bold text-paleCobalt">안녕하세요</Text>
            <Text className="mt-1 text-xl font-bold text-black">김유저님!</Text>
            <Text className="mt-1 text-md font-bold text-paleCobalt">
              오늘 하루도 기운차게 시작해봐요!
            </Text>
            <Image
              className="absolute bottom-8 right-0 z-20 h-10 w-10"
              source={require('../assets/winking-face-png.png')}
            />
            <Image
              className="absolute bottom-2 right-10 z-20 h-20 w-20"
              source={require('../assets/grinning.png')}
            />
          </View>
          <View className="flex-1 flex-row flex-wrap justify-between">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                className={`aspect-square w-[47%] gap-3 p-4 ${item.color} mb-3 items-center justify-center rounded-xl shadow-dropShadow`}
                onPress={() => handlePress(item.route)}
              >
                <View className="mb-1">{item.icon}</View>
                <Text
                  className={`text-sm font-bold ${
                    item.title === '설정' ? 'text-foggyBlue' : 'text-paleCobalt'
                  }`}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}