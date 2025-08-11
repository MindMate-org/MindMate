import { Plus } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import ActionMenu from './action-menu';
import { formTextStyle } from '../constants/style-class-constants';
import { AddressBookService } from '../services';
import { ContactType, TagType } from '../types/address-book-type';

import BottomModal from '@/src/components/ui/bottom-modal';
import Button from '@/src/components/ui/button';
import { useAsyncDataGet } from '@/src/hooks/use-async-data-get';

const EditAddressBookTagButton = ({
  refetch,
  contact,
}: {
  refetch: () => void;
  contact: ContactType;
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    refetch();
  }, [isModalVisible]);

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        className="rounded-full bg-turquoise px-2 py-0.5"
        style={{ minWidth: 24, minHeight: 24, justifyContent: 'center', alignItems: 'center' }}
      >
        <Plus size={16} color="#4A90E2" />
      </TouchableOpacity>
      {isModalVisible && (
        <SelectAddressBookTagModal
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          refetchItemTags={refetch}
          contact={contact}
        />
      )}
    </>
  );
};

const SelectAddressBookTagModal = ({
  isModalVisible,
  setIsModalVisible,
  refetchItemTags,
  contact,
}: {
  isModalVisible: boolean;
  setIsModalVisible: (isModalVisible: boolean) => void;
  refetchItemTags: () => void;
  contact: ContactType;
}) => {
  const [isActionMenuVisible, setIsActionMenuVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [tagState, setTagState] = useState<TagType | null>(null);
  const [isEditTag, setIsEditTag] = useState(false);

  const getAllTagsUseCallback = useCallback(() => AddressBookService.fetchGetTags(), []);
  const { data: allTags, refetch: refetchAllTags } = useAsyncDataGet(getAllTagsUseCallback);

  const getContactTagsUseCallback = useCallback(() => AddressBookService.fetchGetContactTags(contact.id), [contact.id]);
  const { data: contactTags, refetch: refetchContactTags } =
    useAsyncDataGet(getContactTagsUseCallback);

  const refetch = useCallback(async () => {
    await refetchAllTags();
    await refetchContactTags();
    await refetchItemTags();
  }, [refetchAllTags, refetchContactTags, refetchItemTags]);

  const handleTag = async (tag: TagType) => {
    //태그편집
    if (isEditTag) {
      setIsActionMenuVisible(true);
      setTagState(tag);
      // refetch();
    }
    //태그선택
    if (!isEditTag) {
      const isHasTag = contactTags?.some((t) => t.id === tag.id);
      console.log('Contact has tag:', isHasTag, 'Tag:', tag.name);
      if (!isHasTag) {
        await AddressBookService.fetchAddTagToContact(contact.id, tag.id);
      }
      if (isHasTag) {
        await AddressBookService.fetchRemoveTagFromContact(contact.id, tag.id);
      }
      refetch();
    }
  };

  const handleEditTag = () => {
    setIsEditModalVisible(true);
  };

  return (
    <BottomModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible}>
      <View className="gap-10 p-4">
        <View className="flex-row flex-wrap gap-1">
          {allTags?.map((tag) => {
            const isSelected = contactTags?.some((t) => t.id === tag.id);
            return (
              <TouchableOpacity key={tag.id} onPress={() => handleTag(tag)}>
                <View
                  className={`rounded-full px-3 py-1 ${isSelected ? 'bg-paleCobalt' : 'bg-gray-200'}`}
                >
                  <Text
                    className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}
                  >
                    {tag.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <Button onPress={() => setIsEditTag(!isEditTag)}>
          <Text className="text-ss color-white">
            {isEditTag ? '태그 목록 수정완료' : '태그 목록 수정하기'}
          </Text>
        </Button>
      </View>
      {isActionMenuVisible && (
        <ActionMenu
          isVisible={isActionMenuVisible}
          onClose={() => setIsActionMenuVisible(false)}
          onEdit={handleEditTag}
          onDelete={() => {}}
        />
      )}
      {isEditModalVisible && tagState && (
        <EditAddressBookTagModal
          isModalVisible={isEditModalVisible}
          setIsModalVisible={setIsEditModalVisible}
          refetch={refetch}
          tag={tagState}
        />
      )}
    </BottomModal>
  );
};

const EditAddressBookTagModal = ({
  isModalVisible,
  setIsModalVisible,
  tag,
  refetch,
}: {
  isModalVisible: boolean;
  setIsModalVisible: (isModalVisible: boolean) => void;
  tag: TagType;
  refetch: () => void;
}) => {
  const [text, setText] = useState(tag.name || '');

  const handleEditTag = async () => {
    await AddressBookService.fetchUpdateTag(tag.id, { name: text });
    setIsModalVisible(false);
    refetch();
  };

  // const deleteTag = async () => {
  //   await
  //   setIsModalVisible(false);
  //   refetch();
  // };

  return (
    <BottomModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible}>
      <View className="gap-10 p-4">
        <TextInput
          className={`${formTextStyle} text-lg`}
          value={text}
          onChangeText={setText}
          placeholder={tag.name || '태그 이름을 입력해주세요.'}
        />
      </View>
      <Button onPress={handleEditTag}>
        <Text className="text-ss color-white">태그 수정완료</Text>
      </Button>
    </BottomModal>
  );
};

export default EditAddressBookTagButton;
