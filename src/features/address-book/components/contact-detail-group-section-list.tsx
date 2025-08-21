import { EllipsisVertical } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import ActionMenu from './action-menu';
import EditContactDetailGroupItemModal from './edit-contact-detail-group-item-modal';
import EditContactDetailGroupModal from './edit-contact-detail-group-modal';
import { getNoteGroupsByContactId } from '../services/get-note-group-data';
import { getNoteItemsByGroupId } from '../services/get-note-group-data';
import { deleteNoteGroup, deleteNoteItem } from '../services/mutation-note-group-data';
import { NoteGroupType, NoteItemType } from '../types/address-book-type';

import Button from '@/src/components/ui/button';
import CommonBox from '@/src/components/ui/common-box';
import { useThemeColors } from '@/src/components/providers/theme-provider';
import { useAsyncDataGet } from '@/src/hooks/use-async-data-get';

const ContactDetailGroupSectionList = ({
  id,
  isModalVisible,
}: {
  id: string;
  isModalVisible: boolean;
}) => {
  const getNoteGroupsByContactIdCallback = useCallback(async () => {
    const data = await getNoteGroupsByContactId(id);
    return data;
  }, [id]);
  const { data, refetch: allGroupRefetch } = useAsyncDataGet<NoteGroupType[]>(
    getNoteGroupsByContactIdCallback,
    false, // 캐시 비활성화
  );

  useEffect(() => {
    allGroupRefetch();
  }, [isModalVisible]);

  if (!data || !Array.isArray(data)) return null;
  return (
    <ScrollView style={{ flex: 1 }}>
      {data.map((groupInfo) => {
        return (
          <ContactDetailGroupList
            key={groupInfo.group_id}
            group={groupInfo}
            refetch={allGroupRefetch}
          />
        );
      })}
    </ScrollView>
  );
};

const ContactDetailGroupList = ({
  group,
  refetch,
}: {
  group: NoteGroupType;
  refetch: () => void;
}) => {
  const { theme: themeColors } = useThemeColors();
  const getNoteItemsByGroupIdCallback = useCallback(async () => {
    const data = await getNoteItemsByGroupId(group.group_id.toString());
    return data;
  }, [group.group_id]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isActionMenuVisible, setIsActionMenuVisible] = useState(false);

  const { data, refetch: noteItemRefetch } = useAsyncDataGet<NoteItemType[]>(
    getNoteItemsByGroupIdCallback,
    false, // 캐시 비활성화
  );
  const handleDeleteContactDetailGroup = async () => {
    await deleteNoteGroup(group.group_id.toString());
    refetch();
    setIsModalVisible(false);
  };

  return (
    <View style={{ gap: 8, padding: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            marginBottom: 8,
            fontSize: 14,
            fontWeight: '400',
            color: themeColors.text,
          }}
        >
          {group.title}
        </Text>
        <TouchableOpacity onPress={() => setIsActionMenuVisible(true)}>
          <EllipsisVertical size={20} color={themeColors.textSecondary} />
        </TouchableOpacity>
      </View>
      {data && Array.isArray(data)
        ? data.map((item) => {
            return (
              <ContactDetailGroupItem key={item.item_id} item={item} refetch={noteItemRefetch} />
            );
          })
        : null}
      <AddContactDetailGroupItemButton refetch={noteItemRefetch} group={group} />
      {isModalVisible && (
        <EditContactDetailGroupModal
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          group={group}
          refetch={refetch}
        />
      )}

      {isActionMenuVisible && (
        <ActionMenu
          isVisible={isActionMenuVisible}
          onClose={() => setIsActionMenuVisible(false)}
          onEdit={() => {
            setIsModalVisible(true);
          }}
          onDelete={handleDeleteContactDetailGroup}
        />
      )}
    </View>
  );
};

const AddContactDetailGroupItemButton = ({
  refetch,
  group,
}: {
  refetch: () => void;
  group: NoteGroupType;
}) => {
  const { theme: themeColors } = useThemeColors();
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <>
      <Button onPress={() => setIsModalVisible(true)}>
        <Text style={{ color: themeColors.primaryText }}>+추가하기</Text>
      </Button>
      {isModalVisible && (
        <EditContactDetailGroupItemModal
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          groupId={group.group_id}
          refetch={refetch}
        />
      )}
    </>
  );
};

const ContactDetailGroupItem = ({ item, refetch }: { item: NoteItemType; refetch: () => void }) => {
  const { theme: themeColors } = useThemeColors();
  const [isActionMenuVisible, setIsActionMenuVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const handleDeleteContactDetailGroupItem = async () => {
    await deleteNoteItem(item.item_id.toString());
    refetch();
  };

  //모달이 꺼졌을때 리패치 처리
  useEffect(() => {
    if (!isEditModalVisible) {
      refetch();
    }
  }, [isEditModalVisible]);

  return (
    <CommonBox>
      <View style={{ gap: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: themeColors.text,
            }}
          >
            {item.title}
          </Text>
          <TouchableOpacity onPress={() => setIsActionMenuVisible(true)}>
            <EllipsisVertical size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '400',
            color: themeColors.text,
          }}
        >
          {item.content}
        </Text>
      </View>
      {isActionMenuVisible && (
        <ActionMenu
          isVisible={isActionMenuVisible}
          onClose={() => setIsActionMenuVisible(false)}
          onEdit={() => {
            setIsEditModalVisible(true);
          }}
          onDelete={handleDeleteContactDetailGroupItem}
        />
      )}
      {isEditModalVisible && (
        <EditContactDetailGroupItemModal
          isModalVisible={isEditModalVisible}
          setIsModalVisible={setIsEditModalVisible}
          groupId={item.group_id}
          item={item}
          refetch={refetch}
        />
      )}
    </CommonBox>
  );
};

export default ContactDetailGroupSectionList;
