import { Users } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { useCallback } from 'react';
import { ScrollView, View, Text } from 'react-native';

import AddressBookItem from './address-book-item';
import FadeInView from '../../../components/ui/fade-in-view';
import LoadingState from '../../../components/ui/loading-state';
import { useAsyncDataGet } from '../../../hooks/use-async-data-get';
import { AddressBookService } from '../services';
import { ContactType } from '../types/address-book-type';

import { useFocusPage } from '@/src/hooks/use-focus-page';

interface AddressBookListProps {
  searchText?: string;
}

const AddressBookList = ({ searchText }: AddressBookListProps) => {
  const getOthersContactsUseCallBack = useCallback(
    () => AddressBookService.fetchGetOthersContacts(),
    [],
  );
  const {
    data,
    refetch,
    loading: isLoading,
  } = useAsyncDataGet<ContactType[]>(getOthersContactsUseCallBack);
  // 페이지 포커스 시 자동 새로고침 제거 (무한 로딩 방지)
  // useFocusPage(refetch);

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

  if (isLoading) {
    return <LoadingState message="연락처를 불러오는 중..." />;
  }

  if (!data) return null;

  if (sortedContacts.length === 0 && searchText?.trim()) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Users size={48} color="#576BCD" />
        <Text className="mt-4 text-center text-lg text-paleCobalt">
          "{searchText}"에 대한 검색 결과가 없습니다.
        </Text>
        <Text className="text-gray-600 mt-2 text-center text-sm">다른 검색어를 시도해보세요.</Text>
      </View>
    );
  }

  if (sortedContacts.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Users size={48} color="#576BCD" />
        <Text className="mt-4 text-center text-lg text-paleCobalt">아직 연락처가 없습니다</Text>
        <Text className="text-gray-600 mt-2 text-center text-sm">
          + 버튼을 눌러 첫 연락처를 추가해보세요.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="flex-col gap-3 px-4 pb-24 pt-2">
        {sortedContacts.map((contact, index) => (
          <FadeInView key={contact.id} delay={index * 100} duration={500}>
            <AddressBookItem contact={contact} refetch={refetch} />
          </FadeInView>
        ))}
      </View>
    </ScrollView>
  );
};

export default AddressBookList;
