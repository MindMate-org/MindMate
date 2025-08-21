import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { createNoteGroup, updateNoteGroup } from '../services/mutation-note-group-data';
import { NoteGroupType } from '../types/address-book-type';

import { useThemeColors } from '@/src/components/providers/theme-provider';
import BottomModal from '@/src/components/ui/bottom-modal';
import Button from '@/src/components/ui/button';
import { CustomAlertManager } from '@/src/components/ui/custom-alert';
import { useI18n } from '@/src/hooks/use-i18n';

const EditContactDetailGroupModal = ({
  isModalVisible,
  setIsModalVisible,
  id,
  refetch,
  group,
}: {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  id?: string;
  refetch: () => void;
  group?: NoteGroupType;
}) => {
  const [groupName, setGroupName] = useState(group?.title || '');
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
  const isEnglish = t.locale.startsWith('en');

  const handleEditContactDetailGroup = async () => {
    if (!groupName.trim()) {
      CustomAlertManager.error(
        isEnglish ? 'Please enter a list name.' : '목록 이름을 입력해주세요.',
      );
      return;
    }

    try {
      console.log('groupName:', groupName.trim());

      if (group) {
        await updateNoteGroup(group.group_id.toString(), { title: groupName.trim() });
        CustomAlertManager.success(isEnglish ? 'List has been updated.' : '목록이 수정되었습니다.');
      } else if (id && id !== 'new') {
        await createNoteGroup(id, groupName.trim());
        CustomAlertManager.success(isEnglish ? 'List has been added.' : '목록이 추가되었습니다.');
      } else if (id === 'new') {
        CustomAlertManager.error(
          isEnglish
            ? 'Please save the contact first before adding lists.'
            : '목록을 추가하기 전에 먼저 연락처를 저장해주세요.',
        );
        return;
      } else {
        CustomAlertManager.error(
          isEnglish ? 'Missing required parameters.' : '필수 매개변수가 누락되었습니다.',
        );
        return;
      }

      await refetch();
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      CustomAlertManager.error(
        isEnglish
          ? `Failed to save list: ${error instanceof Error ? error.message : String(error)}`
          : `목록 저장 실패: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  return (
    <BottomModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible}>
      <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
        {/* 제목 */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: themeColors.text,
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          {group ? (isEnglish ? 'Edit List' : '목록 수정') : isEnglish ? 'Add List' : '목록 추가'}
        </Text>

        {/* 입력 필드 */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: themeColors.text,
              marginBottom: 8,
            }}
          >
            {isEnglish ? 'List Name' : '목록 이름'}
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: themeColors.border,
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              backgroundColor: themeColors.surface,
              color: themeColors.text,
              shadowColor: themeColors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isDark ? 0.2 : 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
            value={groupName}
            onChangeText={setGroupName}
            placeholder={
              group
                ? group.title
                : isEnglish
                  ? 'Please enter a list name'
                  : '목록 이름을 입력해주세요'
            }
            placeholderTextColor={themeColors.textSecondary}
            autoFocus
          />
        </View>

        {/* 버튼 */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Button
            style={{
              flex: 1,
              backgroundColor: themeColors.backgroundSecondary,
              borderWidth: 1,
              borderColor: themeColors.border,
            }}
            onPress={() => setIsModalVisible(false)}
          >
            <Text style={{ color: themeColors.text }}>{isEnglish ? 'Cancel' : '취소'}</Text>
          </Button>
          <Button
            style={{
              flex: 1,
              backgroundColor: themeColors.primary,
            }}
            onPress={handleEditContactDetailGroup}
          >
            <Text style={{ color: themeColors.primaryText }}>
              {group ? (isEnglish ? 'Update' : '수정') : isEnglish ? 'Add' : '추가'}
            </Text>
          </Button>
        </View>
      </View>
    </BottomModal>
  );
};

export default EditContactDetailGroupModal;
