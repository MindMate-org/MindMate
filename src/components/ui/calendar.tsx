import { Calendar as CalendarIcon } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { WEEK_DAYS } from '@/src/constants/date';
import { getWeekStart, isSameDay } from '@/src/utils/date';

/**
 * 1주 단위 가로 달력 컴포넌트
 * @param selectedDate - 선택된 날짜
 * @param onChange - 날짜 선택 시 콜백
 * @param onCalendarIconPress - 달력 아이콘 클릭 시 콜백
 * @param className - 추가적인 스타일 클래스
 */
type CalendarProps = {
  selectedDate: Date;
  onChange: (date: Date) => void;
  onCalendarIconPress?: () => void;
  className?: string;
};

const Calendar = ({
  selectedDate,
  onChange,
  onCalendarIconPress,
  className = '',
}: CalendarProps) => {
  const [viewDate, setViewDate] = useState(getWeekStart(selectedDate));

  useEffect(() => {
    setViewDate(getWeekStart(selectedDate));
  }, [selectedDate]);

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      return new Date(viewDate.getFullYear(), viewDate.getMonth(), viewDate.getDate() + i);
    });
  }, [viewDate]);

  // 날짜 포맷: 2025년 7월 4일
  const dateText = `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;

  return (
    <View className={`rounded-xl bg-white px-4 py-3 shadow-dropShadow ${className}`}>
      {/* 상단: 날짜, 달력 아이콘 */}
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold">{dateText}</Text>
        </View>
        <TouchableOpacity onPress={onCalendarIconPress || (() => {})}>
          <CalendarIcon color="#576BCD" size={28} />
        </TouchableOpacity>
      </View>
      {/* 요일+날짜 */}
      <View className="flex-row items-center justify-between">
        {weekDates.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          return (
            <TouchableOpacity
              key={date.toISOString()}
              onPress={() => {
                onChange(date);
              }}
              className={`w-7 items-center justify-center rounded-full py-1 ${isSelected ? 'bg-paleYellow' : ''}`}
            >
              <Text className={`text-xs font-medium ${isSelected ? 'text-black' : 'text-gray'}`}>
                {WEEK_DAYS[date.getDay()]}
              </Text>
              <Text className={`text-base font-medium ${isSelected ? 'text-black' : 'text-gray'}`}>
                {date.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default Calendar;
