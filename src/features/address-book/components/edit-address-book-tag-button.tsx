import { Plus } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { invalidateQueries } from '../../../hooks/use-query';
import { AddressBookService } from '../services';
import { cleanupDuplicateTags } from '../services/get-tag-data';
import { ContactType, TagType } from '../types/address-book-type';

import { useThemeColors } from '@/src/components/providers/theme-provider';
import BottomModal from '@/src/components/ui/bottom-modal';
import Button from '@/src/components/ui/button';
import { useI18n } from '@/src/hooks/use-i18n';
import { useQuery } from '@/src/hooks/use-query';

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
  const { t } = useI18n();
  const { theme: themeColors, isDark } = useThemeColors();
  const isEnglish = t.locale.startsWith('en');
  const [isInitializing, setIsInitializing] = useState(false);

  const { data: allTags, refetch: refetchAllTags } = useQuery<TagType[]>(
    ['all-tags'],
    () => AddressBookService.fetchGetTags(),
    {
      staleTime: 5 * 60 * 1000, // 5분간 fresh
    },
  );

  // 기본 태그 목록 정의 (5개로 제한)
  const getDefaultTags = useCallback(() => {
    if (isEnglish) {
      return ['Family', 'Friend', 'Hobby', 'School', 'Work'];
    } else {
      return ['가족', '친구', '취미', '학교', '직장'];
    }
  }, [isEnglish]);

  // 모달이 열릴 때 태그 초기화
  useEffect(() => {
    const initializeTags = async () => {
      if (!isModalVisible) return;

      try {
        setIsInitializing(true);
        // 1. 현재 언어의 기본 태그 목록
        const defaultTags = getDefaultTags();
        // 2. 현재 존재하는 태그들 확인
        const currentTags = await AddressBookService.fetchGetTags();
        const existingTagNames = currentTags.map((tag) => tag.name.trim());
        // 3. 누락된 태그 찾기
        const missingTags = defaultTags.filter((tagName) => !existingTagNames.includes(tagName));
        // 4. 누락된 태그 생성
        if (missingTags.length > 0) {
          for (const tagName of missingTags) {
            try {
              await AddressBookService.fetchCreateTag({ name: tagName.trim(), color: '#576BCD' });
            } catch (error) {}
          }
          // 태그 목록 캐시 무효화 및 새로고침
          invalidateQueries('all-tags');
          await refetchAllTags();
        }

        // 5. 중복 태그 정리
        if (currentTags.length > 0) {
          await cleanupDuplicateTags();
          invalidateQueries('all-tags');
          await refetchAllTags();
        }
      } catch (error) {
      } finally {
        setIsInitializing(false);
      }
    };

    // 모달이 열릴 때마다 실행
    initializeTags();
  }, [isModalVisible, isEnglish]);

  const { data: contactTags, refetch: refetchContactTags } = useQuery<TagType[]>(
    [`contact-tags-${contact?.id}`],
    async () => (contact?.id ? AddressBookService.fetchGetContactTags(contact.id) : []),
    {
      enabled: !!contact?.id,
      staleTime: 2 * 60 * 1000, // 2분간 fresh
    },
  );

  const refetch = useCallback(async () => {
    await refetchAllTags();
    await refetchContactTags();
    await refetchItemTags();
  }, [refetchAllTags, refetchContactTags, refetchItemTags]);

  const handleTag = async (tag: TagType) => {
    const isHasTag = contactTags?.some((t) => t.id === tag.id);
    try {
      if (contact?.id && tag?.id) {
        if (!isHasTag) {
          await AddressBookService.fetchAddTagToContact(contact.id, tag.id);
        } else {
          await AddressBookService.fetchRemoveTagFromContact(contact.id, tag.id);
        }
        // 캐시 무효화로 즉시 업데이트
        invalidateQueries(`contact-tags-${contact.id}`);
        invalidateQueries('address-book-contacts');
        await refetch();
      }
    } catch (error) {}
  };

  return (
    <BottomModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible}>
      <View
        style={{
          padding: 24,
          backgroundColor: themeColors.surface,
        }}
      >
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
          {isEnglish ? 'Select Tags' : '태그 선택'}
        </Text>

        {/* 안내 텍스트 */}
        <Text
          style={{
            fontSize: 14,
            color: themeColors.textSecondary,
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          {isEnglish
            ? 'Tap tags to add or remove them from this contact'
            : '태그를 눌러서 연락처에 추가하거나 제거하세요'}
        </Text>

        {/* 태그 목록 */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 24,
          }}
        >
          {(() => {
            if (!allTags || !Array.isArray(allTags)) {
              return null;
            }

            // 현재 언어에 맞는 태그만 표시하되, 모든 태그도 보여주기
            const defaultTags = getDefaultTags();
            const filteredTags = allTags.filter((tag) => {
              const tagName = tag.name.trim();
              const isDefaultTag = defaultTags.includes(tagName);
              return isDefaultTag;
            });

            // 중복 제거
            const uniqueTags = filteredTags.reduce((unique, tag) => {
              const exists = unique.some((t) => t.name.trim() === tag.name.trim());
              if (!exists) {
                unique.push(tag);
              }
              return unique;
            }, [] as TagType[]);

            if (uniqueTags.length === 0) {
              return (
                <View
                  style={{
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: themeColors.textSecondary,
                      textAlign: 'center',
                    }}
                  >
                    {isEnglish ? 'No tags available' : '사용할 수 있는 태그가 없습니다'}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: themeColors.textSecondary,
                      textAlign: 'center',
                      marginTop: 8,
                    }}
                  >
                    {isEnglish
                      ? 'Tags will be created automatically'
                      : '태그가 자동으로 생성됩니다'}
                  </Text>
                </View>
              );
            }

            return uniqueTags.map((tag) => {
              const isSelected = contactTags?.some((t) => t.id === tag.id);
              return (
                <TouchableOpacity
                  key={`${contact?.id}-tag-${tag.id}`}
                  onPress={() => handleTag(tag)}
                  style={{
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: isSelected
                      ? themeColors.primary
                      : themeColors.backgroundSecondary,
                    borderWidth: 1,
                    borderColor: isSelected ? themeColors.primary : themeColors.border,
                    shadowColor: themeColors.shadow,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: isDark ? 0.2 : 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: isSelected ? themeColors.primaryText : themeColors.text,
                    }}
                  >
                    {tag.name}
                  </Text>
                </TouchableOpacity>
              );
            });
          })()}
        </View>

        {/* 완료 버튼 */}
        <Button
          style={{
            backgroundColor: themeColors.primary,
            paddingVertical: 12,
          }}
          onPress={() => setIsModalVisible(false)}
        >
          <Text
            style={{
              color: themeColors.primaryText,
              fontSize: 16,
              fontWeight: '500',
            }}
          >
            {isEnglish ? 'Done' : '완료'}
          </Text>
        </Button>
      </View>
    </BottomModal>
  );
};

export default EditAddressBookTagButton;
