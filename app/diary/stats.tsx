import { useRouter } from 'expo-router';
import { ChevronLeft, BarChart3, Calendar, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';

import { Colors } from '../../src/constants/colors';
import { DiaryService } from '../../src/features/diary/services';
import { MOOD_OPTIONS } from '../../src/features/diary/types';

const { width: screenWidth } = Dimensions.get('window');

type StatsData = {
  total: number;
  byMood: Record<string, number>;
  withMedia: number;
  monthlyCount: Record<string, number>;
  weeklyStreak: number;
};

/**
 * 기분 통계 페이지 컴포넌트
 */
const StatsPage = () => {
  const router = useRouter();
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    byMood: {},
    withMedia: 0,
    monthlyCount: {},
    weeklyStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [basicStats, allDiaries] = await Promise.all([
        DiaryService.getDiaryStats(),
        DiaryService.getAllDiaries(),
      ]);

      // 월별 통계 계산
      const monthlyCount: Record<string, number> = {};
      allDiaries.forEach((diary) => {
        if (diary.created_at) {
          const month = new Date(diary.created_at).toISOString().slice(0, 7); // YYYY-MM
          monthlyCount[month] = (monthlyCount[month] || 0) + 1;
        }
      });

      // 주간 연속 작성 계산 (간단한 로직)
      const today = new Date();
      let streak = 0;
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];

        const hasEntry = allDiaries.some((diary) => {
          if (!diary.created_at) return false;
          const diaryDate = new Date(diary.created_at).toISOString().split('T')[0];
          return diaryDate === dateStr;
        });

        if (hasEntry) {
          streak++;
        } else if (i > 0) {
          break; // 연속성이 깨지면 중단
        }
      }

      setStats({
        ...basicStats,
        monthlyCount,
        weeklyStreak: streak,
      });
    } catch (error) {
      console.error('통계 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => router.back();

  // 기분별 통계를 위한 데이터 처리
  const getMoodStats = () => {
    return MOOD_OPTIONS.map((mood) => ({
      ...mood,
      count: stats.byMood[mood.value] || 0,
      percentage: stats.total > 0 ? ((stats.byMood[mood.value] || 0) / stats.total) * 100 : 0,
    }));
  };

  // 최근 6개월 데이터
  const getRecentMonths = () => {
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' });
      months.push({
        key: monthKey,
        name: monthName,
        count: stats.monthlyCount[monthKey] || 0,
      });
    }
    return months;
  };

  const moodStats = getMoodStats();
  const recentMonths = getRecentMonths();
  const maxMonthlyCount = Math.max(...recentMonths.map((m) => m.count), 1);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 헤더 */}
      <View className="mt-8 flex-row items-center justify-between border-b-2 border-turquoise bg-white px-4 py-4">
        <TouchableOpacity onPress={handleBack}>
          <ChevronLeft size={24} color={Colors.paleCobalt} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-paleCobalt">일기 통계</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1 bg-turquoise px-4 pt-6">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray">로딩 중...</Text>
          </View>
        ) : (
          <View className="pb-20">
            {/* 전체 통계 카드 */}
            <View className="mb-6 flex-row gap-3">
              <View className="flex-1 items-center rounded-2xl bg-white p-4 shadow-sm">
                <Calendar size={24} color={Colors.paleCobalt} />
                <Text className="mt-2 text-2xl font-bold text-paleCobalt">{stats.total}</Text>
                <Text className="text-sm text-gray">총 일기</Text>
              </View>
              <View className="flex-1 items-center rounded-2xl bg-white p-4 shadow-sm">
                <TrendingUp size={24} color={Colors.paleCobalt} />
                <Text className="mt-2 text-2xl font-bold text-paleCobalt">
                  {stats.weeklyStreak}
                </Text>
                <Text className="text-sm text-gray">연속 작성일</Text>
              </View>
              <View className="flex-1 items-center rounded-2xl bg-white p-4 shadow-sm">
                <BarChart3 size={24} color={Colors.paleCobalt} />
                <Text className="mt-2 text-2xl font-bold text-paleCobalt">{stats.withMedia}</Text>
                <Text className="text-sm text-gray">미디어 포함</Text>
              </View>
            </View>

            {/* 기분별 통계 */}
            <View className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
              <Text className="mb-4 text-lg font-bold text-paleCobalt">기분별 통계</Text>
              {moodStats.map((mood) => (
                <View key={mood.value} className="mb-3 flex-row items-center">
                  <Text className="text-xl">{mood.emoji}</Text>
                  <View className="ml-3 flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-medium text-black">{mood.label}</Text>
                      <Text className="text-sm text-gray">
                        {mood.count}회 ({mood.percentage.toFixed(1)}%)
                      </Text>
                    </View>
                    <View className="bg-gray-200 mt-1 h-2 overflow-hidden rounded-full">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${mood.percentage}%`,
                          backgroundColor: Colors.paleCobalt,
                        }}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* 월별 작성 통계 */}
            <View className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
              <Text className="mb-4 text-lg font-bold text-paleCobalt">최근 6개월 작성 현황</Text>
              <View className="flex-row items-end justify-between" style={{ height: 120 }}>
                {recentMonths.map((month) => (
                  <View key={month.key} className="flex-1 items-center">
                    <View
                      className="w-6 rounded-t"
                      style={{
                        height: Math.max((month.count / maxMonthlyCount) * 80, 4),
                        backgroundColor: month.count > 0 ? Colors.paleCobalt : '#E5E7EB',
                      }}
                    />
                    <Text className="mt-2 text-xs text-gray" numberOfLines={1}>
                      {month.name.replace('년 ', '.')}
                    </Text>
                    <Text className="text-xs font-medium text-paleCobalt">{month.count}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 인사이트 */}
            <View className="rounded-2xl bg-white p-4 shadow-sm">
              <Text className="mb-3 text-lg font-bold text-paleCobalt">인사이트</Text>
              <View className="space-y-2">
                {stats.total > 0 && (
                  <>
                    <Text className="text-sm text-gray">
                      • 가장 많이 느낀 감정:{' '}
                      {
                        moodStats.find(
                          (m) => m.count === Math.max(...moodStats.map((ms) => ms.count)),
                        )?.label
                      }
                    </Text>
                    <Text className="text-sm text-gray">
                      • 미디어 포함률: {((stats.withMedia / stats.total) * 100).toFixed(1)}%
                    </Text>
                    <Text className="text-sm text-gray">
                      • 이번 달 작성: {recentMonths[recentMonths.length - 1]?.count || 0}개
                    </Text>
                    {stats.weeklyStreak > 0 && (
                      <Text className="text-sm text-green-600">
                        • 🔥 {stats.weeklyStreak}일 연속 작성 중!
                      </Text>
                    )}
                  </>
                )}
                {stats.total === 0 && (
                  <Text className="text-sm text-gray">
                    아직 작성된 일기가 없습니다. 첫 번째 일기를 작성해보세요!
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default StatsPage;
