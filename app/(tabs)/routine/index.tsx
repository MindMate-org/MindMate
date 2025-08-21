import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, Text, TouchableOpacity, SafeAreaView } from 'react-native';

import { useThemeColors } from '../../../src/components/providers/theme-provider';
import { CustomAlertManager } from '../../../src/components/ui/custom-alert';
import ErrorState from '../../../src/components/ui/error-state';
import FadeInView from '../../../src/components/ui/fade-in-view';
import LoadingState from '../../../src/components/ui/loading-state';
import RoutineListCard from '../../../src/features/routine/components/routine-list-card';
import { useDeleteRoutine } from '../../../src/features/routine/hooks/use-routine-mutation';
import { useRoutineQuery } from '../../../src/features/routine/hooks/use-routine-query';
import { useI18n } from '../../../src/hooks/use-i18n';
import { toKSTDateString, formatTime, formatDate } from '../../../src/lib/date-utils';

const RoutineMain = () => {
  const router = useRouter();
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 선택된 날짜 기준으로 주의 날짜들 계산
  const selectedDateString = selectedDate.toDateString();
  const weekDates = useMemo(() => {
    const startOfWeek = new Date(selectedDate);
    const dayOfWeek = selectedDate.getDay();
    startOfWeek.setDate(selectedDate.getDate() - dayOfWeek);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }, [selectedDate, selectedDateString]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };
  // 시간 문자열 포맷팅 함수
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
      router.push(`/routine/detail/${id}`);
    },
    [router],
  );

  // 루틴 삭제
  const handleDeleteRoutine = useCallback(
    async (id: string) => {
      const routine = routines.find((r) => r.id === id);
      const routineName = routine?.name || t.routine.title;

      const confirmed = await CustomAlertManager.confirm(
        t.common.delete,
        `"${routineName}" ${t.routine.deleteConfirm}`,
      );

      if (confirmed) {
        const success = await deleteRoutine(id);
        if (success) {
          refetch();
          CustomAlertManager.success(t.routine.deleteSuccess);
        } else {
          CustomAlertManager.error(t.routine.deleteFailed);
        }
      }
    },
    [deleteRoutine, refetch, routines],
  );

  const handleCalendarPress = () => {
    setShowDatePicker(true);
  };

  // 시간 문자열 포맷팅 함수
  const formatTimeString = useCallback(
    (time: string) => {
      try {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const date = new Date();
        date.setHours(hour, parseInt(minutes), 0, 0);
        return formatTime(date, '12h', t.locale.startsWith('en') ? 'en' : 'ko');
      } catch {
        return time;
      }
    },
    [t.locale],
  );

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
    return `${subTaskCount}${t.routine.tasks}`;
  }, []);

  // 로딩 상태
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
        <LoadingState message={t.routine.loading} />
      </SafeAreaView>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
        <ErrorState message={error} onRetry={refetch} />
      </SafeAreaView>
    );
  }

  const selectedDateStr = toKSTDateString(selectedDate);

  return (
    <SafeAreaView
      style={{ position: 'relative', flex: 1, backgroundColor: themeColors.background }}
    >
      {/* 상단 달력 */}
      <FadeInView delay={0} duration={300}>
        <View style={{ marginTop: 16, paddingHorizontal: 16, paddingBottom: 16 }}>
          {/* 날짜 표시 */}
          <View
            style={{
              position: 'relative',
              marginBottom: 24,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '500',
                color: themeColors.primary,
              }}
            >
              {selectedDate.toLocaleDateString(t.locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <TouchableOpacity
              style={{
                position: 'absolute',
                right: 0,
                padding: 8,
              }}
              onPress={handleCalendarPress}
            >
              <CalendarIcon color={themeColors.primary} />
            </TouchableOpacity>
          </View>

          {/* 달력 날짜 */}
          <View
            style={{
              marginBottom: 24,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            {weekDates.map((date, index) => {
              const isSelected =
                selectedDate.getDate() === date.getDate() &&
                selectedDate.getMonth() === date.getMonth() &&
                selectedDate.getFullYear() === date.getFullYear();
              return (
                <View key={index} style={{ alignItems: 'center' }}>
                  <TouchableOpacity
                    onPress={() => setSelectedDate(date)}
                    style={{
                      height: 64,
                      width: 48,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 12,
                      backgroundColor: isSelected
                        ? themeColors.primary
                        : isDark
                          ? `${themeColors.surface}80`
                          : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '500',
                        color: isSelected ? themeColors.primaryText : themeColors.primary,
                      }}
                    >
                      {t.schedule.days[index]}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: isSelected ? themeColors.primaryText : themeColors.primary,
                        marginTop: 4,
                      }}
                    >
                      {date.getDate()}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      </FadeInView>

      {/* 루틴 리스트 */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {routines.length === 0 ? (
          <FadeInView delay={100} duration={300}>
            <View className="flex-1 items-center justify-center py-20">
              <CalendarIcon size={48} color={themeColors.primary} />
              <Text
                style={{
                  marginTop: 16,
                  textAlign: 'center',
                  fontSize: 18,
                  color: themeColors.text,
                  fontWeight: '500',
                }}
              >
                {t.locale.startsWith('en')
                  ? `${t.routine.noRoutines} ${formatDate(selectedDate, 'en')}.`
                  : `${formatDate(selectedDate, 'ko')}에 ${t.routine.noRoutines}.`}
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  textAlign: 'center',
                  fontSize: 14,
                  color: themeColors.textSecondary,
                }}
              >
                {t.routine.addNewRoutine}
              </Text>
            </View>
          </FadeInView>
        ) : (
          routines.map((routine, index) => (
            <FadeInView key={routine.id} delay={index * 50} duration={300}>
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
        <Text
          style={{
            fontSize: 28,
            fontWeight: '300',
            color: themeColors.primaryText,
          }}
        >
          +
        </Text>
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

export default RoutineMain;
