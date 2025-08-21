import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { getWeekDays, formatMonthYear } from '../../constants/date';
import { useI18n } from '../../hooks/use-i18n';
import { useThemeColors } from '../providers/theme-provider';

interface EnhancedCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
}

const EnhancedCalendar: React.FC<EnhancedCalendarProps> = ({
  selectedDate,
  onDateSelect,
  onClose,
}) => {
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
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

  // Get localized week days
  const weekDays = getWeekDays(t.locale);

  return (
    <View style={{ width: '100%' }}>
      {/* 헤더 */}
      <View
        style={{
          marginBottom: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity
          onPress={goToPreviousMonth}
          style={{
            backgroundColor: themeColors.accent,
            borderRadius: 16,
            padding: 8,
          }}
        >
          <Text
            style={{
              color: themeColors.primary,
              fontSize: 18,
              fontWeight: 'bold',
            }}
          >
            ‹
          </Text>
        </TouchableOpacity>
        <Text
          style={{
            color: themeColors.text,
            fontSize: 20,
            fontWeight: 'bold',
          }}
        >
          {formatMonthYear(currentMonth, t.locale)}
        </Text>
        <TouchableOpacity
          onPress={goToNextMonth}
          style={{
            backgroundColor: themeColors.accent,
            borderRadius: 16,
            padding: 8,
          }}
        >
          <Text
            style={{
              color: themeColors.primary,
              fontSize: 18,
              fontWeight: 'bold',
            }}
          >
            ›
          </Text>
        </TouchableOpacity>
      </View>

      {/* 요일 헤더 */}
      <View
        style={{
          marginBottom: 16,
          flexDirection: 'row',
        }}
      >
        {weekDays.map((day, index) => (
          <View
            key={day}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 8,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color:
                  index === 0 ? '#EF4444' : index === 6 ? '#3B82F6' : themeColors.textSecondary,
              }}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* 날짜 그리드 */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      >
        {calendarDates.map((date, index) => {
          const isCurrentMonthDate = isCurrentMonth(date);
          const isTodayDate = isToday(date);
          const isSelectedDate = isSelected(date);

          return (
            <TouchableOpacity
              key={index}
              onPress={() => onDateSelect(date)}
              style={{
                height: 48,
                width: '14.28%',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 24,
                backgroundColor: isSelectedDate
                  ? themeColors.primary
                  : isTodayDate
                    ? themeColors.accent
                    : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: isSelectedDate
                    ? themeColors.primaryText
                    : isTodayDate
                      ? themeColors.primary
                      : isCurrentMonthDate
                        ? themeColors.text
                        : themeColors.textSecondary,
                }}
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
