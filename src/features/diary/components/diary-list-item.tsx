import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';

import { useThemeColors } from '../../../components/providers/theme-provider';
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
  // 수정 시간이 있으면 수정 시간 우선, 없으면 생성 시간
  const displayTime = item.updated_at ?? item.created_at ?? '';
  const date = new Date(displayTime);
  const day = date.getDate();
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  const formatted = formatDateTime(displayTime);

  // 기분 이모티콘 찾기
  const moodOption = item.mood ? MOOD_OPTIONS.find((m) => m.value === item.mood) : null;

  // 본문 내용 한 줄 요약 (최대 50자)
  const contentPreview = item.body
    ? item.body.replace(/\n/g, ' ').substring(0, 50) + (item.body.length > 50 ? '...' : '')
    : '';

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
      }}
    >
      {/* 날짜 */}
      <View style={{
        width: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: themeColors.accent,
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
