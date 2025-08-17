import { Calendar as CalendarIcon } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { WEEK_DAYS } from '@/src/constants/date';
import { getWeekStart, isSameDay } from '@/src/utils/date';
import { useThemeColors } from '../providers/theme-provider';

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
  const { theme: themeColors, isDark } = useThemeColors();
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
    <View style={{
      borderRadius: 12,
      backgroundColor: themeColors.surface,
      paddingHorizontal: 16,
      paddingVertical: 12,
      shadowColor: themeColors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 4,
    }}>
      {/* 상단: 날짜, 달력 아이콘 */}
      <View style={{
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: themeColors.text,
          }}>{dateText}</Text>
        </View>
        <TouchableOpacity onPress={onCalendarIconPress || (() => {})}>
          <CalendarIcon color={themeColors.primary} size={28} />
        </TouchableOpacity>
      </View>
      {/* 요일+날짜 */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {weekDates.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          return (
            <TouchableOpacity
              key={date.toISOString()}
              onPress={() => {
                onChange(date);
              }}
              style={{
                width: 28,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 14,
                paddingVertical: 4,
                backgroundColor: isSelected ? themeColors.accent : 'transparent',
              }}
            >
              <Text style={{
                fontSize: 12,
                fontWeight: '500',
                color: isSelected ? themeColors.primary : themeColors.textSecondary,
              }}>
                {WEEK_DAYS[date.getDay()]}
              </Text>
              <Text style={{
                fontSize: 16,
                fontWeight: '500',
                color: isSelected ? themeColors.primary : themeColors.textSecondary,
              }}>
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
