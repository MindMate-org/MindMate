import { useRouter } from 'expo-router';
import { User } from 'lucide-react-native';
import React from 'react';
import { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import AddressBookImage from './address-book-image';
import AddressBookName from './address-book-name';
import { useThemeColors } from '../../../components/providers/theme-provider';
import { useAsyncDataGet } from '../../../hooks/use-async-data-get';
import { useFocusPage } from '../../../hooks/use-focus-page';
import { AddressBookService } from '../services';
import { ContactType } from '../types/address-book-type';

/**
 * 내 정보 표시 컴포넌트
 * @description 현재 사용자의 연락처 정보를 표시하고 편집 기능을 제공합니다.
 * @returns JSX.Element
 */
const AddressBookSelfItem = () => {
  const router = useRouter();
  const { theme: themeColors, isDark } = useThemeColors();
  const getMyContactUseCallBack = useCallback(async () => {
    const contact = await AddressBookService.fetchGetMyContact();
    if (!contact) {
      throw new Error('내 연락처가 존재하지 않습니다.');
    }
    return contact;
  }, []);
  const { data, refetch } = useAsyncDataGet<ContactType>(getMyContactUseCallBack);
  // 내 정보 수정 후 즉시 반영을 위해 포커스 시 새로고침
  useFocusPage(refetch);

  const handleEdit = () => {
    if (data) {
      router.push(`/address-book/edit/${data.id}`);
    }
  };

  if (!data) return null;

  return (
    <View style={{
      marginBottom: 8,
      borderRadius: 12,
      backgroundColor: themeColors.surface,
      padding: 16,
      shadowColor: themeColors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 2,
      elevation: 2,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <View style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <View style={{ marginRight: 16 }}>
            <AddressBookImage image={data.profile_image} id={data.id.toString()} />
          </View>

          <View style={{ flex: 1 }}>
            <View style={{
              marginBottom: 4,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <User size={16} color={themeColors.textSecondary} />
              <Text style={{
                marginLeft: 8,
                fontSize: 14,
                fontWeight: '500',
                color: themeColors.textSecondary,
              }}>내 정보</Text>
            </View>
            <AddressBookName>{data.name}</AddressBookName>
            <Text style={{
              fontSize: 14,
              color: themeColors.textSecondary,
            }}>{data.phone_number}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={{
            borderRadius: 8,
            backgroundColor: themeColors.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
          }} 
          onPress={handleEdit}
        >
          <Text style={{
            fontSize: 14,
            fontWeight: '500',
            color: themeColors.primaryText,
          }}>편집</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddressBookSelfItem;
