import { ChevronLeft, Clock } from 'lucide-react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { useThemeColors } from '../providers/theme-provider';
import { useI18n } from '../../hooks/use-i18n';
import { CustomAlertManager } from '../ui/custom-alert';
import MediaButtons from '../../features/diary/components/media-buttons';
import MediaPreview from '../../features/diary/components/media-preview';
import MoodPicker from '../../features/diary/components/mood-picker';
import StylePicker from '../../features/diary/components/style-picker';
import { getDefaultDiaryStyle } from '../../features/diary/constants/style-options';
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
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [showMoodPickerModal, setShowMoodPickerModal] = useState(false);
  const [showStylePickerModal, setShowStylePickerModal] = useState(false);

  const { control, handleSubmit, setValue, watch } = useForm<EntryFormDataType>({
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      media: initialData?.media || [],
      style: initialData?.style || getDefaultDiaryStyle(isDark),
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
    const updateTime = () => setCurrentDateTime(formatDateTime(undefined, 'full', '12h', t.locale.startsWith('en') ? 'en' : 'ko'));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [t.locale]);

  const handleRemoveMedia = (id: string) => {
    setValue(
      'media',
      watchedMedia.filter((m) => m.id !== id),
    );
  };

  const handleFormSubmit = async (data: EntryFormDataType) => {
    if (audioUploadState.isUploading || mediaUploadState.isUploading) {
      CustomAlertManager.info(t.locale.startsWith('en') 
        ? 'Please wait for media upload to complete.' 
        : '미디어 업로드가 완료될 때까지 기다려주세요.');
      return;
    }
    await onSubmit(data, audioUri ?? undefined);
  };

  const handleSubmitError = (errors: any) => {
    const errorMessages = [];
    if (errors.title) errorMessages.push(errors.title.message || (t.locale.startsWith('en') ? 'Please enter a title' : '제목을 입력해주세요'));
    if (errors.content) errorMessages.push(errors.content.message || (t.locale.startsWith('en') ? 'Please enter content' : '내용을 입력해주세요'));
    if (showMoodPicker && errors.mood)
      errorMessages.push(errors.mood.message || (t.locale.startsWith('en') ? 'Please select your mood' : '오늘의 기분을 선택해주세요'));

    if (errorMessages.length > 0) {
      CustomAlertManager.error(errorMessages.join('\\n'));
    }
  };

  const handleCancelWithConfirm = async () => {
    const confirmed = await CustomAlertManager.confirm(
      t.locale.startsWith('en') ? 'Confirm' : '확인',
      t.locale.startsWith('en') ? 'Do you want to cancel writing?' : '작성을 취소하시겠습니까?'
    );
    if (confirmed) {
      onCancel();
    }
  };

  // 안드로이드 하드웨어 뒤로가기 버튼 처리
  const handleBackPress = useCallback(() => {
    handleCancelWithConfirm();
    return true; // 기본 뒤로가기 동작 방지
  }, []);

  // 화면이 포커스될 때 BackHandler 등록/해제
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => subscription.remove();
    }, [handleBackPress])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      {/* 헤더 */}
      <View
        style={{
          marginTop: 32,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: themeColors.primary,
          backgroundColor: themeColors.surface,
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
      >
        <TouchableOpacity onPress={handleCancelWithConfirm}>
          <ChevronLeft size={24} color={themeColors.primary} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: themeColors.primary,
          }}
        >
          {title}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={{ 
          flex: 1,
          backgroundColor: watchedStyle.backgroundColor || (isDark ? themeColors.surface : '#FFFFFF')
        }}
      >
        {/* 통합된 폼 컨테이너 */}
        <View
          style={{
            flex: 1,
            backgroundColor:
              watchedStyle.backgroundColor || (isDark ? themeColors.surface : '#FFFFFF'),
            paddingBottom: 90, // 하단 고정 버튼을 위한 여백
          }}
        >
          {/* 제목 입력 */}
          <Controller
            control={control}
            name="title"
            rules={{ required: t.locale.startsWith('en') ? 'Please enter a title' : '제목을 입력해주세요' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder={t.locale.startsWith('en') ? 'Please enter a title.' : '제목을 입력해주세요.'}
                placeholderTextColor={themeColors.textSecondary}
                style={{
                  marginBottom: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  fontSize: 20,
                  fontWeight: '500',
                  borderBottomWidth: 1,
                  borderBottomColor: '#576BCD',
                  fontFamily:
                    watchedStyle.fontFamily === 'default' ? undefined : watchedStyle.fontFamily,
                  color: watchedStyle.textColor || themeColors.text,
                  textAlign: watchedStyle.textAlign,
                }}
              />
            )}
          />

          {/* 내용 입력 + 미디어 버튼 */}
          <View style={{ width: '100%', flexDirection: 'row' }}>
            <View style={{ flex: 1, padding: 16, paddingRight: 16 }}>
              <Controller
                control={control}
                name="content"
                rules={{ required: t.locale.startsWith('en') ? 'Please enter content' : '내용을 입력해주세요' }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder={t.locale.startsWith('en') ? 'Please enter content.' : '내용을 입력해 주세요.'}
                    placeholderTextColor={themeColors.textSecondary}
                    multiline
                    textAlignVertical="top"
                    style={{
                      minHeight: 80,
                      fontSize: watchedStyle.fontSize || 16,
                      fontWeight: 'normal',
                      borderWidth: 0,
                      fontFamily:
                        watchedStyle.fontFamily === 'default' ? undefined : watchedStyle.fontFamily,
                      color: watchedStyle.textColor || themeColors.text,
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

          {/* 미디어 미리보기 */}
          <MediaPreview
            media={watchedMedia}
            onRemove={handleRemoveMedia}
            isUploading={audioUploadState.isUploading || mediaUploadState.isUploading}
          />

          {/* 날짜 및 기분 */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderTopWidth: 1,
              borderTopColor: '#576BCD',
            }}
          >
            <View
              style={{
                marginBottom: showMoodPicker ? 16 : 0,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Clock size={20} color={themeColors.primary} />
              <Text
                style={{
                  fontSize: 14,
                  color: themeColors.text,
                }}
              >
                {currentDateTime}
              </Text>
            </View>

            {showMoodPicker && (
              <TouchableOpacity
                onPress={() => setShowMoodPickerModal(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
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
          {showAlarmSection && (
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: '#576BCD',
              }}
            >
              {alarmSection}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 하단 고정 버튼 */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: themeColors.surface,
          borderTopWidth: 1,
          borderTopColor: themeColors.primary,
          paddingHorizontal: 16,
          paddingVertical: 16,
          paddingBottom: 50, // 갤럭시 네비게이션 바와 적절한 간격 확보
        }}
      >
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <TouchableOpacity
            onPress={handleSubmit(handleFormSubmit, handleSubmitError)}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              paddingVertical: 16,
              backgroundColor:
                audioUploadState.isUploading || mediaUploadState.isUploading || isLoading
                  ? themeColors.textSecondary
                  : themeColors.primary,
            }}
            disabled={audioUploadState.isUploading || mediaUploadState.isUploading || isLoading}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: themeColors.primaryText,
              }}
            >
              {audioUploadState.isUploading || mediaUploadState.isUploading || isLoading
                ? (t.locale.startsWith('en') ? 'Uploading...' : '업로드 중...')
                : (t.locale.startsWith('en') ? 'Submit' : '등록하기')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCancelWithConfirm}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              backgroundColor: '#FEF3C7',
              paddingVertical: 16,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#576BCD',
              }}
            >
              {t.locale.startsWith('en') ? 'Cancel' : '취소'}
            </Text>
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
