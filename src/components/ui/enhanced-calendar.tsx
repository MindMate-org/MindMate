import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface EnhancedCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
}

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const EnhancedCalendar: React.FC<EnhancedCalendarProps> = ({
  selectedDate,
  onDateSelect,
  onClose,
}) => {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );

  // 캘린더 날짜 계산을 useMemo로 최적화
  const calendarDates = useMemo(() => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const dates: Date[] = [];

    // 이전 달의 마지막 주 일부
    const firstDayWeekday = firstDayOfMonth.getDay();
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const prevDate = new Date(firstDayOfMonth);
      prevDate.setDate(prevDate.getDate() - (i + 1));
      dates.push(prevDate);
    }

    // 현재 달의 모든 날짜
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      dates.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }

    // 다음 달의 첫 번째 주 일부 (6주로 완성)
    const remainingDays = 42 - dates.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(lastDayOfMonth);
      nextDate.setDate(nextDate.getDate() + i);
      dates.push(nextDate);
    }

    return dates;
  }, [currentMonth]);

  // 월 이동 함수들을 useCallback으로 최적화
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  }, [currentMonth]);

  // 날짜 비교 함수들을 useCallback으로 최적화
  const isCurrentMonth = useCallback(
    (date: Date) => {
      return (
        date.getMonth() === currentMonth.getMonth() &&
        date.getFullYear() === currentMonth.getFullYear()
      );
    },
    [currentMonth],
  );

  const isToday = useCallback((date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }, []);

  const isSelected = useCallback(
    (date: Date) => {
      return (
        date.getFullYear() === selectedDate.getFullYear() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getDate() === selectedDate.getDate()
      );
    },
    [selectedDate],
  );

  return (
    <View className="w-full">
      {/* 헤더 */}
      <View className="mb-6 flex-row items-center justify-between">
        <TouchableOpacity onPress={goToPreviousMonth} className="bg-gray-100 rounded-full p-2">
          <Text className="text-gray-600 text-lg font-bold">‹</Text>
        </TouchableOpacity>
        <Text className="text-gray-800 text-xl font-bold">
          {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
        </Text>
        <TouchableOpacity onPress={goToNextMonth} className="bg-gray-100 rounded-full p-2">
          <Text className="text-gray-600 text-lg font-bold">›</Text>
        </TouchableOpacity>
      </View>

      {/* 요일 헤더 */}
      <View className="mb-4 flex-row">
        {WEEK_DAYS.map((day, index) => (
          <View key={day} className="flex-1 items-center py-2">
            <Text
              className={`text-sm font-medium ${
                index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
              }`}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* 날짜 그리드 */}
      <View className="flex-row flex-wrap">
        {calendarDates.map((date, index) => {
          const isCurrentMonthDate = isCurrentMonth(date);
          const isTodayDate = isToday(date);
          const isSelectedDate = isSelected(date);

          return (
            <TouchableOpacity
              key={index}
              onPress={() => onDateSelect(date)}
              className={`h-12 w-[14.28%] items-center justify-center rounded-full ${
                isSelectedDate ? 'bg-cyan-500' : isTodayDate ? 'bg-cyan-100' : ''
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isSelectedDate
                    ? 'text-white'
                    : isTodayDate
                      ? 'text-cyan-600'
                      : isCurrentMonthDate
                        ? 'text-gray-800'
                        : 'text-gray-400'
                }`}
              >
                {date.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default EnhancedCalendar;
