import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useFocusEffect } from 'expo-router';
import { Calendar, Check } from 'lucide-react-native';
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';

import { CustomAlertManager } from '../../src/components/ui/custom-alert';
import { Colors } from '../../src/constants/colors';
import { useSchedulesByDate } from '../../src/features/schedule/hooks/use-schedule';
import { toggleScheduleCompletion } from '../../src/features/schedule/services/schedule-services';
import type { ScheduleType } from '../../src/features/schedule/types/schedule-types';
import { useI18n } from '../../src/hooks/use-i18n';

type TaskItemProps = {
  schedule: ScheduleType;
  onToggle: (id: number) => void;
  onPress?: () => void;
};

const SchedulePage = () => {
  const { t } = useI18n();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 선택된 날짜 기준으로 주의 날짜들 계산
  const weekDates = useMemo(() => {
    const startOfWeek = new Date(selectedDate);
    const dayOfWeek = selectedDate.getDay();
    startOfWeek.setDate(selectedDate.getDate() - dayOfWeek);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }, [selectedDate.toDateString()]);

  const days = ['일', '월', '화', '수', '목', '금', '토'];

  // 선택된 날짜의 ISO 문자열을 메모이제이션
  const selectedDateISOString = useMemo(() => {
    const dateOnly = new Date(selectedDate);
    dateOnly.setHours(0, 0, 0, 0);
    return dateOnly.toISOString();
  }, [selectedDate.toDateString()]);

  // 선택된 날짜의 일정들 가져오기
  const { schedules, loading, refetch } = useSchedulesByDate(selectedDateISOString);

  // 화면이 포커스될 때마다 일정 목록 새로고침
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // 선택된 날짜 객체 (표시용)
  const selectedDateObject = selectedDate;

  const completedSchedules = schedules.filter((s) => s.is_completed === 1);
  const incompleteSchedules = schedules.filter((s) => s.is_completed === 0);

  const handlePress = () => {
    router.push('/schedule/create');
  };

  const handleToggleCompletion = async (id: number) => {
    try {
      const success = await toggleScheduleCompletion(id);
      if (success) {
        refetch();
      } else {
        CustomAlertManager.error(
          t.locale.startsWith('en') ? 'Failed to change schedule status.' : '일정 상태 변경에 실패했습니다.',
        );
      }
    } catch (error) {
      console.error('Error toggling schedule completion:', error);
      CustomAlertManager.error(
        t.locale.startsWith('en')
          ? 'An error occurred while changing schedule status.'
          : '일정 상태 변경 중 문제가 발생했습니다.',
      );
    }
  };

  const handleSchedulePress = (scheduleId: number) => {
    router.push(`/schedule/${scheduleId}`);
  };

  const handleCalendarPress = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const TaskItem = ({ schedule, onToggle, onPress }: TaskItemProps) => {
    const scheduleTime = new Date(schedule.time);
    const timeString = scheduleTime.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity
        className="relative mb-3 rounded-xl bg-white p-4 shadow-sm"
        onPress={onPress}
      >
        <View
          className={`absolute left-0 h-full w-1 rounded-l-xl ${
            schedule.is_completed ? 'bg-teal' : 'bg-pink'
          }`}
        />
        <View className="ml-2 flex-row items-center justify-between">
          <View className="flex-1">
            <View className="mb-1 flex-row items-center">
              <Text className="mr-3 text-sm font-medium text-gray">{timeString}</Text>
              <Text className="flex-1 text-base font-bold text-black">{schedule.title}</Text>
            </View>
            {schedule.contents && (
              <Text className="mb-2 text-sm text-gray" numberOfLines={1}>
                {schedule.contents}
              </Text>
            )}
            {(schedule.location || schedule.companion) && (
              <View className="flex-row">
                {schedule.location && (
                  <Text className="mr-3 text-xs text-paleCobalt">📍 {schedule.location}</Text>
                )}
                {schedule.companion && (
                  <Text className="text-xs text-paleCobalt">👥 {schedule.companion}</Text>
                )}
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() => onToggle(schedule.id)}
            className={`h-8 w-8 items-center justify-center rounded-md ${
              schedule.is_completed ? 'bg-teal' : 'border-2 border-pink bg-white'
            }`}
          >
            {schedule.is_completed ? <Check size={16} color="white" /> : null}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-turquoise">
      <ScrollView className="flex-1">
        {/* 오늘 날짜 헤더 */}
        <View className="mt-6 px-4">
          <View className="relative mb-6 flex-row items-center justify-center">
            <Text className="text-lg font-medium text-paleCobalt">
              {selectedDateObject.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <TouchableOpacity className="absolute right-0 p-2" onPress={handleCalendarPress}>
              <Calendar color={Colors.paleCobalt} />
            </TouchableOpacity>
          </View>

          {/* 달력 날짜 */}
          <View className="mb-6 flex-row justify-between">
            {weekDates.map((date, index) => {
              const isSelected =
                selectedDate.getDate() === date.getDate() &&
                selectedDate.getMonth() === date.getMonth() &&
                selectedDate.getFullYear() === date.getFullYear();
              return (
                <View key={index} className="items-center">
                  <TouchableOpacity
                    onPress={() => setSelectedDate(date)}
                    className={`h-16 w-12 items-center justify-center gap-1 rounded-xl ${
                      isSelected ? 'bg-paleCobalt' : 'bg-white/50'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        isSelected ? 'text-white' : 'text-paleCobalt'
                      }`}
                    >
                      {days[index]}
                    </Text>
                    <Text
                      className={`text-sm font-bold ${
                        isSelected ? 'text-white' : 'text-paleCobalt'
                      }`}
                    >
                      {date.getDate()}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {/* 일정 통계 배너 */}
          <View className="mb-6 rounded-xl bg-paleYellow p-6 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="mb-1 text-lg font-bold text-paleCobalt">
                  오늘 일정 <Text className="text-black">{schedules.length}</Text>개 중
                </Text>
                <Text className="text-xl font-bold text-paleCobalt">
                  총 <Text className="text-black">{completedSchedules.length}</Text>개를 완료
                  <Text className="text-lg">했어요!</Text>
                </Text>
              </View>
              <Image className="h-16 w-16" source={require('@assets/winking-face-png.png')} />
            </View>
          </View>
        </View>

        <View className="px-4 pb-24">
          {loading ? (
            <View className="items-center py-8">
              <Text className="text-paleCobalt">일정을 불러오는 중...</Text>
            </View>
          ) : (
            <>
              {/* 범례 */}
              <View className="mb-4 flex-row justify-end">
                <View className="mr-4 flex-row items-center gap-2">
                  <View className="h-4 w-4 rounded-full bg-pink"></View>
                  <Text className="text-sm font-medium text-gray">
                    미완료 ({incompleteSchedules.length})
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <View className="h-4 w-4 rounded-full bg-teal"></View>
                  <Text className="text-sm font-medium text-gray">
                    완료 ({completedSchedules.length})
                  </Text>
                </View>
              </View>

              {schedules.length === 0 ? (
                <View className="items-center py-12">
                  <Calendar size={48} color="#9ca3af" />
                  <Text className="mt-4 text-lg font-medium text-gray">등록된 일정이 없습니다</Text>
                  <Text className="mt-2 text-sm text-gray">새로운 일정을 추가해보세요!</Text>
                  <TouchableOpacity
                    className="mt-4 rounded-lg bg-paleCobalt px-4 py-2"
                    onPress={() => router.push('/schedule/create')}
                  >
                    <Text className="text-sm text-white">일정 추가</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {/* 미완료 일정 */}
                  {incompleteSchedules.length > 0 && (
                    <>
                      <Text className="mb-3 text-lg font-bold text-black">
                        미완료 ({incompleteSchedules.length})
                      </Text>
                      {incompleteSchedules.map((schedule) => (
                        <TaskItem
                          key={schedule.id}
                          schedule={schedule}
                          onToggle={handleToggleCompletion}
                          onPress={() => handleSchedulePress(schedule.id)}
                        />
                      ))}
                    </>
                  )}

                  {/* 완료된 일정 */}
                  {completedSchedules.length > 0 && (
                    <>
                      <Text className="mb-3 mt-6 text-lg font-bold text-black">
                        완료 ({completedSchedules.length})
                      </Text>
                      {completedSchedules.map((schedule) => (
                        <TaskItem
                          key={schedule.id}
                          schedule={schedule}
                          onToggle={handleToggleCompletion}
                          onPress={() => handleSchedulePress(schedule.id)}
                        />
                      ))}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* 일정 추가 버튼 */}
      <TouchableOpacity
        className="absolute bottom-20 right-8 h-16 w-16 items-center justify-center rounded-full bg-paleCobalt shadow-lg sm:bottom-24 sm:right-12 sm:h-20 sm:w-20"
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text className="text-3xl font-light text-white sm:text-5xl">+</Text>
      </TouchableOpacity>

      {/* 날짜 선택기 */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          locale={t.locale.startsWith('en') ? 'en_US' : 'ko_KR'}
          onChange={handleDateChange}
        />
      )}
    </SafeAreaView>
  );
};

export default SchedulePage;
