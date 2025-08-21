import { useRouter, useLocalSearchParams } from 'expo-router';
import { Plus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';

import { MODE } from '../constants/address-book-constants';
import { useContactEditState } from '../hooks/use-contact-edit-state';
import { AddressBookService } from '../services';
import { invalidateQueries } from '../../../hooks/use-query';

import { CustomAlertManager } from '@/src/components/ui/custom-alert';
import FormInput from '@/src/components/ui/form-input';
import MediaPicker, { MediaItem } from '@/src/components/ui/media-picker';
import { useThemeColors } from '@/src/components/providers/theme-provider';
import { pickMedia } from '@/src/lib/media-services';
import { MediaType } from '@/src/types/common-db-types';
import { useSetUserName } from '@/src/store/global-store';
import { useI18n } from '@/src/hooks/use-i18n';

// 업데이트된 폼 스타일 - FormInput 컴포넌트 사용으로 deprecated

// 추가 필드 타입 정의
type CustomField = {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'email' | 'phone' | 'url';
};

// 기본 필드 옵션
const getFieldOptions = (isEnglish: boolean) => [
  { label: isEnglish ? 'Email' : '이메일', type: 'email' as const },
  { label: isEnglish ? 'Company' : '회사', type: 'text' as const },
  { label: isEnglish ? 'Position' : '직책', type: 'text' as const },
  { label: isEnglish ? 'Address' : '주소', type: 'text' as const },
  { label: isEnglish ? 'Birthday' : '생일', type: 'text' as const },
  { label: isEnglish ? 'Website' : '웹사이트', type: 'url' as const },
  { label: isEnglish ? 'Instagram' : '인스타그램', type: 'text' as const },
  { label: isEnglish ? 'Twitter' : '트위터', type: 'text' as const },
  { label: isEnglish ? 'LinkedIn' : '링크드인', type: 'url' as const },
  { label: isEnglish ? 'Skype' : '스카이프', type: 'text' as const },
  { label: isEnglish ? 'Other' : '기타', type: 'text' as const },
];

const FormEditContact = ({ id }: { id: string }) => {
  const router = useRouter();
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
  const setUserName = useSetUserName();
  const isEnglish = t.locale.startsWith('en');
  
  // URL 쿼리 파라미터에서 isMyInfo 확인
  const params = useLocalSearchParams();
  const isMyInfo = params.isMyInfo === 'true';
  const {
    name,
    phoneNumber,
    memo,
    data,
    setName,
    setPhoneNumber,
    setMemo,
    refetch,
    image,
    setImage,
  } = useContactEditState(id);
  const mode = data ? MODE.EDIT : MODE.NEW;

  // 사용자 정의 필드 관리
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [showFieldOptions, setShowFieldOptions] = useState(false);

  // 필드 추가
  const addCustomField = (fieldOption: ReturnType<typeof getFieldOptions>[0]) => {
    const newField: CustomField = {
      id: Date.now().toString(),
      label: fieldOption.label,
      value: '',
      type: fieldOption.type,
    };
    setCustomFields([...customFields, newField]);
    setShowFieldOptions(false);
  };

  // 필드 삭제
  const removeCustomField = (fieldId: string) => {
    setCustomFields(customFields.filter((field) => field.id !== fieldId));
  };

  // 필드 값 업데이트
  const updateCustomField = (fieldId: string, value: string) => {
    setCustomFields(
      customFields.map((field) => (field.id === fieldId ? { ...field, value } : field)),
    );
  };

  // 이미지 추가 함수
  const handleImagePicker = async () => {
    const newImage = (await pickMedia()) as MediaType | undefined;
    if (newImage && newImage.uri) {
      setImage(newImage.uri);
    }
  };

  // MediaPicker를 위한 헬퍼 함수들
  const mediaList: MediaItem[] = image ? [{ uri: image, id: '1' }] : [];

  const handleRemoveImage = () => {
    setImage('');
  };

  const placeHolder = {
    [MODE.NEW]: {
      name: isEnglish ? 'Name' : '이름',
      phoneNumber: isEnglish ? 'Phone Number' : '전화번호',
      description: isEnglish ? 'Simple description' : '간단한 설명',
    },
    [MODE.EDIT]: {
      name: data?.name,
      phoneNumber: data?.phone_number,
      description: data?.memo,
    },
  };

  const handleSave = async () => {
    try {
      if (mode === MODE.EDIT) {
        await AddressBookService.fetchUpdateContact(parseInt(id, 10), {
          name,
          phone_number: phoneNumber,
          memo,
          profile_image: image,
        });
        
        // 내 정보인 경우 글로벌 userName도 업데이트
        if (data?.is_me === 1) {
          setUserName(name);
        }
        
        refetch();
        // 주소록 목록 캐시 무효화
        invalidateQueries('address-book-contacts');
        // 내 정보인 경우 내 정보 캐시도 무효화
        if (data?.is_me === 1) {
          invalidateQueries('my-contact');
        }
        await CustomAlertManager.success(isEnglish ? 'Contact has been updated.' : '연락처가 수정되었습니다.');
        router.push('/address-book');
      } else if (mode === MODE.NEW) {
        await AddressBookService.fetchCreateContact({
          name,
          phone_number: phoneNumber,
          memo,
          profile_image: image,
          is_me: isMyInfo ? 1 : 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        });
        
        // 내 정보인 경우 글로벌 userName도 설정
        if (isMyInfo) {
          setUserName(name);
        }
        // 캐시 무효화
        invalidateQueries('address-book-contacts');
        if (isMyInfo) {
          invalidateQueries('my-contact');
        }
        await CustomAlertManager.success(isEnglish ? 'Contact has been created.' : '연락처가 생성되었습니다.');
        router.push('/address-book');
      }
    } catch (error) {
      console.error('연락처 저장 실패:', error);
      CustomAlertManager.error(isEnglish ? 'An error occurred while saving the contact.' : '연락처 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <View style={{
      marginBottom: 24,
      borderRadius: 12,
      backgroundColor: themeColors.surface,
      padding: 24,
      shadowColor: themeColors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      {/* 프로필 섹션 */}
      <View style={{
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'flex-start',
      }}>
        <View style={{
          marginRight: 16,
          flex: 1,
        }}>
          <FormInput
            value={name}
            onChangeText={setName}
            label={isEnglish ? 'Name' : '이름'}
            placeholder={placeHolder[mode].name}
            className="mb-4"
          />

          <FormInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            label={isEnglish ? 'Phone Number' : '전화번호'}
            placeholder={placeHolder[mode].phoneNumber}
          />
        </View>

        <View style={{ alignItems: 'center' }}>
          <MediaPicker
            mediaList={mediaList}
            onAddMedia={handleImagePicker}
            onRemoveMedia={handleRemoveImage}
            maxCount={1}
            label={isEnglish ? 'Profile Photo' : '프로필 사진'}
          />
        </View>
      </View>

      {/* 추가 연락처 정보 */}
      {customFields.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <Text style={{
            marginBottom: 12,
            fontSize: 18,
            fontWeight: 'bold',
            color: themeColors.text,
          }}>{isEnglish ? 'Additional Information' : '추가 정보'}</Text>

          {customFields.map((field) => (
            <View key={field.id} style={{ marginBottom: 16 }}>
              <View style={{
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: themeColors.text,
                }}>{field.label}</Text>
                <TouchableOpacity
                  onPress={() => removeCustomField(field.id)}
                  style={{
                    borderRadius: 12,
                    backgroundColor: themeColors.error + '20',
                    padding: 4,
                  }}
                >
                  <X size={16} color={themeColors.error} />
                </TouchableOpacity>
              </View>
              <FormInput
                value={field.value}
                onChangeText={(value) => updateCustomField(field.id, value)}
                placeholder={isEnglish ? `Enter ${field.label}` : `${field.label} 입력`}
                keyboardType={
                  field.type === 'email'
                    ? 'email-address'
                    : field.type === 'phone'
                      ? 'phone-pad'
                      : field.type === 'url'
                        ? 'url'
                        : 'default'
                }
                autoCapitalize={field.type === 'email' ? 'none' : 'sentences'}
              />
            </View>
          ))}
        </View>
      )}

      {/* 필드 추가 버튼 */}
      <View style={{ marginBottom: 24 }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: themeColors.primary,
            backgroundColor: themeColors.background,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
          onPress={() => setShowFieldOptions(true)}
        >
          <Plus size={20} color={themeColors.primary} />
          <Text style={{
            marginLeft: 8,
            fontSize: 14,
            fontWeight: '500',
            color: themeColors.primary,
          }}>{isEnglish ? 'Add Information' : '정보 추가'}</Text>
        </TouchableOpacity>

        {/* 필드 옵션 선택 */}
        {showFieldOptions && (
          <FieldSelectionModal
            onSelectPredefined={addCustomField}
            onSelectCustom={(label, type) => addCustomField({ label, type })}
            onClose={() => setShowFieldOptions(false)}
            isEnglish={isEnglish}
          />
        )}
      </View>

      {/* 메모 섹션 */}
      <View style={{ marginBottom: 24 }}>
        <FormInput
          value={memo}
          onChangeText={setMemo}
          label={isEnglish ? 'Memo' : '메모'}
          placeholder={placeHolder[mode].description || (isEnglish ? 'Enter a simple description' : '간단한 설명을 입력하세요')}
          multiline
          height={80}
        />
      </View>

      {/* 저장 버튼 */}
      <TouchableOpacity
        style={{
          borderRadius: 8,
          backgroundColor: themeColors.primary,
          paddingHorizontal: 24,
          paddingVertical: 12,
          shadowColor: themeColors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
        onPress={handleSave}
      >
        <Text style={{
          textAlign: 'center',
          fontSize: 16,
          fontWeight: '600',
          color: themeColors.primaryText,
        }}>
          {mode === MODE.EDIT ? (isEnglish ? 'Update' : '수정하기') : (isEnglish ? 'Save' : '저장하기')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// 필드 선택 모달 컴포넌트
const FieldSelectionModal = ({
  onSelectPredefined,
  onSelectCustom,
  onClose,
  isEnglish,
}: {
  onSelectPredefined: (field: ReturnType<typeof getFieldOptions>[0]) => void;
  onSelectCustom: (label: string, type: 'text' | 'email' | 'url') => void;
  onClose: () => void;
  isEnglish: boolean;
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customType, setCustomType] = useState<'text' | 'email' | 'url'>('text');

  const handleAddCustomField = () => {
    if (!customLabel.trim()) {
      CustomAlertManager.error(isEnglish ? 'Please enter a field name.' : '필드 이름을 입력해주세요.');
      return;
    }
    onSelectCustom(customLabel.trim(), customType);
    setCustomLabel('');
    setShowCustomInput(false);
  };

  const FIELD_TYPE_OPTIONS = [
    { label: isEnglish ? 'Text' : '텍스트', value: 'text' as const },
    { label: isEnglish ? 'Email' : '이메일', value: 'email' as const },
    { label: isEnglish ? 'Website' : '웹사이트', value: 'url' as const },
  ];

  const fieldOptions = getFieldOptions(isEnglish);

  const { theme: themeColors } = useThemeColors();

  return (
    <View style={{
      marginTop: 16,
      borderRadius: 8,
      backgroundColor: themeColors.surface,
      padding: 16,
      shadowColor: themeColors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }}>
      {!showCustomInput ? (
        <>
          <Text style={{
            fontSize: 14,
            fontWeight: '500',
            color: themeColors.text,
            marginBottom: 12,
          }}>{isEnglish ? 'Select information to add:' : '추가할 정보 선택:'}</Text>

          {/* 미리 정의된 옵션들 */}
          <View style={{
            marginBottom: 16,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            {fieldOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  borderRadius: 8,
                  backgroundColor: themeColors.primary + '20',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
                onPress={() => onSelectPredefined(option)}
              >
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: themeColors.primary,
                }}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 직접 입력 버튼 */}
          <TouchableOpacity
            style={{
              marginBottom: 12,
              borderRadius: 8,
              backgroundColor: themeColors.success + '20',
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
            onPress={() => setShowCustomInput(true)}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Plus size={16} color={themeColors.success} />
              <Text style={{
                marginLeft: 8,
                fontSize: 14,
                fontWeight: '500',
                color: themeColors.success,
              }}>{isEnglish ? 'Custom Input' : '직접 입력하기'}</Text>
            </View>
          </TouchableOpacity>

          {/* 취소 버튼 */}
          <TouchableOpacity 
            style={{
              borderRadius: 8,
              backgroundColor: '#FEF3C7',
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
            onPress={onClose}
          >
            <Text style={{
              textAlign: 'center',
              fontSize: 14,
              fontWeight: '500',
              color: '#576BCD', // 커스텀 알러트 취소 버튼과 동일한 색상
            }}>{isEnglish ? 'Cancel' : '취소'}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={{
            fontSize: 14,
            fontWeight: '500',
            color: themeColors.text,
            marginBottom: 12,
          }}>{isEnglish ? 'Add New Information:' : '새 정보 추가:'}</Text>

          {/* 필드 이름 입력 */}
          <View style={{ marginBottom: 16 }}>
            <FormInput
              value={customLabel}
              onChangeText={setCustomLabel}
              label={isEnglish ? 'Field Name' : '필드 이름'}
              placeholder={isEnglish ? 'e.g. Hobby, School, Colleague, etc.' : '예: 취미, 학교, 직장동료 등'}
              variant="compact"
            />
          </View>

          {/* 필드 타입 선택 */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{
              fontSize: 12,
              fontWeight: '500',
              color: themeColors.textSecondary,
              marginBottom: 8,
            }}>{isEnglish ? 'Input Type' : '입력 타입'}</Text>
            <View style={{
              flexDirection: 'row',
              gap: 8,
            }}>
              {FIELD_TYPE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={{
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: customType === option.value 
                      ? themeColors.primary 
                      : themeColors.accent,
                  }}
                  onPress={() => setCustomType(option.value)}
                >
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: customType === option.value 
                      ? themeColors.primaryText 
                      : '#576BCD', // 커스텀 알러트 취소 버튼과 동일한 색상
                  }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 버튼들 */}
          <View style={{
            flexDirection: 'row',
            gap: 8,
          }}>
            <TouchableOpacity
              style={{
                flex: 1,
                borderRadius: 8,
                backgroundColor: '#FEF3C7',
                paddingVertical: 8,
              }}
              onPress={() => {
                setShowCustomInput(false);
                setCustomLabel('');
                setCustomType('text');
              }}
            >
              <Text style={{
                textAlign: 'center',
                fontSize: 14,
                fontWeight: '500',
                color: '#576BCD', // 커스텀 알러트 취소 버튼과 동일한 색상
              }}>{isEnglish ? 'Back' : '뒤로'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                borderRadius: 8,
                backgroundColor: themeColors.primary,
                paddingVertical: 8,
              }}
              onPress={handleAddCustomField}
            >
              <Text style={{
                textAlign: 'center',
                fontSize: 14,
                fontWeight: '500',
                color: themeColors.primaryText,
              }}>{isEnglish ? 'Add' : '추가'}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default FormEditContact;
