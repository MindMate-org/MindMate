import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, MoreVertical, Edit3, Trash2, Clock, MapPin } from 'lucide-react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Pressable } from 'react-native';

import { CustomAlertManager } from '../../../components/ui/custom-alert';
import ErrorState from '../../../components/ui/error-state';
import FadeInView from '../../../components/ui/fade-in-view';
import LoadingState from '../../../components/ui/loading-state';
import { useThemeColors } from '../../../components/providers/theme-provider';
import { Colors } from '../../../constants/colors';
import { formatDateTimeString } from '../../../lib/date-utils';
import { MediaSlider } from '../../diary/components/media-slider';
import type { MediaTableType } from '../../diary/db/diary-db-types';
import {
  fetchGetScheduleById,
  fetchDeleteSchedule,
  fetchGetMediaByScheduleId,
} from '../services/schedule-services';
import type { ScheduleType } from '../types/schedule-types';

export interface ScheduleDetailPageProps {
  // Currently no props needed
}

/**
 * 일정 상세 보기 페이지
 * @description 특정 일정의 상세 내용을 표시하고 편집/삭제 기능을 제공합니다.
 */
const ScheduleDetailPage: React.FC<ScheduleDetailPageProps> = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme: themeColors, isDark } = useThemeColors();
  const [schedule, setSchedule] = useState<ScheduleType | null>(null);
  const [media, setMedia] = useState<MediaTableType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      const numericId = parseInt(id, 10);
      if (!isNaN(numericId)) {
        fetchScheduleDetail(numericId);
      } else {
        setError('잘못된 일정 ID입니다.');
        setIsLoading(false);
      }
    }
  }, [id]);

  /**
   * 일정 상세 정보를 가져옵니다
   * @param scheduleId 일정 ID
   */
  const fetchScheduleDetail = async (scheduleId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const [scheduleData, mediaData] = await Promise.all([
        fetchGetScheduleById(scheduleId),
        fetchGetMediaByScheduleId(scheduleId),
      ]);
      setSchedule(scheduleData);
      setMedia(mediaData);
    } catch (error) {
      console.error('일정 상세 정보 조회 실패:', error);
      setError('일정 정보를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 일정을 삭제합니다
   */
  const handleDelete = () => {
    if (!schedule) return;

    CustomAlertManager.confirm('일정 삭제', '정말로 이 일정을 삭제하시겠습니까?', async () => {
      try {
        const success = await fetchDeleteSchedule(schedule.id);
        if (success) {
          await CustomAlertManager.success('일정이 삭제되었습니다.');
          router.back();
        } else {
          CustomAlertManager.error('일정 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('일정 삭제 실패:', error);
        CustomAlertManager.error('일정 삭제에 실패했습니다.');
      }
    });
  };

  /**
   * 일정 편집 페이지로 이동합니다
   */
  const handleEdit = () => {
    if (!schedule) return;
    router.push(`/schedule/edit/${schedule.id}`);
  };

  const handleBack = useCallback(() => router.back(), [router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = days[date.getDay()];

    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} (${dayName})`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? themeColors.background : '#F0F3FF' }}>
        <LoadingState message="일정을 불러오는 중..." />
      </SafeAreaView>
    );
  }

  if (error || !schedule) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? themeColors.background : '#F0F3FF' }}>
        <ErrorState
          message={error || '일정을 찾을 수 없습니다.'}
          onRetry={() => fetchScheduleDetail(parseInt(id as string, 10))}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? themeColors.background : '#F0F3FF' }}>
      {/* 헤더 */}
      <FadeInView>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: themeColors.surface,
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: themeColors.border,
        }}>
          <TouchableOpacity onPress={handleBack} style={{ borderRadius: 20, padding: 8 }}>
            <ChevronLeft size={24} color={themeColors.primary} />
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: themeColors.text,
          }}>일정 상세</Text>
          <TouchableOpacity
            onPress={() => setShowMenu(!showMenu)}
            style={{
              borderRadius: 20,
              padding: 8,
              backgroundColor: showMenu ? themeColors.primary + '20' : 'transparent',
            }}
          >
            <MoreVertical size={24} color={themeColors.primary} />
          </TouchableOpacity>
        </View>
      </FadeInView>

      {/* 메뉴 */}
      {showMenu && (
        <FadeInView style={{
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
          shadowRadius: 8,
          elevation: 8,
        }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
            }}
            onPress={() => {
              setShowMenu(false);
              handleEdit();
            }}
          >
            <Edit3 size={18} color={themeColors.primary} />
            <Text style={{
              marginLeft: 12,
              fontSize: 14,
              fontWeight: '500',
              color: themeColors.text,
            }}>편집</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
            }}
            onPress={() => {
              setShowMenu(false);
              handleDelete();
            }}
          >
            <Trash2 size={18} color={themeColors.error} />
            <Text style={{
              marginLeft: 12,
              fontSize: 14,
              fontWeight: '500',
              color: themeColors.error,
            }}>삭제</Text>
          </TouchableOpacity>
        </FadeInView>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 날짜 헤더 */}
        <FadeInView delay={100} style={{ marginHorizontal: 16, marginTop: 16 }}>
          <View style={{
            backgroundColor: themeColors.surface,
            borderRadius: 12,
            padding: 16,
            shadowColor: themeColors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 4,
            elevation: 3,
            marginBottom: 16,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: themeColors.textSecondary, fontSize: 14 }}>
                  {formatDateTimeString(schedule.time)}
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 8,
                  backgroundColor: schedule.is_completed === 1 ? themeColors.success + '20' : themeColors.warning + '20',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  alignSelf: 'flex-start',
                }}>
                  <Text style={{
                    color: schedule.is_completed === 1 ? themeColors.success : themeColors.warning,
                    fontSize: 12,
                    fontWeight: '600',
                  }}>
                    {schedule.is_completed === 1 ? '✓ 완료됨' : '⏳ 대기 중'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </FadeInView>

        {/* 메인 콘텐츠 카드 */}
        <FadeInView delay={200} style={{ marginHorizontal: 16 }}>
          <View style={{
            borderRadius: 12,
            padding: 24,
            backgroundColor: themeColors.surface,
            shadowColor: themeColors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.15,
            shadowRadius: 12,
            elevation: 8,
          }}>
            {/* 제목 */}
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: themeColors.text,
              marginBottom: 24,
              lineHeight: 32,
            }}>
              {schedule.title}
            </Text>

            {/* 내용 */}
            <Text style={{
              fontSize: 16,
              color: themeColors.textSecondary,
              lineHeight: 24,
              marginBottom: 24,
            }}>
              {schedule.contents || '내용이 없습니다.'}
            </Text>

            {/* 위치 및 동행 정보 */}
            {(schedule.location || schedule.companion) && (
              <View style={{
                marginBottom: 24,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: themeColors.border,
              }}>
                {schedule.location && (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}>
                    <MapPin size={18} color={themeColors.primary} />
                    <Text style={{
                      marginLeft: 12,
                      fontSize: 14,
                      color: themeColors.text,
                      fontWeight: '500',
                    }}>
                      {schedule.location}
                    </Text>
                  </View>
                )}
                {schedule.companion && (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <Text style={{ fontSize: 18 }}>👥</Text>
                    <Text style={{
                      marginLeft: 12,
                      fontSize: 14,
                      color: themeColors.text,
                      fontWeight: '500',
                    }}>
                      {schedule.companion}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* 미디어 */}
            {media.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <View style={{ marginBottom: 12 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: themeColors.textSecondary,
                  }}>첨부된 미디어</Text>
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
          </View>
        </FadeInView>
      </ScrollView>
      
      {/* 메뉴 닫기용 오버레이 */}
      {showMenu && (
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={() => setShowMenu(false)}
        />
      )}
    </SafeAreaView>
  );
};

export default ScheduleDetailPage;
