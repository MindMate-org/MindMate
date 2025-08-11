import { useRouter } from 'expo-router';
import { ChevronLeft, Star, Heart } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { TouchableOpacity } from 'react-native';

import { Colors } from '../../src/constants/colors';
import { DiaryListItem } from '../../src/features/diary/components/diary-list-item';
import { DiaryService } from '../../src/features/diary/services';
import { groupDiariesByPeriod } from '../../src/features/diary/utils/diary-grouping';
import { formatDateTimeString } from '../../src/lib/date-utils';

/**
 * 북마크 페이지 컴포넌트
 *
 * 사용자가 북마크로 표시한 일기들을 보여주는 페이지입니다.
 * 현재 데이터베이스 스키마에 is_favorite 컬럼이 없어 비활성화 상태입니다.
 *
 * 주요 기능:
 * - 북마크 일기 목록 표시
 * - 날짜별 그룹화
 * - 빈 상태 안내 메시지
 * - 북마크 개수 표시
 *
 * @component
 * @todo 데이터베이스 스키마에 is_favorite 컬럼 추가 후 기능 활성화
 *
 * @example
 * ```tsx
 * <Stack.Screen name="favorites" component={FavoritesPage} />
 * ```
 */
const FavoritesPage = () => {
  const router = useRouter();
  const [favoriteDiaries, setFavoriteDiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavoriteDiaries();
  }, []);

  const fetchFavoriteDiaries = async () => {
    try {
      setLoading(true);
      const result = await DiaryService.getAllDiariesWithMedia();
      // 북마크만 필터링
      const favorites = result.filter((diary) => diary.is_favorite);
      setFavoriteDiaries(favorites);
    } catch (error) {
      console.error('북마크 일기 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => router.back();

  // 썸네일 URI 설정 (DiaryService에서 이미 우선순위가 적용됨: 이미지 > 동영상)
  const diariesWithThumbnail = favoriteDiaries.map((item) => ({
    ...item,
    thumbnailUri: item.media_uri, // 이미 우선순위가 적용된 미디어 URI
  }));

  // 정렬 (최신순)
  const sortedDiaries = [...diariesWithThumbnail].sort((a, b) => {
    const dateA = new Date(a.updated_at ?? a.created_at ?? '').getTime();
    const dateB = new Date(b.updated_at ?? b.created_at ?? '').getTime();
    return dateB - dateA;
  });

  // 그룹화
  const grouped = groupDiariesByPeriod(sortedDiaries);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 헤더 */}
      <View className="mt-8 flex-row items-center justify-between border-b-2 border-turquoise bg-white px-4 py-4">
        <TouchableOpacity onPress={handleBack}>
          <ChevronLeft size={24} color={Colors.paleCobalt} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-paleCobalt">북마크</Text>
        <View style={{ width: 24 }} />
      </View>

      <View className="flex-1 bg-turquoise">
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 }}
        >
          {loading ? (
            <View className="flex-1 items-center justify-center" style={{ marginTop: 100 }}>
              <ActivityIndicator size="large" color="#576bcd" />
              <Text className="mt-4 text-center text-base text-paleCobalt">
                북마크를 불러오는 중...
              </Text>
            </View>
          ) : favoriteDiaries.length === 0 ? (
            <View className="flex-1 items-center justify-center" style={{ marginTop: 100 }}>
              <Star size={64} color={Colors.gray} />
              <Text className="mt-4 text-lg text-gray">북마크가 비어있습니다</Text>
              <Text className="mt-2 text-sm text-gray">
                중요한 일기에 ⭐ 버튼을 눌러 북마크에 추가하세요
              </Text>
            </View>
          ) : (
            <>
              {/* 북마크 개수 */}
              <View className="mb-4 flex-row items-center gap-2">
                <Heart size={20} color={Colors.paleCobalt} />
                <Text className="text-sm font-bold text-paleCobalt">
                  총 {favoriteDiaries.length}개의 소중한 일기
                </Text>
              </View>

              {/* 섹션별 목록 */}
              {Object.keys(grouped).map((section) => (
                <View key={section} className="mb-6">
                  <View className="mb-3 flex-row items-center gap-2">
                    <Star size={18} color="#FFD700" fill="#FFD700" />
                    <Text className="text-sm font-bold text-paleCobalt">{section}</Text>
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
              ))}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default FavoritesPage;
