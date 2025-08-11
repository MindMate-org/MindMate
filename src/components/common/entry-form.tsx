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

import { Colors } from '../../constants/colors';
import MediaButtons from '../../features/diary/components/media-buttons';
import MediaPreview from '../../features/diary/components/media-preview';
import MoodPicker from '../../features/diary/components/mood-picker';
import StylePicker from '../../features/diary/components/style-picker';
import { DEFAULT_DIARY_STYLE } from '../../features/diary/constants/style-options';
import { useAudioRecording } from '../../features/diary/hooks/use-audio-recording';
import { useMediaPicker } from '../../features/diary/hooks/use-media-picker';
import { MoodType } from '../../features/diary/types';
import { formatDateTime } from '../../lib/date-utils';

export interface EntryFormDataType {
  title: string;
  content: string;
  media: Array<{
    id: string;
    type: 'image' | 'video' | 'audio';
    uri: string;
  }>;
  style: {
    fontFamily: string;
    fontSize: number;
    textAlign: 'left' | 'center' | 'right';
    textColor: string;
    backgroundColor: string;
  };
  mood?: MoodType;
}

interface EntryFormProps {
  title: string;
  initialData?: Partial<EntryFormDataType>;
  onSubmit: (data: EntryFormDataType, audioUri?: string) => Promise<void>;
  onCancel: () => void;
  showMoodPicker?: boolean;
  showAlarmSection?: boolean;
  alarmSection?: React.ReactNode;
  isLoading?: boolean;
}

/**
 * 일기/일정 공통 생성/편집 폼 컴포넌트
 *
 * 일기와 일정 생성/편집에서 공통으로 사용되는 UI를 제공합니다.
 * 알림 기능은 일정에서만 표시됩니다.
 */
export const EntryForm: React.FC<EntryFormProps> = ({
  title,
  initialData,
  onSubmit,
  onCancel,
  showMoodPicker = true,
  showAlarmSection = false,
  alarmSection,
  isLoading = false,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [showMoodPickerModal, setShowMoodPickerModal] = useState(false);
  const [showStylePickerModal, setShowStylePickerModal] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EntryFormDataType>({
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      media: initialData?.media || [],
      style: initialData?.style || DEFAULT_DIARY_STYLE,
      mood: initialData?.mood,
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

  const handleRemoveMedia = (id: string) => {
    setValue(
      'media',
      watchedMedia.filter((m) => m.id !== id),
    );
  };

  const handleFormSubmit = async (data: EntryFormDataType) => {
    if (audioUploadState.isUploading || mediaUploadState.isUploading) {
      Alert.alert('업로드 중', '미디어 업로드가 완료될 때까지 기다려주세요.');
      return;
    }
    await onSubmit(data, audioUri ?? undefined);
  };

  const handleSubmitError = (errors: any) => {
    const errorMessages = [];
    if (errors.title) errorMessages.push(errors.title.message || '제목을 입력해주세요');
    if (errors.content) errorMessages.push(errors.content.message || '내용을 입력해주세요');
    if (showMoodPicker && errors.mood)
      errorMessages.push(errors.mood.message || '오늘의 기분을 선택해주세요');

    if (errorMessages.length > 0) {
      Alert.alert('입력 확인', errorMessages.join('\\n'));
    }
  };

  const handleCancel = () => {
    Alert.alert('확인', '작성을 취소하시겠습니까?', [
      { text: '아니오', style: 'cancel' },
      { text: '예', onPress: onCancel },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="mb-[100px] flex-1">
        {/* 헤더 */}
        <View className="mt-8 flex-row items-center justify-between border-b-2 border-turquoise bg-white px-4 py-4">
          <TouchableOpacity onPress={onCancel}>
            <ChevronLeft size={24} color={Colors.paleCobalt} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-paleCobalt">{title}</Text>
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
            rules={{ required: '제목을 입력해주세요' }}
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
                rules={{ required: '내용을 입력해주세요' }}
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
              onStylePress={() => setShowStylePickerModal(true)}
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

          {showMoodPicker && (
            <TouchableOpacity
              onPress={() => setShowMoodPickerModal(true)}
              className="flex-row items-center gap-2"
            >
              {watchedMood ? (
                <MoodPicker.MoodDisplay mood={watchedMood} />
              ) : (
                <MoodPicker.EmptyMoodDisplay />
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* 알림 섹션 (일정에서만 표시) */}
        {showAlarmSection && alarmSection}
      </ScrollView>

      {/* 하단 버튼 */}
      <View className="absolute bottom-10 left-0 right-0 bg-white px-4 pb-6 pt-4">
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={handleSubmit(handleFormSubmit, handleSubmitError)}
            className="flex-1 items-center justify-center rounded-lg py-4"
            style={{
              backgroundColor:
                audioUploadState.isUploading || mediaUploadState.isUploading || isLoading
                  ? Colors.gray
                  : Colors.paleCobalt,
            }}
            disabled={audioUploadState.isUploading || mediaUploadState.isUploading || isLoading}
          >
            <Text className="text-md font-bold text-white">
              {audioUploadState.isUploading || mediaUploadState.isUploading || isLoading
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

      {showMoodPicker && (
        <MoodPicker
          visible={showMoodPickerModal}
          onClose={() => setShowMoodPickerModal(false)}
          onSelect={(mood) => {
            setValue('mood', mood);
            setShowMoodPickerModal(false);
          }}
        />
      )}

      <StylePicker
        visible={showStylePickerModal}
        onClose={() => setShowStylePickerModal(false)}
        style={watchedStyle}
        onStyleChange={(newStyle) => setValue('style', newStyle)}
      />
    </SafeAreaView>
  );
};
