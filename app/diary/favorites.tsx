import { useRouter } from 'expo-router';
import { ChevronLeft, Star, Heart } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { TouchableOpacity } from 'react-native';

import { Colors } from '../../src/constants/colors';
import { useThemeColors } from '../../src/components/providers/theme-provider';
import { useI18n } from '../../src/hooks/use-i18n';
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
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
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
  const grouped = groupDiariesByPeriod(sortedDiaries, t.locale.startsWith('en') ? 'en' : 'ko');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      {/* 헤더 */}
      <View style={{
        marginTop: 32, // 상태바 아래 여백
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: themeColors.primary,
        backgroundColor: themeColors.surface,
        paddingHorizontal: 16,
        paddingVertical: 16,
      }}>
        <TouchableOpacity onPress={handleBack}>
          <ChevronLeft size={24} color={themeColors.primary} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: themeColors.primary,
        }}>{t.diary.bookmarks}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={{ flex: 1, backgroundColor: themeColors.background }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 }}
        >
          {loading ? (
            <View style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 100,
            }}>
              <ActivityIndicator size="large" color={themeColors.primary} />
              <Text style={{
                marginTop: 16,
                textAlign: 'center',
                fontSize: 16,
                color: themeColors.primary,
              }}>
                {t.diary.loadingBookmarks}
              </Text>
            </View>
          ) : favoriteDiaries.length === 0 ? (
            <View style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 100,
            }}>
              <Star size={64} color={themeColors.textSecondary} />
              <Text style={{
                marginTop: 16,
                fontSize: 18,
                color: themeColors.textSecondary,
              }}>{t.diary.bookmarkEmpty}</Text>
              <Text style={{
                marginTop: 8,
                fontSize: 14,
                color: themeColors.textSecondary,
              }}>
                {t.diary.addBookmarkHint}
              </Text>
            </View>
          ) : (
            <>
              {/* 북마크 개수 */}
              <View style={{
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}>
                <Heart size={20} color={themeColors.primary} />
                <Text style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: themeColors.primary,
                }}>
                  {t.locale.startsWith('en') ? `${favoriteDiaries.length} ${t.diary.preciousDiariesCount}` : `총 ${favoriteDiaries.length}${t.diary.preciousDiariesCount}`}
                </Text>
              </View>

              {/* 섹션별 목록 */}
              {Object.keys(grouped).map((section) => (
                <View key={section} style={{ marginBottom: 24 }}>
                  <View style={{
                    marginBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <Star size={18} color="#FFD700" fill="#FFD700" />
                    <Text style={{
                      fontSize: 14,
                      fontWeight: 'bold',
                      color: themeColors.primary,
                    }}>{section}</Text>
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
              ))}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default FavoritesPage;
