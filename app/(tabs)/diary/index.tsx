import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Search,
  Trash2,
  BarChart3,
  Star,
  PenTool,
  Calendar,
} from 'lucide-react-native';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useThemeColors } from '../../../src/components/providers/theme-provider';
import { useI18n } from '../../../src/hooks/use-i18n';
import { DiaryListItem } from '../../../src/features/diary/components/diary-list-item';
import SearchModal from '../../../src/features/diary/components/search-modal';
import { DiaryService } from '../../../src/features/diary/services';
import { groupDiariesByPeriod } from '../../../src/features/diary/utils/diary-grouping';
import { formatDateTimeString } from '../../../src/lib/date-utils';

type SortOrderType = 'asc' | 'desc';

/**
 * 일기 목록 페이지 컴포넌트
 *
 * 사용자의 모든 일기를 보여주는 메인 페이지입니다.
 * 일기들을 날짜별로 그룹화하여 표시하고, 다양한 기능을 제공합니다.
 *
 * 주요 기능:
 * - 일기 목록 표시 (썸네일 이미지 포함)
 * - 정렬 기능 (최신순/오래된순)
 * - 검색, 휴지통, 통계, 북마크 기능 접근
 * - 새 일기 작성 버튼
 * - 날짜 기반 섹션 그룹화
 * - 실시간 데이터 새로고침 (useFocusEffect)
 *
 * @component
 * @example
 * ```tsx
 * // 탭 네비게이션에서 사용
 * <Tab.Screen name="diary" component={DiaryListPage} />
 * ```
 */
const DiaryListPage = () => {
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
  const [diaries, setDiaries] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filteredDiaries, setFilteredDiaries] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrderType>('desc');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorCount, setErrorCount] = useState(0);

  const fetchDiaries = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorCount(0);

      const result = await DiaryService.getAllDiariesWithMedia();
      setDiaries(result);
      if (!isSearchActive) {
        setFilteredDiaries(result);
      }
    } catch (err) {
      console.error('일기 불러오기 실패:', err);
      setErrorCount((prev) => prev + 1);

      // 에러가 3번 이상 발생하면 사용자에게 알림
      console.warn('일기 조회 에러가 반복 발생:', err);

      // 에러 발생 시 빈 배열로 설정
      setDiaries([]);
      setFilteredDiaries([]);
    } finally {
      setIsLoading(false);
    }
  }, [isSearchActive]);

  useEffect(() => {
    fetchDiaries();
  }, [fetchDiaries]);

  // 페이지 포커스 시마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchDiaries();
    }, [fetchDiaries]),
  );

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  const handleSearch = useCallback(async (filters: any) => {
    try {
      setIsLoading(true);
      const searchResult = await DiaryService.searchDiaries({
        keyword: filters.keyword,
        startDate: filters.startDate,
        endDate: filters.endDate,
        mood: filters.mood,
        hasMedia: filters.hasMedia,
      });
      setFilteredDiaries(searchResult);
      setIsSearchActive(true);
    } catch (error) {
      console.error('검색 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleResetSearch = useCallback(() => {
    setFilteredDiaries(diaries);
    setIsSearchActive(false);
  }, [diaries]);

  // 썸네일 URI 설정 및 정렬을 useMemo로 최적화
  const sortedDiaries = useMemo(() => {
    const diariesWithThumbnail = filteredDiaries.map((item) => ({
      ...item,
      thumbnailUri: item.media_uri,
    }));

    return [...diariesWithThumbnail].sort((a, b) => {
      const dateA = new Date(a.updated_at ?? a.created_at ?? '').getTime();
      const dateB = new Date(b.updated_at ?? b.created_at ?? '').getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [filteredDiaries, sortOrder]);

  // 그룹화를 useMemo로 최적화
  const grouped = useMemo(() => 
    groupDiariesByPeriod(sortedDiaries, t.locale.startsWith('en') ? 'en' : 'ko', selectedDate), 
    [sortedDiaries, t.locale, selectedDate]
  );

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingTop: 24,
          paddingBottom: 80,
        }}
      >
        {/* 기능 버튼들 */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={{
                minHeight: 40,
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                backgroundColor: selectedDate ? themeColors.primary : themeColors.surface,
                paddingHorizontal: 8,
                paddingVertical: 8,
                shadowColor: themeColors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 2,
                elevation: 2,
                marginRight: 8,
              }}
            >
              <Calendar color={selectedDate ? themeColors.primaryText : themeColors.primary} size={14} />
              <Text style={{ 
                fontSize: 12, 
                fontWeight: '500', 
                color: selectedDate ? themeColors.primaryText : themeColors.text,
                marginLeft: 4,
              }}>
                {selectedDate ? selectedDate.toLocaleDateString(t.locale) : t.diary.filterByDate || '날짜 선택'}
              </Text>
            </Pressable>
            {selectedDate && (
              <Pressable
                onPress={() => setSelectedDate(undefined)}
                style={{
                  minHeight: 40,
                  paddingHorizontal: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  backgroundColor: themeColors.surface,
                  shadowColor: themeColors.shadow,
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <Text style={{ 
                  fontSize: 12, 
                  fontWeight: '500', 
                  color: themeColors.text,
                }}>{t.diary.reset}</Text>
              </Pressable>
            )}
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Pressable
              onPress={() => router.push('/diary/trash')}
              style={{
                minHeight: 40,
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                backgroundColor: themeColors.surface,
                paddingHorizontal: 8,
                paddingVertical: 8,
                shadowColor: themeColors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 2,
                elevation: 2,
                marginRight: 8,
              }}
            >
              <Trash2 color={themeColors.primary} size={14} />
              <Text style={{ 
                fontSize: 12, 
                fontWeight: '500', 
                color: themeColors.text,
                marginLeft: 4,
              }}>{t.diary.trash}</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/diary/stats')}
              style={{
                minHeight: 40,
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                backgroundColor: themeColors.surface,
                paddingHorizontal: 8,
                paddingVertical: 8,
                shadowColor: themeColors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 2,
                elevation: 2,
                marginRight: 8,
              }}
            >
              <BarChart3 color={themeColors.primary} size={14} />
              <Text style={{ fontSize: 12, fontWeight: '500', color: themeColors.text, marginLeft: 4 }}>{t.diary.stats}</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/diary/favorites')}
              style={{
                minHeight: 40,
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                backgroundColor: themeColors.surface,
                paddingHorizontal: 8,
                paddingVertical: 8,
                shadowColor: themeColors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 2,
                elevation: 2,
                marginRight: 8,
              }}
            >
              <Star color={'#FFD700'} size={14} fill={'#FFD700'} />
              <Text style={{ fontSize: 12, fontWeight: '500', color: themeColors.text, marginLeft: 4 }}>{t.diary.bookmarks}</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowSearchModal(true)}
              style={{
                minHeight: 40,
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                backgroundColor: themeColors.surface,
                paddingHorizontal: 8,
                paddingVertical: 8,
                shadowColor: themeColors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Search color={themeColors.primary} size={14} />
              <Text style={{ fontSize: 12, fontWeight: '500', color: themeColors.text, marginLeft: 4 }}>{t.common.search}</Text>
            </Pressable>
          </View>
          {isSearchActive && (
            <View style={{ marginTop: 8, paddingHorizontal: 8 }}>
              <Pressable
                onPress={handleResetSearch}
                style={{
                  borderRadius: 8,
                  backgroundColor: themeColors.accent,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                }}
              >
                <Text style={{
                  textAlign: 'center',
                  fontSize: 14,
                  fontWeight: '500',
                  color: themeColors.primary,
                }}>{t.common.showAll}</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* 섹션별 목록, 로딩 상태, 또는 빈 상태 */}
        {isLoading ? (
          // 로딩 상태
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
            <ActivityIndicator size="large" color={themeColors.primary} />
            <Text style={{
              marginTop: 16,
              textAlign: 'center',
              fontSize: 16,
              color: themeColors.primary,
            }}>
              {t.diary.loading}
            </Text>
          </View>
        ) : Object.keys(grouped).length === 0 ? (
          // 빈 상태 UI
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, marginTop: 0 }}>
            {isSearchActive ? (
              // 검색 결과 없음
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  marginBottom: 24,
                  borderRadius: 48,
                  backgroundColor: themeColors.surface,
                  padding: 24,
                  shadowColor: themeColors.shadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 8,
                  elevation: 8,
                }}>
                  <Search size={48} color={themeColors.textSecondary} />
                </View>
                <Text style={{
                  color: themeColors.text,
                  marginBottom: 12,
                  textAlign: 'center',
                  fontSize: 20,
                  fontWeight: 'bold',
                }}>
                  {t.diary.noSearchResults}
                </Text>
                <Text style={{
                  color: themeColors.textSecondary,
                  marginBottom: 24,
                  textAlign: 'center',
                  fontSize: 16,
                  lineHeight: 24,
                }}>
                  {t.diary.searchSuggestion}
                </Text>
                <Pressable
                  onPress={handleResetSearch}
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                    backgroundColor: themeColors.primary,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                  }}
                >
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: themeColors.primaryText,
                  }}>{t.diary.showAll}</Text>
                </Pressable>
              </View>
            ) : (
              // 일기 없음
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  marginBottom: 24,
                  borderRadius: 48,
                  backgroundColor: themeColors.surface,
                  padding: 24,
                  shadowColor: themeColors.shadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 8,
                  elevation: 8,
                }}>
                  <PenTool size={48} color={themeColors.primary} />
                </View>
                <Text style={{
                  marginBottom: 12,
                  textAlign: 'center',
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: themeColors.primary,
                }}>
                  {t.diary.writeFirst}
                </Text>
                <Text style={{
                  color: themeColors.text,
                  marginBottom: 24,
                  textAlign: 'center',
                  fontSize: 16,
                  lineHeight: 24,
                }}>
                  {t.diary.howWasToday}
                </Text>
                <Pressable
                  onPress={() => router.push('/diary/create')}
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                    backgroundColor: themeColors.primary,
                    paddingHorizontal: 32,
                    paddingVertical: 16,
                    shadowColor: themeColors.shadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0.3 : 0.1,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <PenTool size={20} color={themeColors.primaryText} />
                    <Text style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: themeColors.primaryText,
                    }}>{t.diary.startWriting}</Text>
                  </View>
                </Pressable>

                {/* 추가 안내 */}
                <View style={{ marginTop: 16, width: '100%' }}>
                  <Text style={{
                    marginBottom: 16,
                    textAlign: 'center',
                    fontSize: 14,
                    fontWeight: '600',
                    color: themeColors.primary,
                  }}>
                    {t.diary.writingTips}
                  </Text>
                  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', maxWidth: 320, gap: 12 }}>
                      <View
                        style={{
                          flex: 1,
                          alignItems: 'center',
                          borderRadius: 12,
                          backgroundColor: isDark ? `${themeColors.surface}E0` : 'rgba(255,255,255,0.9)',
                          paddingHorizontal: 16,
                          paddingVertical: 20,
                          shadowColor: themeColors.shadow,
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: isDark ? 0.2 : 0.1,
                          shadowRadius: 2,
                          elevation: 2,
                          minHeight: 130,
                          minWidth: 120,
                        }}
                      >
                        <View style={{
                          marginBottom: 12,
                          height: 64,
                          width: 64,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 32,
                          backgroundColor: isDark ? `${themeColors.primary}20` : '#f3f4f6',
                        }}>
                          <Calendar size={22} color={themeColors.primary} />
                        </View>
                        <Text
                          style={{
                            textAlign: 'center',
                            fontWeight: '600',
                            color: themeColors.primary,
                            fontSize: 16,
                          }}
                        >
                          {t.diary.consistentRecord}
                        </Text>
                        <Text
                          style={{
                            color: themeColors.text,
                            marginTop: 8,
                            textAlign: 'center',
                            lineHeight: 16,
                            fontSize: 12,
                          }}
                        >
                          {t.diary.writeDaily}
                        </Text>
                      </View>
                      <View
                        style={{
                          flex: 1,
                          alignItems: 'center',
                          borderRadius: 12,
                          backgroundColor: isDark ? `${themeColors.surface}E0` : 'rgba(255,255,255,0.9)',
                          paddingHorizontal: 16,
                          paddingVertical: 20,
                          shadowColor: themeColors.shadow,
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: isDark ? 0.2 : 0.1,
                          shadowRadius: 2,
                          elevation: 2,
                          minHeight: 130,
                          minWidth: 120,
                        }}
                      >
                        <View style={{
                          marginBottom: 12,
                          height: 64,
                          width: 64,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 32,
                          backgroundColor: '#fef3c7',
                        }}>
                          <Star size={22} color="#FFD700" fill="#FFD700" />
                        </View>
                        <Text
                          style={{
                            textAlign: 'center',
                            fontWeight: '600',
                            color: themeColors.primary,
                            fontSize: 16,
                          }}
                        >
                          {t.diary.vividMemories}
                        </Text>
                        <Text
                          style={{
                            color: themeColors.text,
                            marginTop: 8,
                            textAlign: 'center',
                            lineHeight: 16,
                            fontSize: 12,
                          }}
                        >
                          {t.diary.recordWithMedia}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        ) : (
          // 기존 일기 목록
          Object.keys(grouped).map((section, index) => (
            <View key={section} style={{ marginBottom: 24 }}>
              <View style={{
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: 8,
                  marginBottom: 4,
                }}>
                  <Feather name="calendar" size={18} color={themeColors.primary} />
                  <Text style={{
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: themeColors.primary,
                    marginLeft: 8,
                  }}>{section}</Text>
                </View>
                {/* 첫 번째 섹션에만 정렬 버튼 표시 */}
                {index === 0 && (
                  <Pressable
                    onPress={handleSortToggle}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{
                      fontSize: 14,
                      fontWeight: 'bold',
                      color: themeColors.primary,
                    }}>
                      {sortOrder === 'desc' ? t.common.newest : t.common.oldest}
                    </Text>
                    {sortOrder === 'desc' ? (
                      <ArrowDownWideNarrow color={themeColors.primary} size={18} />
                    ) : (
                      <ArrowUpWideNarrow color={themeColors.primary} size={18} />
                    )}
                  </Pressable>
                )}
              </View>
              {grouped[section].map((item: any) => (
                <DiaryListItem
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/diary/${item.id}`)}
                  formatDateTime={(datetime: string) => formatDateTimeString(datetime, t.locale.startsWith('en') ? 'en' : 'ko')}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* + 버튼 */}
      <Pressable
        onPress={() => router.push('/diary/create')}
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
      >
        <Text style={{
          fontSize: 28,
          fontWeight: '300',
          color: themeColors.primaryText,
        }}>+</Text>
      </Pressable>

      {/* 검색 모달 */}
      <SearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={handleSearch}
      />

      {/* 날짜 선택기 */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          locale={t.locale.startsWith('en') ? 'en_US' : 'ko_KR'}
          onChange={(event, date) => {
            setShowDatePicker(false);
            // 사용자가 취소한 경우에는 아무것도 하지 않음
            if (event.type === 'set' && date) {
              setSelectedDate(date);
            }
          }}
        />
      )}
    </View>
  );
};

export default DiaryListPage;
