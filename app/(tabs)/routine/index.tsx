import { useRouter } from 'expo-router';
import { Calendar as CalendarIcon, Plus } from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity, SafeAreaView } from 'react-native';

import Calendar from '../../../src/components/ui/calendar';
import { CustomAlertManager } from '../../../src/components/ui/custom-alert';
import EnhancedCalendar from '../../../src/components/ui/enhanced-calendar';
import ErrorState from '../../../src/components/ui/error-state';
import FadeInView from '../../../src/components/ui/fade-in-view';
import LoadingState from '../../../src/components/ui/loading-state';
import Modal from '../../../src/components/ui/modal';
import { useThemeColors } from '../../../src/components/providers/theme-provider';
import { useI18n } from '../../../src/hooks/use-i18n';
import RoutineListCard from '../../../src/features/routine/components/routine-list-card';
import { useDeleteRoutine } from '../../../src/features/routine/hooks/use-routine-mutation';
import { useRoutineQuery } from '../../../src/features/routine/hooks/use-routine-query';
import { toKSTDateString, formatTime, formatDate } from '../../../src/lib/date-utils';

const RoutineMain = () => {
  const router = useRouter();
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
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
      router.push(`/routine/routine-form?id=${id}`);
    },
    [router],
  );

  // 루틴 삭제
  const handleDeleteRoutine = useCallback(
    async (id: string) => {
      const routine = routines.find(r => r.id === id);
      const routineName = routine?.name || '루틴';
      
      const confirmed = await CustomAlertManager.confirm(
        '루틴 삭제',
        `"${routineName}"을(를) 정말 삭제하시겠습니까?`
      );
      
      if (confirmed) {
        const success = await deleteRoutine(id);
        if (success) {
          refetch();
          CustomAlertManager.success('루틴이 삭제되었습니다.');
        } else {
          CustomAlertManager.error('루틴 삭제에 실패했습니다.');
        }
      }
    },
    [deleteRoutine, refetch, routines],
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
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? themeColors.background : '#F0F3FF' }}>
        <LoadingState message={t.routine.loading} />
      </SafeAreaView>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? themeColors.background : '#F0F3FF' }}>
        <ErrorState message={error} onRetry={refetch} />
      </SafeAreaView>
    );
  }

  const selectedDateStr = toKSTDateString(selectedDate);

  return (
    <SafeAreaView style={{ position: 'relative', flex: 1, backgroundColor: isDark ? themeColors.background : '#F0F3FF' }}>
      {/* 헤더 */}
      <FadeInView>
        <View className="flex-row items-center justify-between px-4 pb-4 pt-2">
          <Text className="text-xl font-bold text-paleCobalt">루틴</Text>
          <TouchableOpacity
            onPress={handleCalendarIconPress}
            className="rounded-full bg-white/10 p-2"
          >
            <CalendarIcon size={20} color="#576BCD" />
          </TouchableOpacity>
        </View>
      </FadeInView>

      {/* 상단 달력 */}
      <FadeInView delay={200}>
        <View className="px-4 pb-4">
          <Calendar
            selectedDate={selectedDate}
            onChange={handleDateChange}
            onCalendarIconPress={handleCalendarIconPress}
          />
        </View>
      </FadeInView>

      {/* 루틴 리스트 */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {routines.length === 0 ? (
          <FadeInView delay={400}>
            <View className="flex-1 items-center justify-center py-20">
              <CalendarIcon size={48} color="#576BCD" />
              <Text className="mt-4 text-center text-lg text-paleCobalt">
                {formatDate(selectedDate)}에 등록된 루틴이 없습니다.
              </Text>
              <Text className="text-gray-600 mt-2 text-center text-sm">
                + 버튼을 눌러 새로운 루틴을 추가해보세요!
              </Text>
            </View>
          </FadeInView>
        ) : (
          routines.map((routine, index) => (
            <FadeInView key={routine.id} delay={400 + index * 100}>
              <RoutineListCard
                title={routine.name}
                time={getRoutineTime(routine)}
                duration={getRoutineDuration(routine)}
                onPress={() => handleViewRoutine(routine.id)}
                onEdit={() => handleEditRoutine(routine.id)}
                onDelete={() => handleDeleteRoutine(routine.id)}
              />
            </FadeInView>
          ))
        )}
        <View className="h-20" />
      </ScrollView>

      {/* 플로팅 액션 버튼 */}
      <TouchableOpacity
        onPress={handleCreateRoutine}
        style={{
          position: 'absolute',
          bottom: 80,
          right: 32,
          height: 64,
          width: 64,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 32,
          backgroundColor: themeColors.primary,
          shadowColor: themeColors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.4 : 0.2,
          shadowRadius: 8,
          elevation: 8,
        }}
        activeOpacity={0.8}
      >
        <Text style={{
          fontSize: 28,
          fontWeight: '300',
          color: themeColors.primaryText,
        }}>+</Text>
      </TouchableOpacity>

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
    </SafeAreaView>
  );
};

export default RoutineMain;
