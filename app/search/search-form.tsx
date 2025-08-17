import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
} from 'react-native';

import { useThemeColors } from '../../src/components/providers/theme-provider';
import Toast from 'react-native-toast-message';

import FormInput from '../../src/components/ui/form-input';
import MediaPicker, { MediaItem } from '../../src/components/ui/media-picker';
import SearchCategoryPicker from '../../src/features/search/components/search-category-picker';
import { searchCategories } from '../../src/features/search/constants/search-category-constants';
import { SearchCategoryLabel } from '../../src/features/search/db/search-db-types';
import {
  fetchGetMediaById,
  fetchGetSearchById,
  fetchInsertSearch,
  fetchUpdateSearchById,
} from '../../src/features/search/search-services';
import {
  SearchFormSchema,
  searchFormSchema,
} from '../../src/features/search/utils/search-form-schema';
import { db } from '../../src/hooks/use-initialize-database';
import { fetchInsertMedia, pickMedia } from '../../src/lib/media-services';
import { MediaType } from '../../src/types/common-db-types';

const SearchForm = () => {
  const router = useRouter();
  const { theme: themeColors, isDark } = useThemeColors();
  const [images, setImages] = useState<MediaItem[]>([]);
  const params = useLocalSearchParams();
  const id = params.id;

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
      alert('폼 초기화 오류:');
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
    resolver: zodResolver(searchFormSchema),
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
      router.back();
      Toast.show({
        type: 'success',
        text1: '등록이 완료되었습니다.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '등록에 실패했습니다.',
      });
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
      router.back();
      Toast.show({
        type: 'success',
        text1: '수정이 완료되었습니다.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '수정에 실패했습니다.',
      });
      return;
    }
  };

  // 이미지 추가 함수
  const handleAddImage = async () => {
    const newImage = (await pickMedia()) as MediaType | undefined;
    if (!newImage) return;
    setImages((prev) => [
      ...prev,
      { uri: newImage.uri, type: newImage.type, id: Date.now().toString() },
    ]);
  };

  // 이미지 삭제
  const handleRemoveImage = (idx: number) => {
    return setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ 
        flex: 1, 
        backgroundColor: isDark ? themeColors.background : '#a7f3d0',
        paddingHorizontal: 16,
        paddingTop: 32,
      }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
          style={{ flex: 1 }}
        >
          <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
            <View style={{ paddingBottom: 24 }}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value, onBlur } }) => (
                  <FormInput
                    label="물건 이름"
                    placeholder="물건 이름을 입력해 주세요"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.name?.message}
                    variant="search"
                    className="mb-9"
                  />
                )}
              />
              <View style={{
                zIndex: 10,
                marginBottom: 36,
                width: '100%',
                alignItems: 'flex-start',
                justifyContent: 'center',
                gap: 8,
              }}>
                <Text style={{
                  fontSize: 18,
                  color: themeColors.primary,
                }}>카테고리</Text>
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
                <View className="h-5">
                  {errors.category && (
                    <Text className="text-ss text-red-500">{errors.category.message}</Text>
                  )}
                </View>
              </View>
              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, value, onBlur } }) => (
                  <FormInput
                    label="간략한 위치"
                    placeholder="간략한 위치를 입력해 주세요"
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
                    label="상세 위치"
                    placeholder="상세 위치를 입력해 주세요"
                    value={value ?? ''}
                    onChangeText={onChange}
                    variant="search"
                    multiline
                    height={96}
                    className="mb-8"
                  />
                )}
              />

              <View className="mb-8 w-full">
                <MediaPicker
                  mediaList={images}
                  onAddMedia={handleAddImage}
                  onRemoveMedia={handleRemoveImage}
                  maxCount={3}
                  label="사진 추가"
                  className="mb-4"
                />
              </View>
            </View>
            <View style={{ 
              width: '100%', 
              flexDirection: 'row', 
              gap: 12 
            }}>
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
                <Text style={{
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: '500',
                  color: themeColors.primaryText,
                }}>
                  {id ? '수정하기' : '등록하기'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  borderRadius: 12,
                  backgroundColor: themeColors.accent,
                  paddingVertical: 12,
                }}
                onPress={() => router.back()}
              >
                <Text style={{
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: '500',
                  color: themeColors.primary,
                }}>취소하기</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default SearchForm;
