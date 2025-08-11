import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Bell, BellOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';

import FormInput from '../../src/components/ui/form-input';
import MediaPicker, { MediaItem } from '../../src/components/ui/media-picker';
import { useScheduleAlarm } from '../../src/features/schedule/hooks/use-schedule-alarm';
import { createSchedule } from '../../src/features/schedule/services/schedule-services';
import type { CreateScheduleData } from '../../src/features/schedule/types/schedule-types';
import { pickMedia } from '../../src/lib/media-services';
import { MediaType } from '../../src/types/common-db-types';

/**
 * 새 일정 생성 페이지
 * @description 사용자가 새로운 일정을 생성할 수 있는 폼을 제공합니다.
 * @returns JSX.Element
 */
const CreateSchedulePage = () => {
  const router = useRouter();
  const { scheduleAlarm } = useScheduleAlarm();
  const [title, setTitle] = useState('');
  const [contents, setContents] = useState('');
  const [location, setLocation] = useState('');
  const [companion, setCompanion] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [enableNotification, setEnableNotification] = useState(true);
  const [images, setImages] = useState<MediaItem[]>([]);

  /**
   * 일정 저장 처리
   * @description 입력된 일정 데이터를 검증하고 저장합니다.
   */
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('오류', '일정 제목을 입력해주세요.');
      return;
    }

    const scheduleData: CreateScheduleData = {
      title: title.trim(),
      contents: contents.trim() || undefined,
      time: selectedDate.toISOString(),
      location: location.trim() || undefined,
      companion: companion.trim() || undefined,
    };

    try {
      const newScheduleId = await createSchedule(scheduleData);
      if (newScheduleId) {
        // 알림 설정이 활성화되어 있으면 알림 예약
        if (enableNotification) {
          const mockSchedule = {
            id: newScheduleId,
            title: title.trim(),
            time: selectedDate.toISOString(),
            contents: contents.trim() || null,
            location: location.trim() || null,
            companion: companion.trim() || null,
            is_completed: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          await scheduleAlarm(mockSchedule);
        }

        Alert.alert('완료', '일정이 저장되었습니다.', [
          { text: '확인', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('오류', '일정 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      Alert.alert('오류', '일정 저장 중 문제가 발생했습니다.');
    }
  };

  const handleDateChange = (event: unknown, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      const newDate = new Date(selectedDate);
      newDate.setFullYear(date.getFullYear());
      newDate.setMonth(date.getMonth());
      newDate.setDate(date.getDate());
      setSelectedDate(newDate);
    }
  };

  const handleTimeChange = (event: unknown, time?: Date) => {
    setShowTimePicker(false);
    if (time) {
      const newDate = new Date(selectedDate);
      newDate.setHours(time.getHours());
      newDate.setMinutes(time.getMinutes());
      setSelectedDate(newDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * 이미지 추가 처리
   * @description 미디어 선택기를 사용하여 이미지를 추가합니다.
   */
  const handleAddImage = async () => {
    const newImage = (await pickMedia()) as MediaType | undefined;
    if (!newImage) return;
    setImages((prev) => [
      ...prev,
      { uri: newImage.uri, type: newImage.type, id: Date.now().toString() },
    ]);
  };

  /**
   * 이미지 삭제 처리
   * @param idx 삭제할 이미지의 인덱스
   */
  const handleRemoveImage = (idx: number) => {
    return setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <SafeAreaView className="flex-1 bg-turquoise">
      {/* 헤더 */}
      <View className="flex-row items-center bg-turquoise px-4 py-3 pt-safe">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
          <ArrowLeft size={24} color="#576bcd" />
          <Text className="ml-2 text-lg font-medium text-paleCobalt">일정 추가</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        <View className="px-4">
          {/* 기본 정보 */}
          <View className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <Text className="text-gray-800 mb-4 text-lg font-bold">기본 정보</Text>

            {/* 제목 */}
            <FormInput
              value={title}
              onChangeText={setTitle}
              label="제목"
              placeholder="일정 제목을 입력하세요"
              required
              className="mb-4"
            />

            {/* 내용 */}
            <FormInput
              value={contents}
              onChangeText={setContents}
              label="내용"
              placeholder="상세 내용을 입력하세요"
              multiline
              height={96}
            />
          </View>

          {/* 일시 설정 */}
          <View className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <Text className="text-gray-800 mb-4 text-lg font-bold">일시 설정</Text>

            {/* 날짜 선택 */}
            <TouchableOpacity
              className="border-gray-300 mb-4 flex-row items-center rounded-lg border bg-white px-4 py-3"
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color="#576bcd" />
              <Text className="text-gray-800 ml-3 flex-1 text-base">
                {formatDate(selectedDate)}
              </Text>
            </TouchableOpacity>

            {/* 시간 선택 */}
            <TouchableOpacity
              className="border-gray-300 mb-4 flex-row items-center rounded-lg border bg-white px-4 py-3"
              onPress={() => setShowTimePicker(true)}
            >
              <Bell size={20} color="#576bcd" />
              <Text className="text-gray-800 ml-3 flex-1 text-base">
                {formatTime(selectedDate)}
              </Text>
            </TouchableOpacity>

            {/* 알림 설정 */}
            <TouchableOpacity
              className={`flex-row items-center rounded-lg border px-4 py-3 ${
                enableNotification
                  ? 'border-paleCobalt bg-paleCobalt/10'
                  : 'border-gray-300 bg-white'
              }`}
              onPress={() => setEnableNotification(!enableNotification)}
            >
              {enableNotification ? (
                <Bell size={20} color="#576bcd" />
              ) : (
                <BellOff size={20} color="#9ca3af" />
              )}
              <Text
                className={`ml-3 flex-1 text-base ${
                  enableNotification ? 'font-medium text-paleCobalt' : 'text-gray-500'
                }`}
              >
                알림 받기
              </Text>
              <View
                className={`h-5 w-5 rounded-full border-2 ${
                  enableNotification
                    ? 'border-paleCobalt bg-paleCobalt'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {enableNotification && (
                  <View className="h-full w-full items-center justify-center">
                    <View className="h-2 w-2 rounded-full bg-white" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* 추가 정보 */}
          <View className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <Text className="text-gray-800 mb-4 text-lg font-bold">추가 정보</Text>

            {/* 장소 */}
            <FormInput
              value={location}
              onChangeText={setLocation}
              label="장소"
              placeholder="장소를 입력하세요"
              className="mb-4"
            />

            {/* 동행자 */}
            <FormInput
              value={companion}
              onChangeText={setCompanion}
              label="동행자"
              placeholder="동행자를 입력하세요"
              className="mb-4"
            />

            {/* 사진 */}
            <MediaPicker
              mediaList={images}
              onAddMedia={handleAddImage}
              onRemoveMedia={handleRemoveImage}
              maxCount={3}
              label="사진 추가"
            />
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼들 */}
      <View className="flex-row gap-3 px-4 pb-safe pt-4">
        <TouchableOpacity className="flex-1 rounded-xl bg-[#576BCD] py-3" onPress={handleSave}>
          <Text className="text-center text-base font-medium text-white">등록하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 rounded-xl bg-[#F7E6C4] py-3"
          onPress={() => router.back()}
        >
          <Text className="text-center text-base font-medium text-[#576BCD]">취소하기</Text>
        </TouchableOpacity>
      </View>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
};

export default CreateSchedulePage;
