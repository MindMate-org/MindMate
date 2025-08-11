import { Plus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { TouchableOpacity, View, Alert } from 'react-native';
import { Text } from 'react-native';

import { MODE } from '../constants/address-book-constants';
import { useContactEditState } from '../hooks/use-contact-edit-state';
import { createContact, updateContact } from '../services/mutation-contact-data';

import FormInput from '@/src/components/ui/form-input';
import MediaPicker, { MediaItem } from '@/src/components/ui/media-picker';
import { pickMedia } from '@/src/lib/media-services';
import { MediaType } from '@/src/types/common-db-types';

// 업데이트된 폼 스타일 - FormInput 컴포넌트 사용으로 deprecated

// 추가 필드 타입 정의
type CustomField = {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'email' | 'phone' | 'url';
};

// 기본 필드 옵션
const FIELD_OPTIONS = [
  { label: '이메일', type: 'email' as const },
  { label: '회사', type: 'text' as const },
  { label: '직책', type: 'text' as const },
  { label: '주소', type: 'text' as const },
  { label: '생일', type: 'text' as const },
  { label: '웹사이트', type: 'url' as const },
  { label: '인스타그램', type: 'text' as const },
  { label: '트위터', type: 'text' as const },
  { label: '링크드인', type: 'url' as const },
  { label: '스카이프', type: 'text' as const },
  { label: '기타', type: 'text' as const },
];

const FormEditContact = ({ id }: { id: string }) => {
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
  const addCustomField = (fieldOption: (typeof FIELD_OPTIONS)[0]) => {
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
      name: '이름',
      phoneNumber: '전화번호',
      description: '간단한 설명',
    },
    [MODE.EDIT]: {
      name: data?.name,
      phoneNumber: data?.phone_number,
      description: data?.memo,
    },
  };

  const handleSave = async () => {
    const crate_at = new Date().toISOString();
    if (mode === MODE.EDIT) {
      await updateContact(id, { name, phone_number: phoneNumber, memo });
      refetch();
    }
    if (mode === MODE.NEW) {
      createContact({
        name,
        phone_number: phoneNumber,
        memo,
        profile_image: image,
        is_me: 0,
        created_at: crate_at,
      });
    }
  };

  return (
    <View className="mb-6 rounded-xl bg-white p-6 shadow-sm">
      {/* 프로필 섹션 */}
      <View className="mb-6 flex-row items-start">
        <View className="mr-4 flex-1">
          <FormInput
            value={name}
            onChangeText={setName}
            label="이름"
            placeholder={placeHolder[mode].name}
            className="mb-4"
          />

          <FormInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            label="전화번호"
            placeholder={placeHolder[mode].phoneNumber}
            keyboardType="phone-pad"
          />
        </View>

        <View className="items-center">
          <MediaPicker
            mediaList={mediaList}
            onAddMedia={handleImagePicker}
            onRemoveMedia={handleRemoveImage}
            maxCount={1}
            label="프로필 사진"
          />
        </View>
      </View>

      {/* 추가 연락처 정보 */}
      {customFields.length > 0 && (
        <View className="mb-6">
          <Text className="text-gray-800 mb-3 text-lg font-bold">추가 정보</Text>

          {customFields.map((field) => (
            <View key={field.id} className="mb-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-gray-700 text-sm font-medium">{field.label}</Text>
                <TouchableOpacity
                  onPress={() => removeCustomField(field.id)}
                  className="rounded-full bg-red-100 p-1"
                >
                  <X size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
              <FormInput
                value={field.value}
                onChangeText={(value) => updateCustomField(field.id, value)}
                placeholder={`${field.label} 입력`}
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
      <View className="mb-6">
        <TouchableOpacity
          className="flex-row items-center justify-center rounded-lg border-2 border-dashed border-paleCobalt bg-white px-4 py-3"
          onPress={() => setShowFieldOptions(true)}
        >
          <Plus size={20} color="#576bcd" />
          <Text className="ml-2 text-sm font-medium text-paleCobalt">정보 추가</Text>
        </TouchableOpacity>

        {/* 필드 옵션 선택 */}
        {showFieldOptions && (
          <FieldSelectionModal
            onSelectPredefined={addCustomField}
            onSelectCustom={(label, type) => addCustomField({ label, type })}
            onClose={() => setShowFieldOptions(false)}
          />
        )}
      </View>

      {/* 메모 섹션 */}
      <FormInput
        value={memo}
        onChangeText={setMemo}
        label="메모"
        placeholder={placeHolder[mode].description || '간단한 설명을 입력하세요'}
        multiline
        height={80}
        className="mb-6"
      />

      {/* 저장 버튼 */}
      <TouchableOpacity
        className="rounded-lg bg-paleCobalt px-6 py-3 shadow-md"
        onPress={handleSave}
      >
        <Text className="text-center text-base font-semibold text-white">
          {mode === MODE.EDIT ? '수정하기' : '저장하기'}
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
}: {
  onSelectPredefined: (field: (typeof FIELD_OPTIONS)[0]) => void;
  onSelectCustom: (label: string, type: 'text' | 'email' | 'phone' | 'url') => void;
  onClose: () => void;
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customType, setCustomType] = useState<'text' | 'email' | 'phone' | 'url'>('text');

  const handleAddCustomField = () => {
    if (!customLabel.trim()) {
      Alert.alert('오류', '필드 이름을 입력해주세요.');
      return;
    }
    onSelectCustom(customLabel.trim(), customType);
    setCustomLabel('');
    setShowCustomInput(false);
  };

  const FIELD_TYPE_OPTIONS = [
    { label: '텍스트', value: 'text' as const },
    { label: '이메일', value: 'email' as const },
    { label: '전화번호', value: 'phone' as const },
    { label: '웹사이트', value: 'url' as const },
  ];

  return (
    <View className="mt-4 rounded-lg bg-white p-4 shadow-sm">
      {!showCustomInput ? (
        <>
          <Text className="text-gray-700 mb-3 text-sm font-medium">추가할 정보 선택:</Text>

          {/* 미리 정의된 옵션들 */}
          <View className="mb-4 flex-row flex-wrap gap-2">
            {FIELD_OPTIONS.map((option, index) => (
              <TouchableOpacity
                key={index}
                className="rounded-lg bg-paleCobalt/10 px-3 py-2"
                onPress={() => onSelectPredefined(option)}
              >
                <Text className="text-sm font-medium text-paleCobalt">{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 직접 입력 버튼 */}
          <TouchableOpacity
            className="mb-3 rounded-lg bg-green-100 px-4 py-3"
            onPress={() => setShowCustomInput(true)}
          >
            <View className="flex-row items-center justify-center">
              <Plus size={16} color="#22c55e" />
              <Text className="ml-2 text-sm font-medium text-green-600">직접 입력하기</Text>
            </View>
          </TouchableOpacity>

          {/* 취소 버튼 */}
          <TouchableOpacity className="bg-gray-200 rounded-lg px-3 py-2" onPress={onClose}>
            <Text className="text-gray-600 text-center text-sm font-medium">취소</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text className="text-gray-700 mb-3 text-sm font-medium">새 정보 추가:</Text>

          {/* 필드 이름 입력 */}
          <FormInput
            value={customLabel}
            onChangeText={setCustomLabel}
            label="필드 이름"
            placeholder="예: 취미, 학교, 직장동료 등"
            variant="compact"
            className="mb-4"
          />

          {/* 필드 타입 선택 */}
          <View className="mb-4">
            <Text className="text-gray-600 mb-2 text-xs font-medium">입력 타입</Text>
            <View className="flex-row gap-2">
              {FIELD_TYPE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`rounded-lg px-3 py-2 ${
                    customType === option.value ? 'bg-paleCobalt' : 'bg-gray-200'
                  }`}
                  onPress={() => setCustomType(option.value)}
                >
                  <Text
                    className={`text-xs font-medium ${
                      customType === option.value ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 버튼들 */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="bg-gray-300 flex-1 rounded-lg py-2"
              onPress={() => {
                setShowCustomInput(false);
                setCustomLabel('');
                setCustomType('text');
              }}
            >
              <Text className="text-gray-700 text-center text-sm font-medium">뒤로</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 rounded-lg bg-paleCobalt py-2"
              onPress={handleAddCustomField}
            >
              <Text className="text-center text-sm font-medium text-white">추가</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default FormEditContact;
