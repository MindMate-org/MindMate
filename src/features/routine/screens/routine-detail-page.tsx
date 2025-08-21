import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, MoreVertical, Edit3, Trash2, Clock, MapPin, CheckCircle2, Circle } from 'lucide-react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Pressable, Image } from 'react-native';

import { CustomAlertManager } from '../../../components/ui/custom-alert';
import ErrorState from '../../../components/ui/error-state';
import FadeInView from '../../../components/ui/fade-in-view';
import LoadingState from '../../../components/ui/loading-state';
import { useThemeColors } from '../../../components/providers/theme-provider';
import { useI18n } from '../../../hooks/use-i18n';
import { formatDateTimeString } from '../../../lib/date-utils';
import { useRoutineDetailQuery } from '../hooks/use-routine-query';
import { useDeleteRoutine, useUpdateSubTaskCompletion } from '../hooks/use-routine-mutation';
import { getLocalizedRepeatCycle } from '../utils';

export interface RoutineDetailPageProps {
  // Currently no props needed
}

/**
 * 루틴 상세 보기 페이지
 * @description 특정 루틴의 상세 내용을 표시하고 편집/삭제 기능을 제공합니다.
 */
const RoutineDetailPage: React.FC<RoutineDetailPageProps> = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t } = useI18n();
  const { theme: themeColors, isDark } = useThemeColors();
  const [showMenu, setShowMenu] = useState(false);

  // 루틴 조회 및 삭제 훅
  const { routine, isLoading, error, refetch } = useRoutineDetailQuery(id as string);
  const { deleteRoutine, isLoading: isDeleting } = useDeleteRoutine();
  const { updateCompletion, isLoading: isUpdatingSubTask } = useUpdateSubTaskCompletion();

  /**
   * 루틴을 삭제합니다
   */
  const handleDelete = () => {
    if (!routine) return;

    CustomAlertManager.confirm(t.common.delete, t.routine.deleteConfirm, async () => {
      try {
        const success = await deleteRoutine(routine.id);
        if (success) {
          await CustomAlertManager.success(t.routine.deleteSuccess);
          router.back();
        } else {
          CustomAlertManager.error(t.routine.deleteFailed);
        }
      } catch (error) {
        console.error('루틴 삭제 실패:', error);
        CustomAlertManager.error(t.routine.deleteFailed);
      }
    });
  };

  /**
   * 루틴 편집 페이지로 이동합니다
   */
  const handleEdit = () => {
    if (!routine) return;
    router.push(`/routine/${routine.id}`);
  };

  const handleBack = useCallback(() => router.back(), [router]);

  const formatTime = (timeString?: string) => {
    if (!timeString) return t.routine.noAlarm;
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const date = new Date();
      date.setHours(hour, parseInt(minutes), 0, 0);
      const { formatTime: utilFormatTime } = require('../../../lib/date-utils');
      return utilFormatTime(date, '12h', t.locale.startsWith('en') ? 'en' : 'ko');
    } catch {
      return timeString;
    }
  };

  /**
   * 하위 작업 완료 상태를 변경합니다
   */
  const handleSubTaskToggle = async (subTaskId: string, isCompleted: boolean) => {
    try {
      const success = await updateCompletion(subTaskId, isCompleted);
      if (success) {
        // 루틴 데이터를 다시 가져와서 UI 업데이트
        refetch();
      }
    } catch (error) {
      console.error('하위 작업 상태 변경 실패:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
        <LoadingState message={t.routine.loadingRoutine} />
      </SafeAreaView>
    );
  }

  if (error || !routine) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
        <ErrorState
          message={error || t.routine.cannotFind}
          onRetry={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      {/* 헤더 */}
      <FadeInView>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: themeColors.surface,
          paddingHorizontal: 16,
          paddingVertical: 16,
          marginTop: 32,
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
          }}>{t.routine.routineDetail}</Text>
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
            }}>{t.common.edit}</Text>
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
            }}>{t.common.delete}</Text>
          </TouchableOpacity>
        </FadeInView>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 루틴 정보 헤더 */}
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
                <Text style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: themeColors.text,
                  marginBottom: 8,
                }}>
                  {routine.name}
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 8,
                }}>
                  <Clock size={16} color={themeColors.textSecondary} />
                  <Text style={{
                    marginLeft: 8,
                    color: themeColors.textSecondary,
                    fontSize: 14,
                  }}>
                    {formatTime(routine.alarmTime)}
                  </Text>
                  <Text style={{
                    marginLeft: 16,
                    color: themeColors.textSecondary,
                    fontSize: 14,
                  }}>
                    {getLocalizedRepeatCycle(routine.repeatCycle, t)}
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
            {/* 설명 */}
            {routine.details && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{
                  fontSize: 16,
                  color: themeColors.textSecondary,
                  lineHeight: 24,
                }}>
                  {routine.details}
                </Text>
              </View>
            )}

            {/* 이미지 */}
            {routine.imageUrl && (
              <View style={{ marginBottom: 24 }}>
                <Image
                  source={{ uri: routine.imageUrl }}
                  style={{
                    width: '100%',
                    height: 200,
                    borderRadius: 12,
                  }}
                  resizeMode="cover"
                />
              </View>
            )}

            {/* 하위 작업 */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: themeColors.text,
                marginBottom: 16,
              }}>
                {t.routine.subTasks} ({routine.subTasks?.length || 0}{t.routine.tasks})
              </Text>
              {routine.subTasks?.map((subTask, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    marginBottom: 8,
                    borderRadius: 8,
                    backgroundColor: themeColors.backgroundSecondary,
                    borderWidth: 1,
                    borderColor: themeColors.border,
                    shadowColor: themeColors.shadow,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: isDark ? 0.2 : 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                  onPress={() => handleSubTaskToggle(subTask.id, !subTask.isCompleted)}
                  disabled={isUpdatingSubTask}
                >
                  {subTask.isCompleted ? (
                    <CheckCircle2 size={20} color={themeColors.success} />
                  ) : (
                    <Circle size={20} color={themeColors.textSecondary} />
                  )}
                  <Text style={{
                    marginLeft: 12,
                    fontSize: 14,
                    color: subTask.isCompleted ? themeColors.textSecondary : themeColors.text,
                    textDecorationLine: subTask.isCompleted ? 'line-through' : 'none',
                  }}>
                    {subTask.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 루틴 정보 */}
            <View style={{
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: themeColors.border,
            }}>
              {routine.deadline && (
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
                    {t.routine.deadline}: {routine.deadline}
                  </Text>
                </View>
              )}
            </View>
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

export default RoutineDetailPage;