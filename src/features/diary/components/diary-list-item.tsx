import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';

import { useThemeColors } from '../../../components/providers/theme-provider';
import { useI18n } from '../../../hooks/use-i18n';
import { MOOD_OPTIONS } from '../types';

type DiaryListItemProps = {
  item: any;
  onPress: () => void;
  formatDateTime: (datetime: string) => string;
};

/**
 * 일기 목록 아이템 컴포넌트
 */
const DiaryListItem = ({ item, onPress, formatDateTime }: DiaryListItemProps) => {
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
  
  // 수정 시간이 있으면 수정 시간 우선, 없으면 생성 시간
  const displayTime = item.updated_at ?? item.created_at ?? '';
  const date = new Date(displayTime);
  const day = date.getDate();
  
  // 다국어 지원 요일
  const weekdayNames = t.locale.startsWith('en') 
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdayNames[date.getDay()];
  
  const formatted = formatDateTime(displayTime);

  // 기분 이모티콘 찾기
  const moodOption = item.mood ? MOOD_OPTIONS.find((m) => m.value === item.mood) : null;

  // 본문 내용 한 줄 요약 (최대 50자)
  const contentPreview = item.body
    ? item.body.replace(/\n/g, ' ').substring(0, 50) + (item.body.length > 50 ? '...' : '')
    : '';

  // 감정에 따른 색상 설정 (일정/루틴과 비슷한 색상 팔레트 사용)
  const getMoodColor = (mood: string | null) => {
    if (!mood) return themeColors.primary;
    
    const moodColors = {
      'happy': '#22c55e',    // 초록색 (행복)
      'sad': '#3b82f6',      // 파란색 (슬픔)  
      'angry': '#ef4444',    // 빨간색 (화남)
      'excited': '#f59e0b',  // 오렌지색 (흥미)
      'calm': '#14b8a6',     // 일정 완료 색상과 동일 (차분함)
      'anxious': '#ec4899',  // 일정 미완료 색상과 동일 (불안)
    };
    
    return moodColors[mood as keyof typeof moodColors] || themeColors.primary;
  };

  return (
    <Pressable
      onPress={onPress}
      style={{
        marginBottom: 16,
        flexDirection: 'row',
        overflow: 'hidden',
        borderRadius: 16,
        backgroundColor: themeColors.surface,
        shadowColor: themeColors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: 4,
        position: 'relative',
      }}
    >
      {/* 감정별 색상 라인 (다크모드에서만 표시) */}
      {isDark && (
        <View style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: getMoodColor(item.mood),
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16,
        }} />
      )}
      {/* 날짜 */}
      <View style={{
        width: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDark ? themeColors.backgroundSecondary : themeColors.accent,
        marginLeft: isDark ? 4 : 0, // 다크모드에서만 색상 라인과의 간격
      }}>
        <Text style={{
          fontSize: 14,
          fontWeight: 'bold',
          lineHeight: 16,
          color: themeColors.primary,
        }}>{day}</Text>
        <Text style={{
          marginTop: 4,
          fontSize: 14,
          fontWeight: 'bold',
          lineHeight: 16,
          color: themeColors.primary,
        }}>{weekday}</Text>
      </View>

      {/* 콘텐츠 */}
      <View style={{ flex: 1, justifyContent: 'space-between', padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ marginRight: 12, flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={{
                  flex: 1,
                  fontSize: 18,
                  fontWeight: 'bold',
                  lineHeight: 22,
                  color: themeColors.text,
                  marginRight: 8,
                }}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              {moodOption && (
                <Text style={{ fontSize: 18, flexShrink: 0 }}>
                  {moodOption.emoji}
                </Text>
              )}
            </View>
            {contentPreview && (
              <Text style={{
                marginTop: 4,
                fontSize: 14,
                lineHeight: 20,
                color: themeColors.textSecondary,
              }} numberOfLines={1}>
                {contentPreview}
              </Text>
            )}
          </View>
          {item.thumbnailUri ? (
            <Image
              source={{ uri: item.thumbnailUri }}
              style={{
                height: 80,
                width: 80,
                borderRadius: 8,
              }}
              resizeMode="cover"
            />
          ) : (
            // 대체이미지: 배경색 + 첫글자 텍스트
            <View style={{
              height: 80,
              width: 80,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              backgroundColor: themeColors.primary,
            }}>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: themeColors.primaryText,
              }}>
                {item.title?.[0]?.toUpperCase() ?? 'D'}
              </Text>
            </View>
          )}
        </View>
        <Text style={{
          marginTop: 8,
          fontSize: 14,
          color: themeColors.primary,
        }}>{formatted}</Text>
      </View>
    </Pressable>
  );
};

export { DiaryListItem };
