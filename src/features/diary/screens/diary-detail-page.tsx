import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, MoreVertical, Trash2, Edit3, Share2, Star } from 'lucide-react-native';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Pressable } from 'react-native';

import { useThemeColors } from '../../../components/providers/theme-provider';
import { CustomAlertManager } from '../../../components/ui/custom-alert';
import ErrorState from '../../../components/ui/error-state';
import FadeInView from '../../../components/ui/fade-in-view';
import LoadingState from '../../../components/ui/loading-state';
import { useI18n } from '../../../hooks/use-i18n';
import { formatDateTimeString } from '../../../lib/date-utils';
import ExportModal from '../components/export-modal';
import { MediaSlider } from '../components/media-slider';
import { DiaryService } from '../services';
import { getMoodOptions } from '../types';

type DiaryDetailType = Awaited<ReturnType<typeof DiaryService.getDiaryById>>;
type DiaryMediaType = Awaited<ReturnType<typeof DiaryService.getMediaByDiaryId>>;

export interface DiaryDetailPageProps {}

/**
 * 일기 상세 보기 페이지
 * @description 특정 일기의 상세 내용을 표시하고 편집/삭제/공유 기능을 제공합니다.
 */
const DiaryDetailPage: React.FC<DiaryDetailPageProps> = () => {
  const router = useRouter();
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
  const { id } = useLocalSearchParams();
  const [diary, setDiary] = useState<DiaryDetailType | null>(null);
  const [media, setMedia] = useState<DiaryMediaType>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // useMemo must be called at top level to avoid hooks order violation
  const mood = useMemo(() => {
    if (!diary) return null;
    return getMoodOptions(t.locale).find((m) => m.value === diary.mood);
  }, [diary, t.locale]);

  useEffect(() => {
    if (id && typeof id === 'string') {
      const numericId = parseInt(id, 10);
      if (!isNaN(numericId)) {
        fetchDiaryDetail(numericId);
      } else {
        setError(t.diary.invalidId);
        setIsLoading(false);
      }
    }
  }, [id]);

  /**
   * 일기 상세 정보를 가져옵니다
   * @param diaryId 일기 ID
   */
  const fetchDiaryDetail = async (diaryId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const [diaryData, mediaData] = await Promise.all([
        DiaryService.getDiaryById(diaryId),
        DiaryService.getMediaByDiaryId(diaryId),
      ]);
      setDiary(diaryData);
      setMedia(mediaData);
    } catch (error) {
      setError(t.diary.loadFailed);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 일기를 즐겨찾기에 추가/제거합니다
   */
  const handleToggleFavorite = useCallback(async () => {
    if (!diary) return;

    try {
      await DiaryService.toggleFavorite(diary.id);
      setDiary({ ...diary, is_favorite: diary.is_favorite === 1 ? 0 : 1 });
    } catch (error) {
      CustomAlertManager.error('즐겨찾기 상태 변경에 실패했습니다.');
    }
  }, [diary]);

  /**
   * 일기를 삭제합니다
   */
  const handleDelete = () => {
    if (!diary) return;

    CustomAlertManager.confirm('일기 삭제', '정말로 이 일기를 삭제하시겠습니까?', async () => {
      try {
        await DiaryService.deleteDiary(diary.id);
        await CustomAlertManager.success('일기가 삭제되었습니다.');
        router.back();
      } catch (error) {
        CustomAlertManager.error('일기 삭제에 실패했습니다.');
      }
    });
  };

  /**
   * 일기 편집 페이지로 이동합니다
   */
  const handleEdit = () => {
    if (!diary) return;
    router.push(`/diary/edit/${diary.id}`);
  };

  const handleBack = useCallback(() => router.back(), [router]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <LoadingState message="일기를 불러오는 중..." />
      </SafeAreaView>
    );
  }

  if (error || !diary) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ErrorState
          message={error || '일기를 찾을 수 없습니다.'}
          onRetry={() => fetchDiaryDetail(parseInt(id as string, 10))}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      {/* 헤더 */}
      <FadeInView>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: themeColors.surface,
            paddingHorizontal: 16,
            paddingVertical: 16,
            marginTop: 32,
          }}
        >
          <TouchableOpacity
            onPress={handleBack}
            style={{
              borderRadius: 20,
              padding: 8,
            }}
          >
            <ChevronLeft size={24} color={themeColors.primary} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: themeColors.primary,
            }}
          >
            {t.diary.detail}
          </Text>
          <TouchableOpacity
            onPress={() => setShowMenu(!showMenu)}
            style={{
              borderRadius: 20,
              padding: 8,
              backgroundColor: showMenu ? `${themeColors.primary}20` : 'transparent',
            }}
          >
            <MoreVertical size={24} color={themeColors.primary} />
          </TouchableOpacity>
        </View>
      </FadeInView>

      {/* 메뉴 */}
      {showMenu && (
        <FadeInView
          style={{
            position: 'absolute',
            right: 16,
            top: 80,
            zIndex: 10,
            width: 160,
            borderRadius: 12,
            backgroundColor: themeColors.surface,
            padding: 8,
            shadowColor: themeColors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 12,
            elevation: 12,
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
            }}
            onPress={handleEdit}
          >
            <Edit3 size={18} color={themeColors.primary} />
            <Text
              style={{
                marginLeft: 12,
                fontSize: 14,
                fontWeight: '500',
                color: themeColors.text,
              }}
            >
              {t.diary.edit}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
            }}
            onPress={handleToggleFavorite}
          >
            <Star
              size={18}
              color={diary.is_favorite ? '#fbbf24' : themeColors.primary}
              fill={diary.is_favorite ? '#fbbf24' : 'none'}
            />
            <Text
              style={{
                marginLeft: 12,
                fontSize: 14,
                fontWeight: '500',
                color: themeColors.text,
              }}
            >
              {diary.is_favorite ? t.diary.removeFavorite : t.diary.favorite}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
            }}
            onPress={() => setShowExportModal(true)}
          >
            <Share2 size={18} color={themeColors.primary} />
            <Text
              style={{
                marginLeft: 12,
                fontSize: 14,
                fontWeight: '500',
                color: themeColors.text,
              }}
            >
              {t.diary.export}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
            }}
            onPress={handleDelete}
          >
            <Trash2 size={18} color={themeColors.error} />
            <Text
              style={{
                marginLeft: 12,
                fontSize: 14,
                fontWeight: '500',
                color: themeColors.error,
              }}
            >
              {t.diary.trash}
            </Text>
          </TouchableOpacity>
        </FadeInView>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 날짜 헤더 */}
        <FadeInView delay={100} style={{ marginHorizontal: 16, marginTop: 16 }}>
          <View
            style={{
              backgroundColor: themeColors.surface,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
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
              <View>
                <Text
                  style={{
                    color: themeColors.textSecondary,
                    fontSize: 14,
                  }}
                >
                  {formatDateTimeString(
                    diary.created_at || '',
                    t.locale.startsWith('en') ? 'en' : 'ko',
                  )}
                </Text>
                {diary.is_favorite === 1 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Text
                      style={{
                        color: '#fbbf24',
                        fontSize: 14,
                      }}
                    >
                      ⭐ {t.diary.favorite}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </FadeInView>

        {/* 메인 콘텐츠 카드 */}
        <FadeInView delay={200} style={{ marginHorizontal: 16 }}>
          <View
            style={{
              borderRadius: 12,
              padding: 24,
              backgroundColor: diary.background_color || themeColors.surface,
              shadowColor: themeColors.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.3 : 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {/* 제목 */}
            <Text
              style={{
                marginBottom: 24,
                color: diary.text_color || themeColors.text,
                fontFamily: diary.font === 'default' ? undefined : diary.font || undefined,
                textAlign: diary.text_align as 'left' | 'center' | 'right',
                fontSize: Math.max((diary.font_size || 16) + 8, 24),
                fontWeight: 'bold',
                lineHeight: Math.max((diary.font_size || 16) + 8, 24) * 1.3,
              }}
            >
              {diary.title}
            </Text>

            {/* 내용 */}
            <Text
              style={{
                marginBottom: 24,
                color: diary.text_color || themeColors.text,
                fontSize: diary.font_size || 16,
                fontFamily: diary.font === 'default' ? undefined : diary.font || undefined,
                textAlign: diary.text_align as 'left' | 'center' | 'right',
                lineHeight: (diary.font_size || 16) * 1.6,
              }}
            >
              {diary.body}
            </Text>

            {/* 미디어 */}
            {media.length > 0 && (
              <View className="mt-4">
                <View className="mb-3">
                  <Text className="text-gray-600 text-sm font-medium">첨부된 미디어</Text>
                </View>
                <MediaSlider
                  media={media.map((m) => ({
                    id: m.id,
                    mediaType: m.media_type,
                    filePath: m.file_path,
                  }))}
                  height={320}
                />
              </View>
            )}

            {/* 기분 */}
            {mood && (
              <View
                style={{
                  marginTop: 24,
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: themeColors.border,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: themeColors.backgroundSecondary,
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                  }}
                >
                  <Text style={{ marginRight: 8, fontSize: 20 }}>{mood.emoji}</Text>
                  <Text
                    style={{
                      color: themeColors.text,
                      fontSize: 14,
                      fontWeight: '500',
                    }}
                  >
                    {t.diary.todayMood}: {mood.label}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </FadeInView>

        {/* 추가 정보 카드 */}
        {diary.audio_uri && (
          <FadeInView delay={300} style={{ marginHorizontal: 16, marginTop: 16 }}>
            <View
              style={{
                backgroundColor: themeColors.info + '20',
                borderRadius: 12,
                padding: 16,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{
                    color: themeColors.info,
                    fontSize: 14,
                    fontWeight: '500',
                  }}
                >
                  🎵 {t.diary.voiceMemo}
                </Text>
              </View>
            </View>
          </FadeInView>
        )}
      </ScrollView>

      <ExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        diary={diary}
        media={media.map((m) => ({
          filePath: m.file_path,
          mediaType: m.media_type,
        }))}
      />

      {/* 메뉴 닫기용 오버레이 */}
      {showMenu && (
        <Pressable
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          onPress={() => setShowMenu(false)}
        />
      )}
    </SafeAreaView>
  );
};

export default DiaryDetailPage;
