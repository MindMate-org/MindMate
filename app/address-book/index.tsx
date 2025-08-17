import { useRouter, useFocusEffect } from 'expo-router';
import { Settings, UserPlus } from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import { View, SafeAreaView, Text, TouchableOpacity } from 'react-native';

import FadeInView from '../../src/components/ui/fade-in-view';
import SearchInput from '../../src/components/ui/search-input';
import AddressBookList from '../../src/features/address-book/components/address-book-list';
import AddressBookSelfItem from '../../src/features/address-book/components/address-book-self-item';

const AddressBook = () => {
  const [searchText, setSearchText] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  // 페이지 포커스 시 새로고침
  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prev) => prev + 1);
    }, []),
  );

  const handleAddPress = () => {
    router.push('/address-book/edit/new');
  };

  return (
    <SafeAreaView className="flex-1 bg-turquoise">
      {/* 헤더 */}
      <FadeInView>
        <View className="flex-row items-center justify-between bg-turquoise px-4 pb-4 pt-2">
          <Text className="text-xl font-bold text-paleCobalt">연락처</Text>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            className="rounded-full bg-white/10 p-2"
          >
            <Settings size={20} color="#576BCD" />
          </TouchableOpacity>
        </View>
      </FadeInView>

      {/* 고정 영역들 */}
      <FadeInView delay={200}>
        <View className="bg-turquoise px-4 pb-4">
          <AddressBookSelfItem key={refreshKey} />
          <View className="mt-4">
            <SearchInput value={searchText} onChange={setSearchText} placeholder="연락처 검색..." />
          </View>
        </View>
      </FadeInView>

      {/* 스크롤 가능한 영역 */}
      <FadeInView delay={400}>
        <View className="flex-1 bg-turquoise">
          <AddressBookList searchText={searchText} key={refreshKey} />
        </View>
      </FadeInView>

      {/* 추가하기 버튼 */}
      <TouchableOpacity
        onPress={handleAddPress}
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-paleCobalt shadow-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
          elevation: 8,
        }}
      >
        <UserPlus size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AddressBook;
