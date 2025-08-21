import { useRouter } from 'expo-router';
import { User } from 'lucide-react-native';
import React from 'react';
import { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import AddressBookImage from './address-book-image';
import AddressBookName from './address-book-name';
import { useThemeColors } from '../../../components/providers/theme-provider';
import { useQuery } from '../../../hooks/use-query';
import { useI18n } from '../../../hooks/use-i18n';
import { AddressBookService } from '../services';
import { ContactType } from '../types/address-book-type';
import { useSetUserName, useUserName } from '../../../store/app-store';

/**
 * 내 정보 표시 컴포넌트
 * @description 현재 사용자의 연락처 정보를 표시하고 편집 기능을 제공합니다.
 * @returns JSX.Element
 */
const AddressBookSelfItem = () => {
  const router = useRouter();
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
  const setUserName = useSetUserName();
  const userName = useUserName();
  const { data, refetch, isLoading: loading, isError } = useQuery<ContactType | null>(
    ['my-contact'],
    async () => {
      const contact = await AddressBookService.fetchGetMyContact();
      return contact; // null을 허용하여 에러가 아닌 정상적인 빈 상태로 처리
    },
    {
      staleTime: 5 * 60 * 1000, // 5분간 fresh
      cacheTime: 10 * 60 * 1000, // 10분간 캐시
      retry: 3,
    }
  );
  // 내 정보 수정 후 즉시 반영을 위한 포커스 새로고침 제거 (로딩 개선)
  // useFocusPage(refetch);

  // 내 연락처 데이터가 로드되었고, 글로벌 userName이 비어있을 때 초기화
  React.useEffect(() => {
    if (data && data.name && !userName) {
      setUserName(data.name);
    }
  }, [data, userName, setUserName]);

  const handleEdit = () => {
    if (data && data.id) {
      router.push(`/address-book/edit/${data.id}`);
    }
  };

  const handleCreateMyInfo = () => {
    router.push('/address-book/edit/new?isMyInfo=true');
  };

  // 로딩 중일 때
  if (loading) {
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
        }}>
          <View style={{ 
            marginRight: 16,
            width: 48, 
            height: 48, 
            borderRadius: 24, 
            backgroundColor: themeColors.backgroundSecondary 
          }} />
          <View style={{ flex: 1 }}>
            <View style={{
              height: 12,
              backgroundColor: themeColors.backgroundSecondary,
              borderRadius: 6,
              marginBottom: 8,
              width: '60%'
            }} />
            <View style={{
              height: 10,
              backgroundColor: themeColors.backgroundSecondary,
              borderRadius: 5,
              width: '40%'
            }} />
          </View>
        </View>
      </View>
    );
  }

  // 내 정보가 없을 때 (첫 사용)
  if (!data && !loading) {
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
            <View style={{ 
              marginRight: 16,
              width: 48, 
              height: 48, 
              borderRadius: 24, 
              backgroundColor: themeColors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <User size={24} color={themeColors.primaryText} />
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
                }}>{t.addressBook.myInfo}</Text>
              </View>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: themeColors.text,
                marginBottom: 2,
              }}>{t.addressBook.addMyInfo}</Text>
              <Text style={{
                fontSize: 14,
                color: themeColors.textSecondary,
              }}>{t.addressBook.addMyInfoDesc}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={{
              borderRadius: 8,
              backgroundColor: themeColors.primary,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }} 
            onPress={handleCreateMyInfo}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              color: themeColors.primaryText,
            }}>{t.addressBook.add}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
            <AddressBookImage image={data.profile_image} id={data?.id?.toString() || '0'} />
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
              }}>{t.addressBook.myInfo}</Text>
            </View>
            <AddressBookName>{data?.name || ''}</AddressBookName>
            <Text style={{
              fontSize: 14,
              color: themeColors.textSecondary,
            }}>{data?.phone_number || ''}</Text>
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
          }}>{t.addressBook.edit}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddressBookSelfItem;
