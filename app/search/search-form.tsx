import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Keyboard,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  BackHandler,
} from 'react-native';

import { useThemeColors } from '../../src/components/providers/theme-provider';
import { CustomAlertManager } from '../../src/components/ui/custom-alert';
import FormInput from '../../src/components/ui/form-input';
import MediaPicker, { MediaItem } from '../../src/components/ui/media-picker';
import SearchCategoryPicker from '../../src/features/search/components/search-category-picker';
import { getSearchCategories } from '../../src/features/search/constants/search-category-constants';
import { SearchCategoryLabel } from '../../src/features/search/db/search-db-types';
import {
  fetchGetMediaById,
  fetchGetSearchById,
  fetchInsertSearch,
  fetchUpdateSearchById,
} from '../../src/features/search/search-services';
import {
  SearchFormSchema,
  createSearchFormSchema,
} from '../../src/features/search/utils/search-form-schema';
import { useI18n } from '../../src/hooks/use-i18n';
import { db } from '../../src/hooks/use-initialize-database';
import { fetchInsertMedia, pickMedia } from '../../src/lib/media-services';
import { MediaType } from '../../src/types/common-db-types';

const SearchForm = () => {
  const router = useRouter();
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
  const [images, setImages] = useState<MediaItem[]>([]);
  const params = useLocalSearchParams();
  const id = params.id;

  // 카테고리 리스트를 i18n으로 초기화
  const searchCategories = getSearchCategories(t.locale.startsWith('en') ? 'en' : 'ko');

  // dropdown 상태
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SearchCategoryLabel[]>(
    searchCategories.map((category) => ({ label: category.label, value: category.label })),
  );

  const initializeForm = async () => {
    try {
      if (!id) return;
      const [search, media] = await Promise.all([fetchGetSearchById(+id), fetchGetMediaById(+id)]);
      const convertedMedia = media.map((item, index) => ({
        uri: item.file_path,
        type: item.media_type,
        id: item.id?.toString() || index.toString(),
      }));
      setImages(convertedMedia);

      reset({
        name: search.name,
        category: search.category,
        location: search.location,
        description: search.description ?? '',
      });
    } catch (error) {
      console.error('Form initialization error:', error);
      CustomAlertManager.error(
        t.locale.startsWith('en') ? 'Form initialization error.' : '폼 초기화 오류가 발생했습니다.',
      );
    }
  };
  useEffect(() => {
    initializeForm();
  }, []);

  // react-hook-form 설정
  // zod를 이용한 유효성 검사
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createSearchFormSchema(t.locale.startsWith('en') ? 'en' : 'ko')),
    defaultValues: {
      name: '',
      category: '',
      location: '',
      description: '',
    },
  });

  // 폼 제출 함수
  const handleFormSubmit = async (data: SearchFormSchema) => {
    try {
      await db.withTransactionAsync(async () => {
        const lastInsertRowId = await fetchInsertSearch(data);
        if (images.length > 0) {
          const mediaItems = images.map((item) => ({
            uri: item.uri,
            type: item.type as 'image' | 'video' | 'livePhoto' | 'pairedVideo' | undefined,
          }));
          await fetchInsertMedia(mediaItems, 'search', lastInsertRowId);
        }
      });

      await CustomAlertManager.success(
        t.locale.startsWith('en') ? 'Item saved successfully.' : '물건이 저장되었습니다.',
      );
      router.back();
    } catch (error) {
      console.error('Item save failed:', error);
      CustomAlertManager.error(
        t.locale.startsWith('en')
          ? 'An error occurred while saving the item.'
          : '물건 저장 중 오류가 발생했습니다.',
      );
      return;
    }
  };

  // 폼 업데이트 함수
  const handleFormUpdate = async (data: SearchFormSchema) => {
    try {
      const mediaItems = images.map((item) => ({
        uri: item.uri,
        type: item.type as 'image' | 'video' | 'livePhoto' | 'pairedVideo' | undefined,
      }));
      await fetchUpdateSearchById(+id, data, mediaItems);

      await CustomAlertManager.success(
        t.locale.startsWith('en') ? 'Item updated successfully.' : '물건이 수정되었습니다.',
      );
      router.back();
    } catch (error) {
      console.error('Item update failed:', error);
      CustomAlertManager.error(
        t.locale.startsWith('en')
          ? 'An error occurred while updating the item.'
          : '물건 수정 중 오류가 발생했습니다.',
      );
      return;
    }
  };

  // 이미지 추가 함수
  const handleAddImage = async () => {
    const newImages = (await pickMedia('multiple')) as MediaType[] | undefined;
    if (!newImages || newImages.length === 0) return;

    const remainingSlots = 5 - images.length;
    const imagesToAdd = newImages.slice(0, remainingSlots);

    setImages((prev) => [
      ...prev,
      ...imagesToAdd.map((img, index) => ({
        uri: img.uri,
        type: img.type,
        id: (Date.now() + index).toString(),
      })),
    ]);

    if (newImages.length > remainingSlots) {
      CustomAlertManager.info(
        t.locale.startsWith('en')
          ? `Only ${remainingSlots} photos were added (maximum 5 allowed)`
          : `최대 5개까지만 추가할 수 있어 ${remainingSlots}개만 추가되었습니다`,
      );
    }
  };

  // 이미지 삭제
  const handleRemoveImage = (idx: number) => {
    return setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // 뒤로가기 처리
  const handleCancel = async () => {
    const confirmed = await CustomAlertManager.confirm(
      t.locale.startsWith('en') ? 'Confirm' : '확인',
      t.locale.startsWith('en') ? 'Do you want to cancel writing?' : '작성을 취소하시겠습니까?',
    );
    if (confirmed) {
      router.back();
    }
  };

  // 안드로이드 하드웨어 뒤로가기 버튼 처리
  const handleBackPress = useCallback(() => {
    handleCancel();
    return true;
  }, []);

  // 화면이 포커스될 때 BackHandler 등록/해제
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => subscription.remove();
    }, [handleBackPress]),
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
        {/* 헤더 */}
        <View
          style={{
            paddingTop: 40, // 상태바 아래 여백
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            backgroundColor: themeColors.surface,
            paddingHorizontal: 16,
            paddingVertical: 16,
            shadowColor: themeColors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View
            style={{
              marginTop: 0,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <TouchableOpacity onPress={handleCancel} style={{ position: 'absolute', left: 0 }}>
              <Ionicons name="arrow-back" size={24} color={themeColors.primary} />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: themeColors.primary,
              }}
            >
              {id
                ? t.locale.startsWith('en')
                  ? 'Edit Item'
                  : '물건 수정'
                : t.locale.startsWith('en')
                  ? 'Register Item'
                  : '물건 등록'}
            </Text>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={{
              flex: 1,
              backgroundColor: themeColors.surface,
              paddingHorizontal: 16,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ paddingBottom: 24 }}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value, onBlur } }) => (
                  <FormInput
                    label={t.locale.startsWith('en') ? 'Item Name' : '물건 이름'}
                    placeholder={
                      t.locale.startsWith('en')
                        ? 'Please enter item name'
                        : '물건 이름을 입력해 주세요'
                    }
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.name?.message}
                    variant="search"
                    className="mb-9"
                  />
                )}
              />
              <View
                style={{
                  zIndex: 10,
                  marginBottom: 36,
                  width: '100%',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: themeColors.text,
                  }}
                >
                  {t.locale.startsWith('en') ? 'Category' : '카테고리'}
                </Text>
                <Controller
                  name="category"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <SearchCategoryPicker
                      open={open}
                      value={value}
                      items={items}
                      setOpen={setOpen}
                      setValue={(val) => onChange(typeof val === 'function' ? val(value) : val)}
                      setItems={setItems}
                      onPress={Keyboard.dismiss}
                    />
                  )}
                />
                <View style={{ height: 20 }}>
                  {errors.category && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: themeColors.error,
                      }}
                    >
                      {errors.category.message}
                    </Text>
                  )}
                </View>
              </View>
              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, value, onBlur } }) => (
                  <FormInput
                    label={t.locale.startsWith('en') ? 'Brief Location' : '간략한 위치'}
                    placeholder={
                      t.locale.startsWith('en')
                        ? 'Please enter brief location'
                        : '간략한 위치를 입력해 주세요'
                    }
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.location?.message}
                    variant="search"
                    className="mb-9"
                  />
                )}
              />
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <FormInput
                    label={t.locale.startsWith('en') ? 'Detailed Location' : '상세 위치'}
                    placeholder={
                      t.locale.startsWith('en')
                        ? 'Please enter detailed location'
                        : '상세 위치를 입력해 주세요'
                    }
                    value={value ?? ''}
                    onChangeText={onChange}
                    variant="search"
                    multiline
                    height={96}
                    className="mb-8"
                  />
                )}
              />

              <View
                style={{
                  marginBottom: 32,
                  width: '100%',
                }}
              >
                <MediaPicker
                  mediaList={images}
                  onAddMedia={handleAddImage}
                  onRemoveMedia={handleRemoveImage}
                  maxCount={5}
                  label={t.locale.startsWith('en') ? 'Add Photo (up to 5)' : '사진 추가 (최대 5개)'}
                  className="mb-4"
                />
              </View>
            </View>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                gap: 12,
                marginTop: 24,
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  borderRadius: 12,
                  backgroundColor: themeColors.primary,
                  paddingVertical: 12,
                }}
                onPress={
                  id
                    ? () => handleSubmit(handleFormUpdate)()
                    : () => handleSubmit(handleFormSubmit)()
                }
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 16,
                    fontWeight: '500',
                    color: themeColors.primaryText,
                  }}
                >
                  {id
                    ? t.locale.startsWith('en')
                      ? 'Update'
                      : '수정하기'
                    : t.locale.startsWith('en')
                      ? 'Register'
                      : '등록하기'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  borderRadius: 12,
                  backgroundColor: '#FEF3C7',
                  paddingVertical: 12,
                }}
                onPress={handleCancel}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 16,
                    fontWeight: '500',
                    color: '#576BCD',
                  }}
                >
                  {t.locale.startsWith('en') ? 'Cancel' : '취소하기'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default SearchForm;
