import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { createNoteItem, updateNoteItem } from '../services/mutation-note-group-data';
import { NoteItem } from '../types/address-book-type';

import BottomModal from '@/src/components/ui/bottom-modal';
import Button from '@/src/components/ui/button';
import { useThemeColors } from '@/src/components/providers/theme-provider';

const EditContactDetailGroupItemModal = ({
  isModalVisible,
  setIsModalVisible,
  groupId,
  item,
  refetch,
}: {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  groupId: number;
  item?: NoteItem;
  refetch: () => void;
}) => {
  const [title, setTitle] = useState(item?.title || '');
  const [content, setContent] = useState(item?.content || '');
  const { theme: themeColors, isDark } = useThemeColors();

  const handleEditContactDetailGroupItem = async () => {
    if (item) {
      await updateNoteItem(item.item_id.toString(), {
        group_id: item.group_id,
        title,
        content,
      });
      refetch();
    } else {
      await createNoteItem(groupId.toString(), title, content);
      refetch();
    }
  };

  const inputStyle = {
    borderBottomWidth: 2,
    borderBottomColor: themeColors.border,
    borderRadius: 6,
    padding: 8,
    fontWeight: 'bold' as const,
    fontSize: 16,
    backgroundColor: themeColors.surface,
    color: themeColors.text,
    marginBottom: 12,
  };

  return (
    <BottomModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible}>
      <View className="w-full px-10 pb-2 pt-4">
        <TextInput
          style={inputStyle}
          value={title}
          onChangeText={setTitle}
          placeholder={item?.title || '제목을 입력하세요'}
          placeholderTextColor={themeColors.textSecondary}
        />
        <TextInput
          style={inputStyle}
          value={content}
          onChangeText={setContent}
          placeholder={item?.content || '설명을 입력하세요'}
          placeholderTextColor={themeColors.textSecondary}
        />
      </View>
      <View className="w-full px-10 pb-4">
        <Button onPress={handleEditContactDetailGroupItem}>
          <Text>{item ? '수정하기' : '목록추가'}</Text>
        </Button>
      </View>
    </BottomModal>
  );
};

export default EditContactDetailGroupItemModal;
