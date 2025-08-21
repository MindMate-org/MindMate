import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, SafeAreaView } from 'react-native';

import AddButton from '../../../src/components/ui/add-button';
import SearchInput from '../../../src/components/ui/search-input';
import { useThemeColors } from '../../../src/components/providers/theme-provider';
import { useI18n } from '../../../src/hooks/use-i18n';
import AddressBookList from '../../../src/features/address-book/components/address-book-list';
import AddressBookSelfItem from '../../../src/features/address-book/components/address-book-self-item';

const AddressBook = () => {
  const [searchText, setSearchText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();

  const handleAddPress = () => {
    router.push('/address-book/edit/new');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // 추가적인 새로고침 로직이 있다면 여기에
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background, paddingBottom: 20 }}>
      {/* 고정 영역들 */}
      <View
        style={{
          backgroundColor: themeColors.background,
          paddingHorizontal: 16,
          paddingBottom: 16,
          paddingTop: 16,
        }}
      >
        <AddressBookSelfItem />
        <View style={{ marginTop: 16 }}>
          <SearchInput
            value={searchText}
            onChange={setSearchText}
            placeholder={t.addressBook.searchPlaceholder}
          />
        </View>
      </View>

      {/* 스크롤 가능한 영역 - 최적화된 FlatList */}
      <View style={{ flex: 1, backgroundColor: themeColors.background }}>
        <AddressBookList
          searchText={searchText}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      </View>

      {/* 추가하기 버튼 */}
      <AddButton onPress={handleAddPress} />
    </SafeAreaView>
  );
};

export default AddressBook;
