import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { ChevronLeft, Clock } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';

import { Colors } from '../../src/constants/colors';
import MediaButtons from '../../src/features/diary/components/media-buttons';
import MediaPreview from '../../src/features/diary/components/media-preview';
import MoodPicker from '../../src/features/diary/components/mood-picker';
import StylePicker from '../../src/features/diary/components/style-picker';
import { DEFAULT_DIARY_STYLE } from '../../src/features/diary/constants/style-options';
import { useAudioRecording } from '../../src/features/diary/hooks/use-audio-recording';
import { useMediaPicker } from '../../src/features/diary/hooks/use-media-picker';
import { DiaryService } from '../../src/features/diary/services';
import { DiaryFormDataType, diaryFormSchema } from '../../src/features/diary/types';
import { formatDateTime } from '../../src/lib/date-utils';

/**
 * 일기 작성 페이지 컴포넌트
 *
 * 사용자가 새로운 일기를 작성할 수 있는 페이지입니다.
 * React Hook Form과 Zod를 사용하여 폼 유효성 검사를 수행합니다.
 *
 * 주요 기능:
 * - 일기 제목 및 내용 입력
 * - 이미지, 비디오, 음성 파일 체부
 * - 기분 선택 및 스타일 커스터마이징
 * - 실시간 날짜/시간 표시
 *
 * @component
 * @example
 * ```tsx
 * // 라우터에서 사용
 * <Stack.Screen name="create" component={DiaryCreatePage} />
 * ```
 */
const DiaryCreatePage = () => {
  const router = useRouter();
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DiaryFormDataType>({
    resolver: zodResolver(diaryFormSchema),
    defaultValues: {
      title: '',
      content: '',
      media: [],
      style: DEFAULT_DIARY_STYLE,
    },
  });

  const watchedStyle = watch('style');
  const watchedMedia = watch('media');
  const watchedMood = watch('mood');

  const {
    recordingState,
    audioUri,
    handleAudioRecording,
    uploadState: audioUploadState,
  } = useAudioRecording(watchedMedia, setValue);

  const {
    handleImagePicker,
    handleVideoPicker,
    uploadState: mediaUploadState,
  } = useMediaPicker(watchedMedia, setValue);

  useEffect(() => {
    const updateTime = () => setCurrentDateTime(formatDateTime());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  /**
   * 선택된 미디어 파일을 목록에서 제거합니다
   *
   * @param id - 제거할 미디어의 고유 ID
   */
  const handleRemoveMedia = (id: string) => {
    setValue(
      'media',
      watchedMedia.filter((m) => m.id !== id),
    );
  };

  /**
   * 작성된 일기를 데이터베이스에 저장합니다
   *
   * 일기 데이터를 먼저 생성한 후, 체부된 미디어 파일들을 순차적으로 추가합니다.
   * 성공 시 메인 일기 목록 페이지로 이동합니다.
   *
   * @param data - React Hook Form에서 수집된 일기 데이터
   */
  const onSubmit = async (data: DiaryFormDataType) => {
    // 업로드 중일 때는 제출 방지
    if (audioUploadState.isUploading || mediaUploadState.isUploading) {
      Alert.alert('업로드 중', '미디어 업로드가 완료될 때까지 기다려주세요.');
      return;
    }

    try {
      const mediaFiles = data.media.map((media) => ({
        ownerType: 'diary' as const,
        mediaType: media.type,
        filePath: media.uri,
      }));

      const diaryId = await DiaryService.createDiary({
        title: data.title,
        body: data.content,
        font: data.style.fontFamily,
        fontSize: data.style.fontSize,
        textAlign: data.style.textAlign,
        textColor: data.style.textColor,
        backgroundColor: data.style.backgroundColor,
        mood: data.mood,
        audioUri: audioUri ?? undefined,
      });

      for (const media of mediaFiles) {
        await DiaryService.addMedia({
          ...media,
          ownerId: diaryId,
        });
      }

      Alert.alert('성공', '일기가 저장되었습니다.', [
        { text: '확인', onPress: () => router.replace('/(tabs)/diary') },
      ]);
    } catch (error) {
      console.error('일기 저장 실패:', error);
      Alert.alert('오류', '일기 저장 중 오류가 발생했습니다.');
    }
  };

  /**
   * 폼 제출 실패 시 에러 처리 (유효성 검사 실패)
   */
  const onSubmitError = (errors: any) => {
    const errorMessages = [];
    if (errors.title) errorMessages.push(errors.title.message || '제목을 입력해주세요');
    if (errors.content) errorMessages.push(errors.content.message || '내용을 입력해주세요');
    if (errors.mood) errorMessages.push(errors.mood.message || '오늘의 기분을 선택해주세요');

    if (errorMessages.length > 0) {
      Alert.alert('입력 확인', errorMessages.join('\n'));
    }
  };

  const handleBack = () => router.back();
  const handleCancel = () => {
    Alert.alert('확인', '작성을 취소하시겠습니까?', [
      { text: '아니오', style: 'cancel' },
      { text: '예', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="mb-[100px] flex-1">
        {/* 헤더 */}
        <View className="mt-8 flex-row items-center justify-between border-b-2 border-turquoise bg-white px-4 py-4">
          <TouchableOpacity onPress={handleBack}>
            <ChevronLeft size={24} color={Colors.paleCobalt} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-paleCobalt">일기 작성하기</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* 제목 + 내용 + 미디어 버튼 */}
        <View
          className="h-auto rounded-xl"
          style={{ backgroundColor: watchedStyle.backgroundColor || '#F5F7FF' }}
        >
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="제목을 입력해주세요."
                placeholderTextColor={Colors.black}
                className="mb-4 px-4 py-4 text-xl font-medium"
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.paleCobalt,
                  fontFamily:
                    watchedStyle.fontFamily === 'default' ? undefined : watchedStyle.fontFamily,
                  color: watchedStyle.textColor,
                  textAlign: watchedStyle.textAlign,
                }}
              />
            )}
          />

          <View className="w-full flex-row">
            <View className="flex-1 p-4 pr-4">
              <Controller
                control={control}
                name="content"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="내용을 입력해 주세요."
                    placeholderTextColor={Colors.black}
                    multiline
                    textAlignVertical="top"
                    className="min-h-[80px] text-md font-normal"
                    style={{
                      borderWidth: 0,
                      fontSize: watchedStyle.fontSize,
                      fontFamily:
                        watchedStyle.fontFamily === 'default' ? undefined : watchedStyle.fontFamily,
                      color: watchedStyle.textColor,
                      textAlign: watchedStyle.textAlign,
                    }}
                  />
                )}
              />
            </View>

            <MediaButtons
              onImagePress={handleImagePicker}
              onVideoPress={handleVideoPicker}
              onAudioPress={handleAudioRecording}
              onStylePress={() => setShowStylePicker(true)}
              recordingState={recordingState}
            />
          </View>

          <MediaPreview
            media={watchedMedia}
            onRemove={handleRemoveMedia}
            isUploading={audioUploadState.isUploading || mediaUploadState.isUploading}
          />
        </View>

        {/* 날짜 및 기분 */}
        <View className="bg-white px-4 py-4">
          <View className="mb-4 flex-row items-center gap-2">
            <Clock size={20} color={Colors.paleCobalt} />
            <Text className="text-sm text-black">{currentDateTime}</Text>
          </View>

          <TouchableOpacity
            onPress={() => setShowMoodPicker(true)}
            className="flex-row items-center gap-2"
          >
            {watchedMood ? (
              <MoodPicker.MoodDisplay mood={watchedMood} />
            ) : (
              <MoodPicker.EmptyMoodDisplay />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View className="absolute bottom-10 left-0 right-0 bg-white px-4 pb-6 pt-4">
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={handleSubmit(onSubmit, onSubmitError)}
            className="flex-1 items-center justify-center rounded-lg py-4"
            style={{
              backgroundColor:
                audioUploadState.isUploading || mediaUploadState.isUploading
                  ? Colors.gray
                  : Colors.paleCobalt,
            }}
            disabled={audioUploadState.isUploading || mediaUploadState.isUploading}
          >
            <Text className="text-md font-bold text-white">
              {audioUploadState.isUploading || mediaUploadState.isUploading
                ? '업로드 중...'
                : '등록하기'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCancel}
            className="flex-1 items-center justify-center rounded-lg bg-paleYellow py-4"
          >
            <Text className="text-md font-bold text-paleCobalt">취소</Text>
          </TouchableOpacity>
        </View>
      </View>

      <MoodPicker
        visible={showMoodPicker}
        onClose={() => setShowMoodPicker(false)}
        onSelect={(mood) => {
          setValue('mood', mood);
          setShowMoodPicker(false);
        }}
      />

      <StylePicker
        visible={showStylePicker}
        onClose={() => setShowStylePicker(false)}
        style={watchedStyle}
        onStyleChange={(newStyle) => setValue('style', newStyle)}
      />
    </SafeAreaView>
  );
};

export default DiaryCreatePage;
