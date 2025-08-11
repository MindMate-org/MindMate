import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, SafeAreaView } from 'react-native';

import AddButton from '../../src/components/ui/add-button';
import SearchInput from '../../src/components/ui/search-input';
import AddressBookList from '../../src/features/address-book/components/address-book-list';
import AddressBookSelfItem from '../../src/features/address-book/components/address-book-self-item';

const AddressBook = () => {
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  const handleAddPress = () => {
    router.push('/address-book/edit/new');
  };

  return (
    <SafeAreaView className="flex-1 bg-turquoise">
      {/* 고정 영역들 */}
      <View className="bg-turquoise px-4 pb-4 pt-2">
        <AddressBookSelfItem />
        <View className="mt-4">
          <SearchInput value={searchText} onChange={setSearchText} placeholder="연락처 검색..." />
        </View>
      </View>

      {/* 스크롤 가능한 영역 */}
      <View className="flex-1 bg-turquoise">
        <AddressBookList searchText={searchText} />
      </View>

      {/* 추가하기 버튼 */}
      <AddButton onPress={handleAddPress} />
    </SafeAreaView>
  );
};

export default AddressBook;
