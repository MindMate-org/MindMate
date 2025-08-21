import { useRouter } from 'expo-router';
import { ChevronLeft, RotateCcw, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

import { Colors } from '../../src/constants/colors';
import { useThemeColors } from '../../src/components/providers/theme-provider';
import { useI18n } from '../../src/hooks/use-i18n';
import { CustomAlertManager } from '../../src/components/ui/custom-alert';
import { DiaryListItem } from '../../src/features/diary/components/diary-list-item';
import { DiaryService } from '../../src/features/diary/services';
import { formatDateTimeString } from '../../src/lib/date-utils';

type DeletedDiary = {
  id: number;
  title: string | null;
  body: string | null;
  deleted_at: string | null;
  created_at: string | null;
  media_uri?: string | null;
  media_type?: string | null;
  mood?: string | null;
};

/**
 * 휴지통 페이지 컴포넌트
 */
const TrashPage = () => {
  const router = useRouter();
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
  const [deletedDiaries, setDeletedDiaries] = useState<DeletedDiary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeletedDiaries();
  }, []);

  const fetchDeletedDiaries = async () => {
    try {
      setLoading(true);
      const result = await DiaryService.getDeletedDiariesWithMedia();
      setDeletedDiaries(result);
    } catch (error) {
      console.error('휴지통 일기 조회 실패:', error);
      CustomAlertManager.error(
        t.locale.startsWith('en')
          ? 'Failed to load trash diary.'
          : '휴지통 일기를 불러오는데 실패했습니다.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: number, title: string | null) => {
    const confirmed = await CustomAlertManager.confirm(
      t.locale.startsWith('en') ? 'Restore Diary' : '일기 복원',
      t.locale.startsWith('en')
        ? `Do you want to restore the diary "${title || 'Untitled'}"?`
        : `"${title || '제목 없음'}" 일기를 복원하시겠습니까?`,
    );

    if (confirmed) {
      try {
        await DiaryService.restoreDiary(id);
        CustomAlertManager.success(
          t.locale.startsWith('en') ? 'Diary has been restored.' : '일기가 복원되었습니다.',
        );
        fetchDeletedDiaries();
      } catch (error) {
        console.error('일기 복원 실패:', error);
        CustomAlertManager.error(
          t.locale.startsWith('en') ? 'Failed to restore diary.' : '일기 복원에 실패했습니다.',
        );
      }
    }
  };

  const handlePermanentDelete = async (id: number, title: string | null) => {
    const confirmed = await CustomAlertManager.confirm(
      t.locale.startsWith('en') ? 'Permanent Delete' : '영구 삭제',
      t.locale.startsWith('en')
        ? `Do you want to permanently delete the diary "${title || 'Untitled'}"?\n\nThis action cannot be undone.`
        : `"${title || '제목 없음'}" 일기를 영구적으로 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`,
    );

    if (confirmed) {
      try {
        await DiaryService.permanentDeleteDiary(id);
        CustomAlertManager.success(
          t.locale.startsWith('en')
            ? 'Diary has been permanently deleted.'
            : '일기가 영구적으로 삭제되었습니다.',
        );
        fetchDeletedDiaries();
      } catch (error) {
        console.error('일기 영구 삭제 실패:', error);
        CustomAlertManager.error(
          t.locale.startsWith('en') ? 'Failed to delete diary.' : '일기 삭제에 실패했습니다.',
        );
      }
    }
  };

  const handleBack = () => router.back();

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
          {t.diary.trash}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={{
          flex: 1,
          backgroundColor: themeColors.background,
          paddingHorizontal: 16,
          paddingTop: 16,
        }}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {loading ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 100,
            }}
          >
            <ActivityIndicator size="large" color={themeColors.primary} />
            <Text
              style={{
                marginTop: 16,
                textAlign: 'center',
                fontSize: 16,
                color: themeColors.primary,
              }}
            >
              {t.locale.startsWith('en') ? 'Loading trash...' : '휴지통을 불러오는 중...'}
            </Text>
          </View>
        ) : deletedDiaries.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Trash2 size={64} color={themeColors.textSecondary} />
            <Text
              style={{
                marginTop: 16,
                fontSize: 18,
                color: themeColors.textSecondary,
              }}
            >
              {t.locale.startsWith('en') ? 'Trash is empty' : '휴지통이 비어있습니다'}
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontSize: 14,
                color: themeColors.textSecondary,
              }}
            >
              {t.locale.startsWith('en') ? 'No deleted diaries' : '삭제된 일기가 없습니다'}
            </Text>
          </View>
        ) : (
          <View style={{ paddingBottom: 16 }}>
            <Text
              style={{
                marginBottom: 16,
                fontSize: 14,
                color: themeColors.textSecondary,
              }}
            >
              {t.diary.autoDeleteNotice}
            </Text>
            {deletedDiaries.map((diary) => {
              // 썸네일 URI 설정
              const diaryWithThumbnail = {
                ...diary,
                thumbnailUri: diary.media_uri,
              };

              return (
                <View key={diary.id} style={{ marginBottom: 16 }}>
                  <DiaryListItem
                    item={diaryWithThumbnail}
                    onPress={() => {}} // 휴지통에서는 상세보기 비활성화
                    formatDateTime={(datetime: string) =>
                      formatDateTimeString(datetime, t.locale.startsWith('en') ? 'en' : 'ko')
                    }
                  />

                  {/* 휴지통 전용 버튼들 */}
                  <View
                    style={{
                      marginTop: -8,
                      marginBottom: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: themeColors.textSecondary,
                        flex: 1,
                        marginRight: 8,
                      }}
                      numberOfLines={1}
                    >
                      {diary.deleted_at
                        ? formatDateTimeString(
                            diary.deleted_at,
                            t.locale.startsWith('en') ? 'en' : 'ko',
                          )
                        : ''}
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 8,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => handleRestore(diary.id, diary.title)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          borderRadius: 16,
                          backgroundColor: '#dcfce7',
                          paddingHorizontal: 12,
                          paddingVertical: 4,
                        }}
                      >
                        <RotateCcw size={14} color="#059669" />
                        <Text
                          style={{
                            marginLeft: 4,
                            fontSize: 12,
                            fontWeight: '500',
                            color: '#059669',
                          }}
                        >
                          {t.diary.restore}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handlePermanentDelete(diary.id, diary.title)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          borderRadius: 16,
                          backgroundColor: '#fecaca',
                          paddingHorizontal: 12,
                          paddingVertical: 4,
                        }}
                      >
                        <Trash2 size={14} color="#DC2626" />
                        <Text
                          style={{
                            marginLeft: 4,
                            fontSize: 12,
                            fontWeight: '500',
                            color: '#DC2626',
                          }}
                        >
                          {t.diary.permanentDelete}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TrashPage;
