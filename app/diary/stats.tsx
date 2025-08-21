import { useRouter } from 'expo-router';
import { ChevronLeft, BarChart3, Calendar, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';

import { useThemeColors } from '../../src/components/providers/theme-provider';
import { DiaryService } from '../../src/features/diary/services';
import { getMoodOptions } from '../../src/features/diary/types';
import { useI18n } from '../../src/hooks/use-i18n';

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
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
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
    const moodOptions = getMoodOptions(t.locale);
    return moodOptions.map((mood) => ({
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
      const monthName = date.toLocaleDateString(t.locale, { year: 'numeric', month: 'short' });
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
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      {/* 헤더 */}
      <View
        style={{
          marginTop: 32, // 상태바 아래 여백
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: themeColors.primary,
          backgroundColor: themeColors.surface,
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
      >
        <TouchableOpacity onPress={handleBack}>
          <ChevronLeft size={24} color={themeColors.primary} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: themeColors.primary,
          }}
        >
          {t.diary.stats}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={{
          flex: 1,
          backgroundColor: themeColors.background,
          paddingHorizontal: 16,
          paddingTop: 24,
        }}
      >
        {loading ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: themeColors.textSecondary }}>{t.diary.loading}</Text>
          </View>
        ) : (
          <View style={{ paddingBottom: 80 }}>
            {/* 전체 통계 카드 */}
            <View
              style={{
                marginBottom: 24,
                flexDirection: 'row',
                gap: 12,
              }}
            >
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  borderRadius: 16,
                  backgroundColor: themeColors.surface,
                  padding: 16,
                  shadowColor: themeColors.shadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Calendar size={24} color={themeColors.primary} />
                <Text
                  style={{
                    marginTop: 8,
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: themeColors.primary,
                  }}
                >
                  {stats.total}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: themeColors.textSecondary,
                  }}
                >
                  {t.diary.totalDiaries}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  borderRadius: 16,
                  backgroundColor: themeColors.surface,
                  padding: 16,
                  shadowColor: themeColors.shadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <TrendingUp size={24} color={themeColors.primary} />
                <Text
                  style={{
                    marginTop: 8,
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: themeColors.primary,
                  }}
                >
                  {stats.weeklyStreak}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: themeColors.textSecondary,
                  }}
                >
                  {t.diary.consecutiveDays}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  borderRadius: 16,
                  backgroundColor: themeColors.surface,
                  padding: 16,
                  shadowColor: themeColors.shadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <BarChart3 size={24} color={themeColors.primary} />
                <Text
                  style={{
                    marginTop: 8,
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: themeColors.primary,
                  }}
                >
                  {stats.withMedia}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: themeColors.textSecondary,
                  }}
                >
                  {t.diary.withMedia}
                </Text>
              </View>
            </View>

            {/* 기분별 통계 */}
            <View
              style={{
                marginBottom: 24,
                borderRadius: 16,
                backgroundColor: themeColors.surface,
                padding: 16,
                shadowColor: themeColors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  marginBottom: 16,
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: themeColors.primary,
                }}
              >
                {t.diary.moodStats}
              </Text>
              {moodStats.map((mood) => (
                <View
                  key={mood.value}
                  style={{
                    marginBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 20 }}>{mood.emoji}</Text>
                  <View
                    style={{
                      marginLeft: 12,
                      flex: 1,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: '500',
                          color: themeColors.text,
                        }}
                      >
                        {mood.label}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: themeColors.textSecondary,
                        }}
                      >
                        {mood.count}회 ({mood.percentage.toFixed(1)}%)
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: themeColors.backgroundSecondary,
                        marginTop: 4,
                        height: 8,
                        overflow: 'hidden',
                        borderRadius: 4,
                      }}
                    >
                      <View
                        style={{
                          height: '100%',
                          borderRadius: 4,
                          width: `${mood.percentage}%`,
                          backgroundColor: themeColors.primary,
                        }}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* 월별 작성 통계 */}
            <View
              style={{
                marginBottom: 24,
                borderRadius: 16,
                backgroundColor: themeColors.surface,
                padding: 16,
                shadowColor: themeColors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  marginBottom: 16,
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: themeColors.primary,
                }}
              >
                {t.diary.recentSixMonths}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  height: 120,
                }}
              >
                {recentMonths.map((month) => (
                  <View
                    key={month.key}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                    }}
                  >
                    <View
                      style={{
                        width: 24,
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                        height: Math.max((month.count / maxMonthlyCount) * 80, 4),
                        backgroundColor:
                          month.count > 0 ? themeColors.primary : themeColors.backgroundSecondary,
                      }}
                    />
                    <Text
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        color: themeColors.textSecondary,
                      }}
                      numberOfLines={1}
                    >
                      {month.name.replace('년 ', '.')}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '500',
                        color: themeColors.primary,
                      }}
                    >
                      {month.count}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 인사이트 */}
            <View
              style={{
                borderRadius: 16,
                backgroundColor: themeColors.surface,
                padding: 16,
                shadowColor: themeColors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  marginBottom: 12,
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: themeColors.primary,
                }}
              >
                {t.diary.insights}
              </Text>
              <View>
                {stats.total > 0 && (
                  <>
                    <Text
                      style={{
                        fontSize: 14,
                        color: themeColors.textSecondary,
                        marginBottom: 4,
                      }}
                    >
                      • {t.diary.mostFrequentMood}:{' '}
                      {
                        moodStats.find(
                          (m) => m.count === Math.max(...moodStats.map((ms) => ms.count)),
                        )?.label
                      }
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: themeColors.textSecondary,
                        marginBottom: 4,
                      }}
                    >
                      • {t.diary.mediaInclusionRate}:{' '}
                      {((stats.withMedia / stats.total) * 100).toFixed(1)}%
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: themeColors.textSecondary,
                        marginBottom: 4,
                      }}
                    >
                      • {t.diary.thisMonthWritten}:{' '}
                      {recentMonths[recentMonths.length - 1]?.count || 0}
                      {t.locale.startsWith('en') ? ' entries' : '개'}
                    </Text>
                    {stats.weeklyStreak > 0 && (
                      <Text
                        style={{
                          fontSize: 14,
                          color: '#059669',
                          marginBottom: 4,
                        }}
                      >
                        • 🔥 {stats.weeklyStreak}
                        {t.locale.startsWith('en') ? ' days' : '일'} {t.diary.consecutiveWriting}
                      </Text>
                    )}
                  </>
                )}
                {stats.total === 0 && (
                  <Text
                    style={{
                      fontSize: 14,
                      color: themeColors.textSecondary,
                    }}
                  >
                    {t.diary.noEntriesYet}
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
