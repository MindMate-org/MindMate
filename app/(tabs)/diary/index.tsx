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
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';

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
  const [diaries, setDiaries] = useState<any[]>([]);
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
  const grouped = useMemo(() => groupDiariesByPeriod(sortedDiaries), [sortedDiaries]);

  return (
    <View className="flex-1 bg-turquoise">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingTop: 12,
          paddingBottom: 80,
        }}
        contentContainerClassName="sm:px-4 sm:pt-4 sm:pb-24 lg:px-6 lg:pt-6"
      >
        {/* 기능 버튼들 */}
        <View className="mb-4">
          <View className="flex-row gap-1 sm:gap-2">
            <Pressable
              onPress={() => router.push('/diary/trash')}
              className="min-h-[40px] flex-1 flex-row items-center justify-center gap-1 rounded-lg bg-white px-1 py-2 shadow-sm sm:min-h-[44px] sm:px-2 sm:py-2.5"
            >
              <Trash2 color={'#576bcd'} size={14} className="sm:h-4 sm:w-4" />
              <Text className="text-xs font-medium text-paleCobalt sm:text-sm">휴지통</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/diary/stats')}
              className="min-h-[40px] flex-1 flex-row items-center justify-center gap-1 rounded-lg bg-white px-1 py-2 shadow-sm sm:min-h-[44px] sm:px-2 sm:py-2.5"
            >
              <BarChart3 color={'#576bcd'} size={14} className="sm:h-4 sm:w-4" />
              <Text className="text-xs font-medium text-paleCobalt sm:text-sm">통계</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/diary/favorites')}
              className="min-h-[40px] flex-1 flex-row items-center justify-center gap-1 rounded-lg bg-white px-1 py-2 shadow-sm sm:min-h-[44px] sm:px-2 sm:py-2.5"
            >
              <Star color={'#FFD700'} size={14} fill={'#FFD700'} className="sm:h-4 sm:w-4" />
              <Text className="text-xs font-medium text-paleCobalt sm:text-sm">북마크</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowSearchModal(true)}
              className="min-h-[40px] flex-1 flex-row items-center justify-center gap-1 rounded-lg bg-white px-1 py-2 shadow-sm sm:min-h-[44px] sm:px-2 sm:py-2.5"
            >
              <Search color={'#576bcd'} size={14} className="sm:h-4 sm:w-4" />
              <Text className="text-xs font-medium text-paleCobalt sm:text-sm">검색</Text>
            </Pressable>
          </View>
          {isSearchActive && (
            <View className="mt-2 px-2">
              <Pressable
                onPress={handleResetSearch}
                className="rounded-lg bg-paleYellow px-4 py-2.5"
              >
                <Text className="text-center text-sm font-medium text-paleCobalt">전체보기</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* 섹션별 목록, 로딩 상태, 또는 빈 상태 */}
        {isLoading ? (
          // 로딩 상태
          <View className="flex-1 items-center justify-center" style={{ marginTop: 100 }}>
            <ActivityIndicator size="large" color="#576bcd" />
            <Text className="mt-4 text-center text-base text-paleCobalt">
              일기를 불러오는 중...
            </Text>
          </View>
        ) : Object.keys(grouped).length === 0 ? (
          // 빈 상태 UI
          <View className="flex-1 items-center justify-center px-8" style={{ marginTop: 0 }}>
            {isSearchActive ? (
              // 검색 결과 없음
              <View className="items-center">
                <View className="mb-6 rounded-full bg-white p-6 shadow-lg">
                  <Search size={48} color="#9CA3AF" />
                </View>
                <Text className="text-gray-600 mb-3 text-center text-xl font-bold">
                  검색 결과가 없습니다
                </Text>
                <Text className="text-gray-500 mb-6 text-center text-base leading-6">
                  다른 검색어로 시도해보시거나{'\n'}
                  필터를 조정해보세요
                </Text>
                <Pressable
                  onPress={handleResetSearch}
                  className="items-center justify-center rounded-xl bg-paleCobalt px-6 py-3"
                >
                  <Text className="text-base font-semibold text-white">전체 일기 보기</Text>
                </Pressable>
              </View>
            ) : (
              // 일기 없음
              <View className="items-center">
                <View className="mb-6 rounded-full bg-white p-6 shadow-lg">
                  <PenTool size={48} color="#576bcd" />
                </View>
                <Text className="mb-3 text-center text-xl font-bold text-paleCobalt">
                  첫 번째 일기를 작성해보세요
                </Text>
                <Text className="text-gray-600 mb-6 text-center text-base leading-6">
                  오늘 하루는 어떠셨나요?{'\n'}
                  소중한 순간들을 기록해보세요
                </Text>
                <Pressable
                  onPress={() => router.push('/diary/create')}
                  className="items-center justify-center rounded-xl bg-paleCobalt px-8 py-4 shadow-md"
                >
                  <View className="flex-row items-center gap-2">
                    <PenTool size={20} color="white" />
                    <Text className="text-lg font-semibold text-white">일기 작성하기</Text>
                  </View>
                </Pressable>

                {/* 추가 안내 */}
                <View className="mt-4 w-full">
                  <Text className="mb-4 text-center text-sm font-semibold text-paleCobalt">
                    일기 작성 팁
                  </Text>
                  <View className="items-center justify-center">
                    <View className="flex-row gap-4" style={{ maxWidth: 320 }}>
                      <View
                        className="flex-1 items-center rounded-xl bg-white/90 px-4 py-5 shadow-sm"
                        style={{ minHeight: 130, minWidth: 120 }}
                      >
                        <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                          <Calendar size={22} color="#576bcd" />
                        </View>
                        <Text
                          className="text-center font-semibold text-paleCobalt"
                          style={{ fontSize: 16 }}
                        >
                          꾸준한 기록
                        </Text>
                        <Text
                          className="text-gray-600 mt-2 text-center leading-4"
                          style={{ fontSize: 12 }}
                        >
                          매일 조금씩{'\n'}작성해보세요
                        </Text>
                      </View>
                      <View
                        className="flex-1 items-center rounded-xl bg-white/90 px-4 py-5 shadow-sm"
                        style={{ minHeight: 130, minWidth: 120 }}
                      >
                        <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-yellow-50">
                          <Star size={22} color="#FFD700" fill="#FFD700" />
                        </View>
                        <Text
                          className="text-center font-semibold text-paleCobalt"
                          style={{ fontSize: 16 }}
                        >
                          생생한 추억
                        </Text>
                        <Text
                          className="text-gray-600 mt-2 text-center leading-4"
                          style={{ fontSize: 12 }}
                        >
                          사진과 영상으로{'\n'}기록하세요
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
            <View key={section} className="mb-6">
              <View className="mb-3 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2" style={{ marginBottom: 4 }}>
                  <Feather name="calendar" size={18} color="#576bcd" />
                  <Text className="text-sm font-bold text-paleCobalt">{section}</Text>
                </View>
                {/* 첫 번째 섹션에만 정렬 버튼 표시 */}
                {index === 0 && (
                  <Pressable
                    onPress={handleSortToggle}
                    className="flex-row items-center gap-1"
                    style={{ marginBottom: 4 }}
                  >
                    <Text className="text-sm font-bold text-paleCobalt">
                      {sortOrder === 'desc' ? '최신순' : '오래된순'}
                    </Text>
                    {sortOrder === 'desc' ? (
                      <ArrowDownWideNarrow color={'#576bcd'} size={18} />
                    ) : (
                      <ArrowUpWideNarrow color={'#576bcd'} size={18} />
                    )}
                  </Pressable>
                )}
              </View>
              {grouped[section].map((item: any) => (
                <DiaryListItem
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/diary/${item.id}`)}
                  formatDateTime={formatDateTimeString}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* + 버튼 */}
      <Pressable
        onPress={() => router.push('/diary/create')}
        className="absolute bottom-20 right-8 h-16 w-16 items-center justify-center rounded-full bg-paleCobalt shadow-lg sm:bottom-24 sm:right-12 sm:h-20 sm:w-20"
      >
        <Text className="text-3xl font-light text-white sm:text-5xl">+</Text>
      </Pressable>

      {/* 검색 모달 */}
      <SearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={handleSearch}
      />
    </View>
  );
};

export default DiaryListPage;
