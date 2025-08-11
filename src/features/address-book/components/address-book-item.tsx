import { useRouter } from 'expo-router';
import { EllipsisVertical } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

import ActionMenu from './action-menu';
import AddressBookContent from './address-book-content';
import AddressBookImage from './address-book-image';
import AddressBookName from './address-book-name';
import AddressBookTag from './address-book-tag';
import CallButton from './call-button';
import EditAddressBookTagButton from './edit-address-book-tag-button';
import MessageButton from './message-button';
import { useAsyncDataGet } from '../../../hooks/use-async-data-get';
import { getAllTags, getContactTags } from '../services/get-tag-data';
import { fetchDeleteContact } from '../services/mutation-contact-data';
import { Contact } from '../types/address-book-type';

const AddressBookItem = ({ contact, refetch }: { contact: Contact; refetch: () => void }) => {
  const router = useRouter();
  const [isActionMenuVisible, setIsActionMenuVisible] = useState(false);
  const getContactTagsUseCallBack = useCallback(() => getContactTags(contact.id), [contact.id]);
  const { data: tags, refetch: refetchTags } = useAsyncDataGet(getContactTagsUseCallBack);

  const refetchForEditTags = useCallback(() => {
    refetchTags();
    refetch();
  }, [refetchTags, refetch]);

  useEffect(() => {
    getAllTags().then((tags) => {
      console.log(tags);
    });
  }, [tags]);

  const handleEdit = () => {
    router.push(`/address-book/edit/${contact.id}`);
  };

  const handleDelete = () => {
    fetchDeleteContact(contact.id.toString());
    setIsActionMenuVisible(false);
    refetch();
  };

  return (
    <View className="relative mb-2 rounded-xl bg-white p-4 shadow-sm">
      <TouchableOpacity onPress={handleEdit} className="relative">
        {/* 상단: 태그와 메뉴 */}
        <View className="mb-3 flex-row items-start justify-between">
          <View className="flex-1 flex-row flex-wrap gap-1">
            {tags?.map((tag) => <AddressBookTag key={tag.id}>{tag.name}</AddressBookTag>)}
            <EditAddressBookTagButton refetch={refetchForEditTags} contact={contact} />
          </View>
          <TouchableOpacity onPress={() => setIsActionMenuVisible(true)} className="ml-2 p-1">
            <EllipsisVertical size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* 메인 콘텐츠 */}
        <View className="flex-row items-center">
          {/* 프로필 이미지 */}
          <View className="mr-4">
            <AddressBookImage image={contact.profile_image} id={contact.id.toString()} />
          </View>

          {/* 연락처 정보 */}
          <View className="flex-1">
            <AddressBookName>{contact.name}</AddressBookName>
            <Text className="mb-2 text-sm text-gray">{contact.phone_number}</Text>

            {contact.memo && <AddressBookContent>{contact.memo}</AddressBookContent>}

            {/* 액션 버튼들 */}
            <View className="mt-3 flex-row gap-2">
              <CallButton phoneNumber={contact.phone_number} />
              <MessageButton phoneNumber={contact.phone_number} />
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* 액션 메뉴 */}
      {isActionMenuVisible && (
        <ActionMenu
          isVisible={isActionMenuVisible}
          onClose={() => setIsActionMenuVisible(false)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </View>
  );
};

export default AddressBookItem;

{
  /* 라벨 들어갈 위치 */
}
