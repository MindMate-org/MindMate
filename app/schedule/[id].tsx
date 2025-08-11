import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Edit3, Trash2, Clock, MapPin, Plus } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert, Image } from 'react-native';

import { Colors } from '../../src/constants/colors';
import {
  fetchGetScheduleById,
  fetchDeleteSchedule,
} from '../../src/features/schedule/services/schedule-services';
import type { ScheduleType } from '../../src/features/schedule/types/schedule-types';

const ScheduleDetailPage = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheduleId = parseInt(id, 10);

  const [schedule, setSchedule] = useState<ScheduleType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, [scheduleId]);

  const loadSchedule = async () => {
    try {
      const data = await fetchGetScheduleById(scheduleId);
      if (data) {
        setSchedule(data);
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

  const handleEdit = () => {
    router.push(`/schedule/edit/${schedule?.id}`);
  };

  const handleDelete = () => {
    Alert.alert('일정 삭제', '정말로 이 일정을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            const success = await fetchDeleteSchedule(scheduleId);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = days[date.getDay()];

    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} (${dayName})`;
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-gray-50 pt-safe flex-1">
        <View className="flex-1 items-center justify-center">
          <Text className="text-paleCobalt">로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!schedule) {
    return (
      <SafeAreaView className="bg-gray-50 pt-safe flex-1">
        <View className="flex-1 items-center justify-center">
          <Text className="text-paleCobalt">일정을 찾을 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Mock images for demonstration (replace with actual schedule images)
  const mockImages = [
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop',
  ];

  return (
    <SafeAreaView className="bg-gray-50 pt-safe flex-1">
      {/* 헤더 */}
      <View className="flex-row items-center justify-between bg-white px-4 py-4 shadow-sm">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.paleCobalt} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-paleCobalt">일정 상세보기</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* 메인 카드 */}
          <View className="rounded-xl bg-white p-6 shadow-sm">
            {/* 제목과 액션 버튼들 */}
            <View className="mb-4 flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-gray-900 text-xl font-bold">{schedule.title}</Text>
              </View>
              <View className="flex-row space-x-3">
                <TouchableOpacity onPress={handleEdit}>
                  <Edit3 size={20} color={Colors.paleCobalt} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete}>
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <View className="border-gray-300 h-5 w-5 rounded border" />
                </TouchableOpacity>
              </View>
            </View>

            {/* 날짜 정보 */}
            <View className="mb-2 flex-row items-center">
              <Clock size={16} color={Colors.paleCobalt} />
              <Text className="text-gray-600 ml-2 text-sm">{formatDate(schedule.time)}</Text>
            </View>

            {/* 장소 정보 */}
            {schedule.location && (
              <View className="mb-6 flex-row items-center">
                <MapPin size={16} color={Colors.paleCobalt} />
                <Text className="text-gray-600 ml-2 text-sm">{schedule.location}</Text>
              </View>
            )}

            {/* 내용 */}
            <Text className="text-gray-700 mb-6 text-base leading-6">
              {schedule.contents || '내용이 없습니다.'}
            </Text>

            {/* 이미지 섹션 */}
            <View>
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-gray-900 text-base font-semibold">이미지</Text>
              </View>

              <View className="flex-row space-x-3">
                {mockImages.map((imageUrl, index) => (
                  <View key={index} className="relative">
                    <Image
                      source={{ uri: imageUrl }}
                      className="h-20 w-20 rounded-lg"
                      resizeMode="cover"
                    />
                  </View>
                ))}

                {/* 추가 버튼 */}
                <TouchableOpacity className="h-20 w-20 items-center justify-center rounded-lg bg-teal">
                  <Plus size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 하단 페이지 인디케이터 */}
      <View className="pb-safe flex-row justify-center space-x-2 py-4">
        <View className="h-2 w-2 rounded-full bg-paleCobalt" />
        <View className="bg-gray-300 h-2 w-2 rounded-full" />
        <View className="bg-gray-300 h-2 w-2 rounded-full" />
        <View className="bg-gray-300 h-2 w-2 rounded-full" />
      </View>
    </SafeAreaView>
  );
};

export default ScheduleDetailPage;
