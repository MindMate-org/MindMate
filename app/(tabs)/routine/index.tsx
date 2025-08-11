import { useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text, ActivityIndicator } from 'react-native';
import AddButton from 'src/components/ui/add-button';
import Calendar from 'src/components/ui/calendar';
import EnhancedCalendar from 'src/components/ui/enhanced-calendar';
import Modal from 'src/components/ui/modal';
import RoutineListCard from 'src/features/routine/components/routine-list-card';
import { useDeleteRoutine } from 'src/features/routine/hooks/use-routine-mutation';
import { useRoutineQuery } from 'src/features/routine/hooks/use-routine-query';
import { toKSTDateString, formatTime, formatDate } from 'src/lib/date-utils';

const RoutineMain = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarModalVisible, setIsCalendarModalVisible] = useState(false);

  // 루틴 조회 훅
  const { routines, isLoading, error, refetch } = useRoutineQuery({
    date: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD 형식
  });

  // 루틴 삭제 훅
  const { deleteRoutine, isLoading: isDeleting } = useDeleteRoutine();

  // 루틴 생성 페이지로 이동
  const handleCreateRoutine = useCallback(() => {
    const selectedDateStr = toKSTDateString(selectedDate);
    router.push(`/routine/new?startDate=${selectedDateStr}`);
  }, [selectedDate, router]);

  // 루틴 수정 페이지로 이동
  const handleEditRoutine = useCallback(
    (id: string) => {
      router.push(`/routine/${id}`);
    },
    [router],
  );

  // 루틴 상세 페이지로 이동
  const handleViewRoutine = useCallback(
    (id: string) => {
      router.push(`/routine/routineform?id=${id}`);
    },
    [router],
  );

  // 루틴 삭제
  const handleDeleteRoutine = useCallback(
    async (id: string) => {
      const success = await deleteRoutine(id);
      if (success) {
        refetch();
      }
    },
    [deleteRoutine, refetch],
  );

  // 날짜 변경 시 루틴 목록 새로고침
  const handleDateChange = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    // KST 00:00:00을 UTC로 맞추기 위해 Date.UTC 사용
    const kstDate = new Date(Date.UTC(year, month, day, 0, 0, 0));
    setSelectedDate(kstDate);
  };

  // 달력 아이콘 클릭 시 모달 열기
  const handleCalendarIconPress = () => {
    setIsCalendarModalVisible(true);
  };

  // 시간 문자열 포맷팅 함수
  const formatTimeString = useCallback((time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const date = new Date();
      date.setHours(hour, parseInt(minutes), 0, 0);
      return formatTime(date, '12h');
    } catch {
      return time;
    }
  }, []);

  // 루틴 시간 표시 함수
  const getRoutineTime = useCallback(
    (routine: any) => {
      if (routine.alarmTime) {
        return formatTimeString(routine.alarmTime);
      }
      return routine.repeatCycle || '시간 미설정';
    },
    [formatTimeString],
  );

  // 루틴 지속시간 표시 함수
  const getRoutineDuration = useCallback((routine: any) => {
    const subTaskCount = routine.subTasks?.length || 0;
    return `${subTaskCount}개 작업`;
  }, []);

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
        <Text className="text-cyan-600 underline" onPress={refetch}>
          다시 시도
        </Text>
      </View>
    );
  }

  const selectedDateStr = toKSTDateString(selectedDate);

  return (
    <View className="relative flex-1 bg-turquoise">
      {/* 상단 달력 */}
      <View className="px-4 pb-4 pt-8">
        <Calendar
          selectedDate={selectedDate}
          onChange={handleDateChange}
          onCalendarIconPress={handleCalendarIconPress}
        />
      </View>

      {/* 루틴 리스트 */}
      <ScrollView className="flex-1 px-4">
        {routines.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 text-center">
              {formatDate(selectedDate)}에 등록된 루틴이 없습니다.
            </Text>
            <Text className="text-gray-400 mt-2 text-sm">
              + 버튼을 눌러 새로운 루틴을 추가해보세요!
            </Text>
          </View>
        ) : (
          routines.map((routine) => (
            <RoutineListCard
              key={routine.id}
              title={routine.name}
              time={getRoutineTime(routine)}
              duration={getRoutineDuration(routine)}
              onPress={() => handleViewRoutine(routine.id)}
              onEdit={() => handleEditRoutine(routine.id)}
              onDelete={() => handleDeleteRoutine(routine.id)}
            />
          ))
        )}
      </ScrollView>

      {/* 플로팅 액션 버튼 */}
      <AddButton onPress={handleCreateRoutine} />

      {/* 월 단위 달력 모달 */}
      <Modal
        visible={isCalendarModalVisible}
        onClose={() => setIsCalendarModalVisible(false)}
        className="max-w-sm"
      >
        <EnhancedCalendar
          selectedDate={selectedDate}
          onDateSelect={(date) => {
            handleDateChange(date);
            setIsCalendarModalVisible(false);
          }}
          onClose={() => setIsCalendarModalVisible(false)}
        />
      </Modal>
    </View>
  );
};

export default RoutineMain;
