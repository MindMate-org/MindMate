import { Users } from 'lucide-react-native';
import React, { useMemo, useCallback, memo } from 'react';
import { FlatList, View, Text, RefreshControl, ListRenderItem } from 'react-native';

import { useThemeColors } from '../../../components/providers/theme-provider';
import { useI18n } from '../../../hooks/use-i18n';
import { useQuery } from '../../../hooks/use-query';
import { useDebouncedSearch } from '../../../hooks/use-debounced-search';

import AddressBookItem from './address-book-item';
import FadeInView from '../../../components/ui/fade-in-view';
import LoadingState from '../../../components/ui/loading-state';
import ErrorState from '../../../components/ui/error-state';
import { AddressBookService } from '../services';
import { ContactType } from '../types/address-book-type';
import { ContactWithTagsType } from '../../../types/address-book-enhanced';

interface AddressBookListProps {
  searchText?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

// 최적화된 리스트 아이템 컴포넌트
const OptimizedAddressBookItem = memo<{
  contact: ContactWithTagsType;
  onRefresh: () => void;
}>(({ contact, onRefresh }) => (
  <FadeInView delay={0} duration={300}>
    <AddressBookItem contact={contact} refetch={onRefresh} />
  </FadeInView>
));

OptimizedAddressBookItem.displayName = 'OptimizedAddressBookItem';

const AddressBookList = ({ searchText, onRefresh, isRefreshing }: AddressBookListProps) => {
  const { theme: themeColors } = useThemeColors();
  const { t } = useI18n();
  
  // 디바운스된 검색어 사용
  const debouncedSearchText = useDebouncedSearch(searchText || '', { 
    delay: 300, 
    minLength: 0 
  });

  // 새로운 useQuery 훅 사용
  const {
    data: rawContacts,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ContactWithTagsType[]>(
    ['address-book-contacts'],
    async () => {
      const contacts = await AddressBookService.fetchGetOthersContacts();
      // 각 연락처의 태그 정보 가져오기
      const contactsWithTags = await Promise.all(
        contacts.map(async (contact) => {
          try {
            const tags = await AddressBookService.fetchGetContactTags(contact.id);
            return { ...contact, tags: tags || [] };
          } catch (error) {
            console.error(`Failed to fetch tags for contact ${contact.id}:`, error);
            return { ...contact, tags: [] };
          }
        })
      );
      return contactsWithTags;
    },
    {
      staleTime: 5 * 60 * 1000, // 5분간 fresh
      cacheTime: 10 * 60 * 1000, // 10분간 캐시
      retry: 3,
      refetchOnWindowFocus: false,
    }
  );

  // 검색 및 정렬 최적화
  const processedContacts = useMemo(() => {
    if (!rawContacts) return [];
    
    let filtered = rawContacts;
    
    // 검색 필터링
    if (debouncedSearchText.trim()) {
      const lowercaseSearchText = debouncedSearchText.toLowerCase();
      filtered = rawContacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(lowercaseSearchText) ||
          contact.phone_number.includes(debouncedSearchText) ||
          contact.memo?.toLowerCase().includes(lowercaseSearchText),
      );
    }
    
    // 이름 순으로 정렬
    return filtered.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }, [rawContacts, debouncedSearchText]);

  // 새로고침 핸들러
  const handleRefresh = useCallback(() => {
    refetch();
    onRefresh?.();
  }, [refetch, onRefresh]);

  // FlatList 렌더링 최적화
  const renderItem: ListRenderItem<ContactWithTagsType> = useCallback(
    ({ item }) => (
      <OptimizedAddressBookItem contact={item} onRefresh={handleRefresh} />
    ),
    [handleRefresh]
  );

  const keyExtractor = useCallback(
    (item: ContactWithTagsType) => item.id.toString(),
    []
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 80, // 대략적인 아이템 높이
      offset: 80 * index,
      index,
    }),
    []
  );

  // 에러 상태 처리
  if (isError) {
    return (
      <ErrorState
        message={error?.message || t.common.error}
        onRetry={handleRefresh}
      />
    );
  }

  // 로딩 상태 처리
  if (isLoading && !rawContacts) {
    return <LoadingState message={t.addressBook.contacts + " " + t.common.loading} />;
  }

  if (!rawContacts) return null;

  // 검색 결과가 없는 경우
  if (processedContacts.length === 0 && debouncedSearchText.trim()) {
    return (
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16
      }}>
        <Users size={48} color={themeColors.primary} />
        <Text style={{
          marginTop: 16,
          textAlign: 'center',
          fontSize: 18,
          color: themeColors.text
        }}>
          {t.locale.startsWith('en') 
            ? `${t.addressBook.noSearchResults} "${debouncedSearchText}"` 
            : `"${debouncedSearchText}"${t.addressBook.noSearchResults}`}
        </Text>
        <Text style={{
          marginTop: 8,
          textAlign: 'center',
          fontSize: 14,
          color: themeColors.textSecondary
        }}>{t.addressBook.tryDifferentSearch}</Text>
      </View>
    );
  }

  // 연락처가 없는 경우
  if (processedContacts.length === 0) {
    return (
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16
      }}>
        <Users size={48} color={themeColors.primary} />
        <Text style={{
          marginTop: 16,
          textAlign: 'center',
          fontSize: 18,
          color: themeColors.primary
        }}>{t.addressBook.noContacts}</Text>
        <Text style={{
          marginTop: 8,
          textAlign: 'center',
          fontSize: 14,
          color: themeColors.textSecondary
        }}>
          {t.addressBook.addFirstContact}
        </Text>
      </View>
    );
  }

  // 최적화된 FlatList 렌더링
  return (
    <FlatList
      data={processedContacts}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 100, // 하단 여백
        gap: 12,
      }}
      refreshControl={
        <RefreshControl
          refreshing={isLoading || Boolean(isRefreshing)}
          onRefresh={handleRefresh}
          tintColor={themeColors.primary}
          colors={[themeColors.primary]}
        />
      }
      removeClippedSubviews={true} // 성능 최적화
      maxToRenderPerBatch={10} // 배치당 렌더링할 최대 아이템 수
      updateCellsBatchingPeriod={50} // 배치 업데이트 간격
      windowSize={10} // 뷰포트 크기
      initialNumToRender={20} // 초기 렌더링할 아이템 수
    />
  );
};

export default AddressBookList;
