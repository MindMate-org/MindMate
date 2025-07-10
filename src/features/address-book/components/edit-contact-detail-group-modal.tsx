import { Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import { createNoteGroup, updateNoteGroup } from '../services/mutation-note-group-data';
import { formTextStyle } from '../constants/style-class-constants';
import Button from '@/src/components/ui/button';
import BottomModal from '@/src/components/ui/bottom-modal';
import { NoteGroup } from '../types/address-book-type';

const EditContactDetailGroupModal = ({
  isModalVisible,
  setIsModalVisible,
  id,
  refetch = () => {},
  group,
}: {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  id?: string;
  refetch: () => void;
  group?: NoteGroup;
}) => {
  const [groupName, setGroupName] = useState(group?.title || '');

  const handleEditContactDetailGroup = async () => {
    if (group) {
      await updateNoteGroup(group.group_id.toString(), { title: groupName });
    }
    if (id) {
      await createNoteGroup(id, groupName);
    }
    await refetch();
    setIsModalVisible(false);
  };

  return (
    <BottomModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible}>
      <View className="w-full px-10 pb-2 pt-4">
        <TextInput
          className={`text-md ${formTextStyle}`}
          value={groupName}
          onChangeText={setGroupName}
          placeholder={group ? group.title : '목록 이름을 입력해주세요.'}
        />
      </View>
      <View className="w-full px-10 pb-4">
        <Button onPress={handleEditContactDetailGroup}>
          <Text>목록{group ? '수정' : '추가'}</Text>
        </Button>
      </View>
    </BottomModal>
  );
};

export default EditContactDetailGroupModal;
