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
  SafeAreaView,
} from 'react-native';

import { useThemeColors } from '../../src/components/providers/theme-provider';

import {
  useUpdateRoutine,
  useUpdateSubTaskCompletion,
} from '../../src/features/routine/hooks/use-routine-mutation';
import { useRoutineDetailQuery } from '../../src/features/routine/hooks/use-routine-query';

const RoutineForm = () => {
  const router = useRouter();
  const { theme: themeColors, isDark } = useThemeColors();
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
      <SafeAreaView style={{ 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: isDark ? themeColors.background : '#a7f3d0' 
      }}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={{ 
          color: themeColors.textSecondary, 
          marginTop: 16 
        }}>루틴을 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <SafeAreaView style={{ 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: isDark ? themeColors.background : '#a7f3d0',
        paddingHorizontal: 16 
      }}>
        <Text style={{ 
          marginBottom: 16, 
          textAlign: 'center', 
          color: '#EF4444' 
        }}>{error}</Text>
        <TouchableOpacity 
          style={{ 
            borderRadius: 8, 
            backgroundColor: themeColors.primary, 
            paddingHorizontal: 16, 
            paddingVertical: 8 
          }} 
          onPress={refetch}
        >
          <Text style={{ color: themeColors.primaryText }}>다시 시도</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // 루틴 데이터가 없는 경우
  if (!routine) {
    return (
      <SafeAreaView style={{ 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: isDark ? themeColors.background : '#a7f3d0' 
      }}>
        <Text style={{ color: themeColors.textSecondary }}>루틴을 찾을 수 없습니다.</Text>
      </SafeAreaView>
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
    <SafeAreaView style={{ 
      flex: 1, 
      backgroundColor: isDark ? themeColors.background : '#a7f3d0' 
    }}>
      {/* 상단 여백 */}
      <View style={{ height: 32 }} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }}
      >
        {/* 카드 */}
        <View style={{
          width: '92%',
          borderRadius: 16,
          backgroundColor: themeColors.surface,
          paddingHorizontal: 24,
          paddingVertical: 24,
          shadowColor: themeColors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: 8,
        }}>
          {/* 제목/이미지 */}
          <View style={{
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{
                marginBottom: 4,
                fontSize: 22,
                fontWeight: '800',
                color: themeColors.text,
              }}>{routine.name}</Text>
              <View style={{
                marginBottom: 8,
                height: 8,
                width: 64,
                borderRadius: 4,
                backgroundColor: themeColors.accent,
              }} />
              <Text style={{
                marginBottom: 4,
                fontSize: 14,
                color: themeColors.primary,
              }}>
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
    </SafeAreaView>
  );
};

export default RoutineForm;
