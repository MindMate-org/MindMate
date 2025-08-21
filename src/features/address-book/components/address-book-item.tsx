import { useRouter } from 'expo-router';
import { EllipsisVertical } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

import ActionMenu from './action-menu';
import AddressBookContent from './address-book-content';
import AddressBookImage from './address-book-image';
import AddressBookName from './address-book-name';
import AddressBookTag from './address-book-tag';
import CallButton from './call-button';
import EditAddressBookTagButton from './edit-address-book-tag-button';
import MessageButton from './message-button';
import { useThemeColors } from '../../../components/providers/theme-provider';
import { useEnhancedAsyncDataGet } from '../../../hooks/use-enhanced-async-data-get';
import { AddressBookService } from '../services';
import { ContactType } from '../types/address-book-type';

const AddressBookItem = ({ contact, refetch }: { contact: ContactType; refetch: () => void }) => {
  const router = useRouter();
  const { theme: themeColors, isDark } = useThemeColors();
  const [isActionMenuVisible, setIsActionMenuVisible] = useState(false);
  const getContactTagsUseCallBack = useCallback(
    () => (contact?.id ? AddressBookService.fetchGetContactTags(contact.id) : Promise.resolve([])),
    [contact?.id],
  );
  const { data: fetchedTags, refetch: refetchTags } =
    useEnhancedAsyncDataGet(getContactTagsUseCallBack);

  // Use tags from contact prop if available, otherwise use fetched tags
  const contactWithTags = contact as any;

  // Debug logging
  const tags = Array.isArray(fetchedTags)
    ? fetchedTags
    : Array.isArray(contactWithTags.tags)
      ? contactWithTags.tags
      : [];

  const refetchForEditTags = useCallback(() => {
    refetchTags();
    refetch();
  }, [refetchTags, refetch]);

  const handleEdit = () => {
    if (contact?.id) {
      router.push(`/address-book/edit/${contact.id}`);
    }
  };

  const handleDelete = async () => {
    try {
      if (contact?.id) {
        await AddressBookService.fetchDeleteContact(contact.id);
        setIsActionMenuVisible(false);
        refetch();
      }
    } catch (error) {}
  };

  return (
    <View
      style={{
        position: 'relative',
        marginBottom: 8,
        borderRadius: 12,
        backgroundColor: themeColors.surface,
        padding: 16,
        shadowColor: themeColors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      <TouchableOpacity onPress={handleEdit} style={{ position: 'relative' }} activeOpacity={0.8}>
        {/* 상단: 태그와 메뉴 */}
        <View
          style={{
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 4,
            }}
          >
            {Array.isArray(tags) &&
              tags.map((tag) => <AddressBookTag key={tag.id}>{tag.name}</AddressBookTag>)}
            <EditAddressBookTagButton refetch={refetchForEditTags} contact={contact} />
          </View>
          <TouchableOpacity
            onPress={() => setIsActionMenuVisible(true)}
            style={{
              marginLeft: 8,
              borderRadius: 16,
              padding: 8,
              backgroundColor: isDark ? 'rgba(156, 163, 175, 0.2)' : 'rgba(156, 163, 175, 0.1)',
            }}
          >
            <EllipsisVertical size={18} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* 메인 콘텐츠 */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* 프로필 이미지 */}
          <View style={{ marginRight: 16 }}>
            <AddressBookImage image={contact.profile_image} id={contact?.id?.toString() || '0'} />
          </View>

          {/* 연락처 정보 */}
          <View style={{ flex: 1 }}>
            <AddressBookName>{contact.name}</AddressBookName>
            <Text
              style={{
                color: themeColors.textSecondary,
                marginBottom: 8,
                fontSize: 14,
              }}
            >
              {contact.phone_number}
            </Text>

            {contact.memo && <AddressBookContent>{contact.memo}</AddressBookContent>}

            {/* 액션 버튼들 */}
            <View
              style={{
                marginTop: 12,
                flexDirection: 'row',
                gap: 8,
              }}
            >
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
