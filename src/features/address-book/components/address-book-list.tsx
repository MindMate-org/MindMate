import React, { useMemo } from 'react';
import { useCallback } from 'react';
import { ScrollView, View, Text } from 'react-native';

import AddressBookItem from './address-book-item';
import { useAsyncDataGet } from '../../../hooks/use-async-data-get';
import { AddressBookService } from '../services';
import { ContactType } from '../types/address-book-type';

import { useFocusPage } from '@/src/hooks/use-focus-page';

interface AddressBookListProps {
  searchText?: string;
}

const AddressBookList = ({ searchText }: AddressBookListProps) => {
  const getOthersContactsUseCallBack = useCallback(() => AddressBookService.fetchGetOthersContacts(), []);
  const { data, refetch } = useAsyncDataGet<ContactType[]>(getOthersContactsUseCallBack);
  useFocusPage(refetch);

  // 검색 필터링 - 검색어를 미리 소문자로 변환하여 성능 최적화
  const filteredContacts = useMemo(() => {
    if (!data) return [];
    if (!searchText?.trim()) return data;

    const lowercaseSearchText = searchText.toLowerCase();
    return data.filter(
      (contact) =>
        contact.name.toLowerCase().includes(lowercaseSearchText) ||
        contact.phone_number.includes(searchText) ||
        contact.memo?.toLowerCase().includes(lowercaseSearchText),
    );
  }, [data, searchText]);

  // 이름 순으로 정렬
  const sortedContacts = useMemo(() => {
    return [...filteredContacts].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }, [filteredContacts]);

  if (!data) return null;

  if (sortedContacts.length === 0 && searchText?.trim()) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-center text-lg text-paleCobalt">
          &ldquo;{searchText}&rdquo;에 대한 검색 결과가 없습니다.
        </Text>
        <Text className="mt-2 text-center text-sm text-gray">다른 검색어를 시도해보세요.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="flex-col gap-3 px-4 pb-24 pt-2">
        {sortedContacts.map((contact) => {
          return <AddressBookItem key={contact.id} contact={contact} refetch={refetch} />;
        })}
      </View>
    </ScrollView>
  );
};

export default AddressBookList;
