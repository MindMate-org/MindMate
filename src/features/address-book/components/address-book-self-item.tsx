import { useRouter } from 'expo-router';
import { User } from 'lucide-react-native';
import React from 'react';
import { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import AddressBookImage from './address-book-image';
import AddressBookName from './address-book-name';
import { useAsyncDataGet } from '../../../hooks/use-async-data-get';
import { AddressBookService } from '../services';
import { Contact } from '../types/address-book-type';

/**
 * 내 정보 표시 컴포넌트
 * @description 현재 사용자의 연락처 정보를 표시하고 편집 기능을 제공합니다.
 * @returns JSX.Element
 */
const AddressBookSelfItem = () => {
  const router = useRouter();
  const getMyContactUseCallBack = useCallback(AddressBookService.fetchGetMyContact, []);
  const { data } = useAsyncDataGet<Contact>(getMyContactUseCallBack);

  const handleEdit = () => {
    if (data) {
      router.push(`/address-book/edit/${data.id}`);
    }
  };

  if (!data) return null;

  return (
    <View className="mb-2 rounded-xl bg-white p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          <View className="mr-4">
            <AddressBookImage image={data.profile_image} id={data.id.toString()} />
          </View>

          <View className="flex-1">
            <View className="mb-1 flex-row items-center">
              <User size={16} color="#6b7280" />
              <Text className="ml-2 text-sm font-medium text-gray">내 정보</Text>
            </View>
            <AddressBookName>{data.name}</AddressBookName>
            <Text className="text-sm text-gray">{data.phone_number}</Text>
          </View>
        </View>

        <TouchableOpacity className="rounded-lg bg-paleCobalt px-4 py-2" onPress={handleEdit}>
          <Text className="text-sm font-medium text-white">편집</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddressBookSelfItem;
