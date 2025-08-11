import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Camera, ChevronLeft, ChevronRight, MapPin } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { FlatList, Image, Text, useWindowDimensions, View } from 'react-native';
import Toast from 'react-native-toast-message';

import Button from '../../src/components/ui/button';
import { SearchData } from '../../src/features/search/db/search-db-types';
import {
  fetchDeleteSearchById,
  fetchGetMediaById,
  fetchGetSearchById,
} from '../../src/features/search/search-services';
import { getCategoryData } from '../../src/features/search/utils/getCategoryData';
import { deleteAlert } from '../../src/lib/common-alert';
import { MediaFullType } from '../../src/lib/db/share-db-types';

const ItemDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const [items, setItems] = useState<SearchData | null>(null);
  const [media, setMedia] = useState<MediaFullType[]>([]);
  const { width: screenWidth } = useWindowDimensions();

  const itemWidth = screenWidth - 28;

  useFocusEffect(
    useCallback(() => {
      initializeAll();
    }, []),
  );

  const initializeAll = async () => {
    try {
      const [search, media] = await Promise.all([fetchGetSearchById(+id), fetchGetMediaById(+id)]);
      setItems(search);
      setMedia(media);
    } catch (error) {
      alert(`검색 데이터를 가져오는 데 실패했습니다.`);
    }
  };

  // 삭제 로직
  const handleDeleteSearch = async () => {
    try {
      deleteAlert({
        type: 'delete',
        text1: '삭제하시겠습니까?',
        text2: '',
        onPress: deleteSearchWithAlert,
      });
    } catch (error) {
      alert(`검색 데이터를 삭제하는 데 실패했습니다.`);
    }
  };

  const deleteSearchWithAlert = async () => {
    await fetchDeleteSearchById(+id);
    router.back();
    Toast.show({
      type: 'success',
      text1: '삭제가 완료되었습니다.',
    });
  };

  const handleEdit = () => {
    router.push(`/search/search-form?id=${id}`);
  };

  if (items === null)
    return (
      <View className="flex-1 bg-turquoise px-4 py-8">
        <Text>로딩중...</Text>
      </View>
    );

  const { color } = getCategoryData(items.category);
  return (
    <View className="flex-1 justify-between bg-turquoise px-4 py-8">
      <View className="flex">
        <View className="mb-12 w-full flex-row items-center">
          <Text className=" mr-4 text-xl font-bold">{items.name}</Text>
          <View
            className={`h-8 w-24 items-center justify-center rounded-full bg-${color} text-center`}
          >
            <Text className="text-ss">{items.category}</Text>
          </View>
        </View>

        <View className="mb-6">
          {media.length > 0 ? (
            <View>
              <View className="absolute left-4 top-1/2 z-10 items-center justify-center rounded-full bg-paleCobalt">
                <ChevronLeft color="white" />
              </View>
              <View className=" absolute right-4 top-1/2 z-10 items-center justify-center rounded-full bg-paleCobalt">
                <ChevronRight color="white" />
              </View>
              <FlatList
                data={media}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={itemWidth}
                decelerationRate="fast"
                renderItem={({ item }) => (
                  <View
                    style={{ width: itemWidth }}
                    className={`h-[200px] items-center justify-center rounded-xl`}
                  >
                    <Image
                      source={{ uri: item.file_path }}
                      resizeMode="cover"
                      className="h-full w-full rounded-xl"
                    />
                  </View>
                )}
              />
            </View>
          ) : (
            <View className="h-[200px] w-full items-center justify-center rounded-xl bg-foggyBlue">
              <Camera size={44} color="#576bcd" />
            </View>
          )}
        </View>

        <View className="flex-row gap-3">
          <MapPin size={18} color="#576bcd" />
          <Text className="mb-6 text-sm font-bold color-foggyBlue">{items.location}</Text>
        </View>
        <View className="flex-1/3 h-[168px] w-full rounded-xl bg-white p-6 shadow-dropShadow">
          {/* <Text className="mb-6 text-sm font-bold color-foggyBlue">상세 위치</Text> */}
          <Text className=" text-md">{items.description}</Text>
        </View>
      </View>

      <View className="flex-row justify-between gap-4">
        <Button className="w-[240px]" onPress={handleEdit}>
          <Text className="text-lg text-white">수정하기</Text>
        </Button>
        <Button className="flex-1 bg-paleYellow" onPress={handleDeleteSearch}>
          <Text className="text-lg text-black">삭제</Text>
        </Button>
      </View>
    </View>
  );
};

export default ItemDetailScreen;
