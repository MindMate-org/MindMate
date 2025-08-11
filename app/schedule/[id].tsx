import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Save, Calendar, MapPin, Users, Trash2, Edit3 } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';

import {
  getScheduleById,
  updateSchedule,
  deleteSchedule,
} from '../../src/features/schedule/services/schedule-services';
import type {
  Schedule,
  UpdateScheduleData,
} from '../../src/features/schedule/types/schedule-types';

const ScheduleDetailPage = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheduleId = parseInt(id, 10);

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [contents, setContents] = useState('');
  const [location, setLocation] = useState('');
  const [companion, setCompanion] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, [scheduleId]);

  const loadSchedule = async () => {
    try {
      const data = await getScheduleById(scheduleId);
      if (data) {
        setSchedule(data);
        setTitle(data.title);
        setContents(data.contents || '');
        setLocation(data.location || '');
        setCompanion(data.companion || '');
        setSelectedDate(new Date(data.time));
      } else {
        Alert.alert('오류', '일정을 찾을 수 없습니다.', [
          { text: '확인', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
      Alert.alert('오류', '일정을 불러오는 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('오류', '일정 제목을 입력해주세요.');
      return;
    }

    const updateData: UpdateScheduleData = {
      title: title.trim(),
      contents: contents.trim() || undefined,
      time: selectedDate.toISOString(),
      location: location.trim() || undefined,
      companion: companion.trim() || undefined,
    };

    try {
      const success = await updateSchedule(scheduleId, updateData);
      if (success) {
        Alert.alert('완료', '일정이 수정되었습니다.');
        setIsEditing(false);
        loadSchedule();
      } else {
        Alert.alert('오류', '일정 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      Alert.alert('오류', '일정 수정 중 문제가 발생했습니다.');
    }
  };

  const handleDelete = () => {
    Alert.alert('일정 삭제', '정말로 이 일정을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            const success = await deleteSchedule(scheduleId);
            if (success) {
              Alert.alert('완료', '일정이 삭제되었습니다.', [
                { text: '확인', onPress: () => router.back() },
              ]);
            } else {
              Alert.alert('오류', '일정 삭제에 실패했습니다.');
            }
          } catch (error) {
            console.error('Error deleting schedule:', error);
            Alert.alert('오류', '일정 삭제 중 문제가 발생했습니다.');
          }
        },
      },
    ]);
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      const newDate = new Date(selectedDate);
      newDate.setFullYear(date.getFullYear());
      newDate.setMonth(date.getMonth());
      newDate.setDate(date.getDate());
      setSelectedDate(newDate);
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-turquoise">
        <View className="flex-1 items-center justify-center">
          <Text className="text-paleCobalt">로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!schedule) {
    return (
      <SafeAreaView className="flex-1 bg-turquoise">
        <View className="flex-1 items-center justify-center">
          <Text className="text-paleCobalt">일정을 찾을 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-turquoise">
      {/* 헤더 */}
      <View className="flex-row items-center justify-between bg-turquoise px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
          <ArrowLeft size={24} color="#576bcd" />
          <Text className="ml-2 text-lg font-medium text-paleCobalt">일정 상세</Text>
        </TouchableOpacity>

        <View className="flex-row gap-2">
          {isEditing ? (
            <TouchableOpacity
              className="flex-row items-center rounded-lg bg-paleCobalt px-4 py-2"
              onPress={handleSave}
            >
              <Save size={16} color="white" />
              <Text className="ml-1 text-sm font-medium text-white">저장</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                className="flex-row items-center rounded-lg bg-paleCobalt px-3 py-2"
                onPress={() => setIsEditing(true)}
              >
                <Edit3 size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center rounded-lg bg-red-500 px-3 py-2"
                onPress={handleDelete}
              >
                <Trash2 size={16} color="white" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4">
          {/* 완료 상태 표시 */}
          <View className="mb-4 rounded-xl bg-white p-4 shadow-sm">
            <View className="flex-row items-center">
              <View
                className={`h-4 w-4 rounded-full ${schedule.is_completed ? 'bg-teal' : 'bg-pink'}`}
              />
              <Text className="text-gray-800 ml-3 text-lg font-medium">
                {schedule.is_completed ? '완료됨' : '미완료'}
              </Text>
            </View>
          </View>

          {/* 기본 정보 */}
          <View className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <Text className="text-gray-800 mb-4 text-lg font-bold">기본 정보</Text>

            {/* 제목 */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2 text-sm font-medium">제목</Text>
              {isEditing ? (
                <TextInput
                  className="border-gray-300 text-gray-800 rounded-lg border bg-white px-4 py-3 text-base"
                  value={title}
                  onChangeText={setTitle}
                  placeholderTextColor="#9CA3AF"
                />
              ) : (
                <Text className="text-gray-800 text-lg font-medium">{schedule.title}</Text>
              )}
            </View>

            {/* 내용 */}
            <View>
              <Text className="text-gray-700 mb-2 text-sm font-medium">내용</Text>
              {isEditing ? (
                <TextInput
                  className="border-gray-300 text-gray-800 h-24 rounded-lg border bg-white px-4 py-3 text-base"
                  value={contents}
                  onChangeText={setContents}
                  placeholderTextColor="#9CA3AF"
                  multiline
                  textAlignVertical="top"
                />
              ) : (
                <Text className="text-gray-600 text-base">
                  {schedule.contents || '내용이 없습니다.'}
                </Text>
              )}
            </View>
          </View>

          {/* 일시 정보 */}
          <View className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <Text className="text-gray-800 mb-4 text-lg font-bold">일시</Text>

            {isEditing ? (
              <>
                <TouchableOpacity
                  className="border-gray-300 mb-4 flex-row items-center rounded-lg border bg-white px-4 py-3"
                  onPress={() => setShowDatePicker(true)}
                >
                  <Calendar size={20} color="#576bcd" />
                  <Text className="text-gray-800 ml-3 flex-1 text-base">
                    {formatDate(selectedDate)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="border-gray-300 flex-row items-center rounded-lg border bg-white px-4 py-3"
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text className="text-gray-800 ml-3 flex-1 text-base">
                    {formatTime(selectedDate)}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View>
                <Text className="text-gray-800 text-lg font-medium">
                  {formatDate(new Date(schedule.time))}
                </Text>
                <Text className="text-gray-600 text-base">
                  {formatTime(new Date(schedule.time))}
                </Text>
              </View>
            )}
          </View>

          {/* 추가 정보 */}
          <View className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <Text className="text-gray-800 mb-4 text-lg font-bold">추가 정보</Text>

            {/* 장소 */}
            <View className="mb-4">
              <View className="mb-2 flex-row items-center">
                <MapPin size={16} color="#6b7280" />
                <Text className="text-gray-700 ml-2 text-sm font-medium">장소</Text>
              </View>
              {isEditing ? (
                <TextInput
                  className="border-gray-300 text-gray-800 rounded-lg border bg-white px-4 py-3 text-base"
                  value={location}
                  onChangeText={setLocation}
                  placeholderTextColor="#9CA3AF"
                />
              ) : (
                <Text className="text-gray-600 text-base">
                  {schedule.location || '장소가 설정되지 않았습니다.'}
                </Text>
              )}
            </View>

            {/* 동행자 */}
            <View>
              <View className="mb-2 flex-row items-center">
                <Users size={16} color="#6b7280" />
                <Text className="text-gray-700 ml-2 text-sm font-medium">동행자</Text>
              </View>
              {isEditing ? (
                <TextInput
                  className="border-gray-300 text-gray-800 rounded-lg border bg-white px-4 py-3 text-base"
                  value={companion}
                  onChangeText={setCompanion}
                  placeholderTextColor="#9CA3AF"
                />
              ) : (
                <Text className="text-gray-600 text-base">
                  {schedule.companion || '동행자가 없습니다.'}
                </Text>
              )}
            </View>
          </View>

          {!isEditing && (
            <TouchableOpacity
              className="mb-8 rounded-lg bg-paleCobalt/10 px-4 py-3"
              onPress={() => setIsEditing(true)}
            >
              <Text className="text-center text-base font-medium text-paleCobalt">
                일정 수정하기
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

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

export default ScheduleDetailPage;
