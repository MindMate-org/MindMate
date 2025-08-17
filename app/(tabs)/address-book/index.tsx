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
  const router = useRouter();
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();

  const handleAddPress = () => {
    router.push('/address-book/edit/new');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? themeColors.background : '#F0F3FF', paddingBottom: 20 }}>
      {/* 고정 영역들 */}
      <View style={{ backgroundColor: isDark ? themeColors.background : '#F0F3FF', paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 }}>
        <AddressBookSelfItem />
        <View style={{ marginTop: 16 }}>
          <SearchInput 
            value={searchText} 
            onChange={setSearchText} 
            placeholder={t.addressBook.searchPlaceholder} 
          />
        </View>
      </View>

      {/* 스크롤 가능한 영역 */}
      <View style={{ flex: 1, backgroundColor: isDark ? themeColors.background : '#F0F3FF' }}>
        <AddressBookList searchText={searchText} />
      </View>

      {/* 추가하기 버튼 */}
      <AddButton onPress={handleAddPress} />
    </SafeAreaView>
  );
};

export default AddressBook;
