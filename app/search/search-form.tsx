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
} from 'react-native';
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
          await fetchInsertMedia(images, 'search', lastInsertRowId);
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
      await fetchUpdateSearchById(+id, data, images);
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
      <View className="flex-1 bg-turquoise px-4 pt-8">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
          className="flex-1"
        >
          <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
            <View className="pb-6">
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
              <View className={`z-10 mb-9 w-full items-start justify-center gap-2`}>
                <Text className="text-lg text-paleCobalt">카테고리</Text>
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
            <View className="w-full flex-row gap-3">
              <TouchableOpacity
                className="flex-1 rounded-xl bg-[#576BCD] py-3"
                onPress={
                  id
                    ? () => handleSubmit(handleFormUpdate)()
                    : () => handleSubmit(handleFormSubmit)()
                }
              >
                <Text className="text-center text-base font-medium text-white">
                  {id ? '수정하기' : '등록하기'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 rounded-xl bg-[#F7E6C4] py-3"
                onPress={() => router.back()}
              >
                <Text className="text-center text-base font-medium text-[#576BCD]">취소하기</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SearchForm;
