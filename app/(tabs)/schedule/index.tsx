import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useFocusEffect } from 'expo-router';
import { Calendar, Check } from 'lucide-react-native';
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';

import { useThemeColors } from '../../../src/components/providers/theme-provider';
import { CustomAlertManager } from '../../../src/components/ui/custom-alert';
import { useSchedulesByDate } from '../../../src/features/schedule/hooks/use-schedule';
import { toggleScheduleCompletion } from '../../../src/features/schedule/services/schedule-services';
import type { ScheduleType } from '../../../src/features/schedule/types/schedule-types';
import { useI18n } from '../../../src/hooks/use-i18n';

type TaskItemProps = {
  schedule: ScheduleType;
  onToggle: (id: number) => void;
  onPress?: () => void;
};

const SchedulePage = () => {
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
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

  // const days = ['일', '월', '화', '수', '목', '금', '토']; // 제거됨 - t.schedule.days 사용

  // 선택된 날짜의 ISO 문자열을 메모이제이션
  const selectedDateISOString = useMemo(() => {
    const dateOnly = new Date(selectedDate);
    dateOnly.setHours(0, 0, 0, 0);
    return dateOnly.toISOString();
  }, [selectedDate]);

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
        CustomAlertManager.error(t.schedule.toggleFailed);
      }
    } catch (error) {
      console.error('Error toggling schedule completion:', error);
      CustomAlertManager.error(t.schedule.toggleError);
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
    const timeString = scheduleTime.toLocaleTimeString(
      t.locale.startsWith('en') ? 'en-US' : 'ko-KR',
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    );

    return (
      <TouchableOpacity
        style={{
          position: 'relative',
          marginBottom: 12,
          borderRadius: 12,
          backgroundColor: themeColors.surface,
          padding: 16,
          shadowColor: themeColors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isDark ? 0.2 : 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
        onPress={onPress}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            height: '100%',
            width: 4,
            borderTopLeftRadius: 12,
            borderBottomLeftRadius: 12,
            backgroundColor: schedule.is_completed ? '#14b8a6' : '#ec4899',
          }}
        />
        <View
          style={{
            marginLeft: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                marginBottom: 4,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  marginRight: 12,
                  fontSize: 14,
                  fontWeight: '500',
                  color: themeColors.textSecondary,
                }}
              >
                {timeString}
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: themeColors.text,
                }}
              >
                {schedule.title}
              </Text>
            </View>
            {schedule.contents && (
              <Text
                style={{
                  marginBottom: 8,
                  fontSize: 14,
                  color: themeColors.textSecondary,
                }}
                numberOfLines={1}
              >
                {schedule.contents}
              </Text>
            )}
            {(schedule.location || schedule.companion) && (
              <View style={{ flexDirection: 'row' }}>
                {schedule.location && (
                  <Text
                    style={{
                      marginRight: 12,
                      fontSize: 12,
                      color: themeColors.primary,
                    }}
                  >
                    📍 {schedule.location}
                  </Text>
                )}
                {schedule.companion && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: themeColors.primary,
                    }}
                  >
                    👥 {schedule.companion}
                  </Text>
                )}
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() => onToggle(schedule.id)}
            style={{
              height: 32,
              width: 32,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6,
              backgroundColor: schedule.is_completed ? '#14b8a6' : themeColors.surface,
              borderWidth: schedule.is_completed ? 0 : 2,
              borderColor: '#ec4899',
            }}
          >
            {schedule.is_completed ? <Check size={16} color="white" /> : null}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ScrollView style={{ flex: 1 }}>
        {/* 오늘 날짜 헤더 */}
        <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
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
              {selectedDateObject.toLocaleDateString(t.locale, {
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
              <Calendar color={themeColors.primary} />
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

          {/* 일정 통계 배너 */}
          <View
            style={{
              marginBottom: 24,
              borderRadius: 12,
              backgroundColor: themeColors.accent,
              padding: 24,
              shadowColor: themeColors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isDark ? 0.2 : 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    marginBottom: 4,
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: themeColors.primary,
                  }}
                >
                  {t.schedule.todaySchedule}{' '}
                  <Text style={{ color: themeColors.text }}>{schedules.length}</Text>
                  {t.schedule.count}
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: themeColors.primary,
                  }}
                >
                  {t.schedule.total}{' '}
                  <Text style={{ color: themeColors.text }}>{completedSchedules.length}</Text>
                  {t.schedule.completed}
                  <Text style={{ fontSize: 18 }}>{t.schedule.great}</Text>
                </Text>
              </View>
              <Image
                style={{ height: 64, width: 64 }}
                source={require('../../../assets/winking-face-png.png')}
              />
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, paddingBottom: 96 }}>
          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Text style={{ color: themeColors.primary }}>{t.schedule.loading}</Text>
            </View>
          ) : (
            <>
              {/* 범례 */}
              <View
                style={{
                  marginBottom: 16,
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                }}
              >
                <View
                  style={{
                    marginRight: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      height: 16,
                      width: 16,
                      borderRadius: 8,
                      backgroundColor: '#ec4899',
                    }}
                  ></View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: themeColors.textSecondary,
                      marginLeft: 8,
                    }}
                  >
                    {t.schedule.incomplete} ({incompleteSchedules.length})
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      height: 16,
                      width: 16,
                      borderRadius: 8,
                      backgroundColor: '#14b8a6',
                    }}
                  ></View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: themeColors.textSecondary,
                      marginLeft: 8,
                    }}
                  >
                    {t.schedule.complete} ({completedSchedules.length})
                  </Text>
                </View>
              </View>

              {schedules.length === 0 ? (
                <View
                  style={{
                    alignItems: 'center',
                    paddingVertical: 48,
                  }}
                >
                  <Calendar size={48} color={themeColors.textSecondary} />
                  <Text
                    style={{
                      marginTop: 16,
                      fontSize: 18,
                      fontWeight: '500',
                      color: themeColors.textSecondary,
                    }}
                  >
                    {t.schedule.noSchedules}
                  </Text>
                  <Text
                    style={{
                      marginTop: 8,
                      fontSize: 14,
                      color: themeColors.textSecondary,
                    }}
                  >
                    {t.schedule.addNewSchedule}
                  </Text>
                  <TouchableOpacity
                    style={{
                      marginTop: 16,
                      borderRadius: 8,
                      backgroundColor: themeColors.primary,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                    }}
                    onPress={() => router.push('/schedule/create')}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: themeColors.primaryText,
                      }}
                    >
                      {t.schedule.addSchedule}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {/* 미완료 일정 */}
                  {incompleteSchedules.length > 0 && (
                    <>
                      <Text
                        style={{
                          marginBottom: 12,
                          fontSize: 18,
                          fontWeight: 'bold',
                          color: themeColors.text,
                        }}
                      >
                        {t.schedule.incomplete} ({incompleteSchedules.length})
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
                      <Text
                        style={{
                          marginBottom: 12,
                          marginTop: 24,
                          fontSize: 18,
                          fontWeight: 'bold',
                          color: themeColors.text,
                        }}
                      >
                        {t.schedule.complete} ({completedSchedules.length})
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
        onPress={handlePress}
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

export default SchedulePage;
