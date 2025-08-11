import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  useUpdateRoutine,
  useUpdateSubTaskCompletion,
} from 'src/features/routine/hooks/use-routine-mutation';
import { useRoutineDetailQuery } from 'src/features/routine/hooks/use-routine-query';

const RoutineForm = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [subTaskChecks, setSubTaskChecks] = useState<boolean[]>([]);

  // 루틴 상세 조회 훅
  const { routine, isLoading, error, refetch } = useRoutineDetailQuery(id as string);

  // 루틴 수정 훅
  const { updateRoutine, isLoading: isUpdating } = useUpdateRoutine();

  // 하위 작업 완료 상태 변경 훅
  const { updateCompletion, isLoading: isUpdatingTask } = useUpdateSubTaskCompletion();

  // 루틴 데이터가 로드되면 하위 작업 체크 상태 초기화
  useEffect(() => {
    if (routine) {
      setSubTaskChecks(routine.subTasks.map((task) => task.isCompleted));
    }
  }, [routine]);

  // 하위 작업 체크 상태 변경
  const handleSubTaskToggle = async (index: number, checked: boolean) => {
    if (!routine) return;

    const subTask = routine.subTasks[index];
    if (!subTask) return;

    const success = await updateCompletion(subTask.id, checked);
    if (success) {
      const newChecks = [...subTaskChecks];
      newChecks[index] = checked;
      setSubTaskChecks(newChecks);
    }
  };

  // 루틴 완료 처리
  const handleCompleteRoutine = () => {
    Alert.alert('루틴 완료', '모든 하위 작업이 완료되었습니다! 루틴을 완료 처리하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '완료',
        onPress: () => {
          // TODO: 루틴 완료 처리 로직 (루틴 실행 기록 저장)
          Alert.alert('축하합니다!', '루틴을 성공적으로 완료했습니다.');
        },
      },
    ]);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-turquoise">
        <ActivityIndicator size="large" color="#0891b2" />
        <Text className="text-gray-600 mt-4">루틴을 불러오는 중...</Text>
      </View>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-turquoise px-4">
        <Text className="mb-4 text-center text-red-500">{error}</Text>
        <TouchableOpacity className="rounded-lg bg-cyan-600 px-4 py-2" onPress={refetch}>
          <Text className="text-white">다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 루틴 데이터가 없는 경우
  if (!routine) {
    return (
      <View className="flex-1 items-center justify-center bg-turquoise">
        <Text className="text-gray-600">루틴을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  // 시간 포맷팅 함수
  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const allTasksCompleted = subTaskChecks.every(Boolean);
  const completedCount = subTaskChecks.filter(Boolean).length;
  const totalCount = subTaskChecks.length;

  return (
    <View className="flex-1 bg-[#F4F4F4]">
      {/* 상단 여백 */}
      <View style={{ height: 32 }} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }}
      >
        {/* 카드 */}
        <View className="w-[92%] rounded-2xl bg-white px-6 py-6 shadow-lg">
          {/* 제목/이미지 */}
          <View className="mb-2 flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="mb-1 text-[22px] font-extrabold text-[#222]">{routine.name}</Text>
              <View className="mb-2 h-2 w-16 rounded-full bg-[#F7E6C4]" />
              <Text className="mb-1 text-[14px] text-[#7B7FD6]">
                {routine.createdAt && routine.deadline
                  ? `${routine.createdAt.slice(0, 10)} ~ ${routine.deadline}`
                  : ''}
              </Text>
              <Text className="mb-1 text-[14px] text-[#7B7FD6]">{routine.repeatCycle} 30분</Text>
            </View>
            {routine.imageUrl && (
              <Image
                source={{ uri: routine.imageUrl }}
                className="ml-4 h-24 w-24 rounded-lg"
                resizeMode="cover"
              />
            )}
          </View>

          {/* 상세 */}
          <Text className="mb-1 mt-2 text-[15px] font-bold text-[#7B7FD6]">상세</Text>
          <View className="mb-3 rounded-xl bg-[#F7F8FD] px-4 py-3 shadow-sm">
            <Text className="text-[15px] text-[#222]">{routine.details || '설명이 없습니다.'}</Text>
          </View>

          {/* 알림 */}
          <View className="mb-4 flex-row items-center rounded-xl bg-[#F7F8FD] px-4 py-3 shadow-sm">
            <Ionicons
              name="alarm-outline"
              size={20}
              color={routine.alarmTime ? '#FF4848' : '#B0B8CC'}
              style={{ marginRight: 8 }}
            />
            <Text className="text-[16px] text-[#222]">
              {routine.alarmTime ? routine.alarmTime.replace(':', ' : ') : '알림 없음'}
            </Text>
          </View>

          {/* 하위 작업 */}
          <Text className="mb-2 text-[15px] font-bold text-[#7B7FD6]">하위 작업</Text>
          <View className="gap-2">
            {routine.subTasks.map((task, index) => (
              <View key={task.id} className="mb-2 flex-row items-center">
                <View className="flex-1 flex-row items-center justify-between rounded-xl bg-[#7B7FD6] px-4 py-3">
                  <Text className="text-[16px] font-bold text-white">{task.title}</Text>
                  <TouchableOpacity
                    onPress={() => handleSubTaskToggle(index, !subTaskChecks[index])}
                  >
                    <Ionicons
                      name={subTaskChecks[index] ? 'checkbox' : 'square-outline'}
                      size={22}
                      color={subTaskChecks[index] ? '#576BCD' : '#B0B8CC'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default RoutineForm;
