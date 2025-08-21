import { Search, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';

import { useThemeColors } from '../../../components/providers/theme-provider';
import { useI18n } from '../../../hooks/use-i18n';
import { Colors } from '../../../constants/colors';
import { getMoodOptions, MoodType } from '../types';
import BaseModal from './base-modal';

type SearchFilters = {
  keyword: string;
  startDate: string;
  endDate: string;
  mood: MoodType | null;
  hasMedia: boolean | null;
};

type SearchModalProps = {
  visible: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
};

/**
 * 검색 및 필터 모달 컴포넌트
 */
const SearchModal = ({ visible, onClose, onSearch }: SearchModalProps) => {
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
  const moodOptions = getMoodOptions(t.locale);
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [hasMedia, setHasMedia] = useState<boolean | null>(null);

  const handleSearch = () => {
    onSearch({
      keyword: keyword.trim(),
      startDate,
      endDate,
      mood: selectedMood,
      hasMedia,
    });
    onClose();
  };

  const handleReset = () => {
    setKeyword('');
    setStartDate('');
    setEndDate('');
    setSelectedMood(null);
    setHasMedia(null);
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (value: string, type: 'start' | 'end') => {
    if (type === 'start') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
  };

  return (
    <BaseModal visible={visible} onClose={onClose} height="80%" preventOutsideTouch>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* 헤더 */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: themeColors.primary }}>
            {t.diary.searchDiary}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* 키워드 검색 */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: themeColors.text }}>
            {t.diary.keywordSearch}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: themeColors.surface,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: themeColors.border,
            }}
          >
            <Search size={20} color={themeColors.primary} />
            <TextInput
              value={keyword}
              onChangeText={setKeyword}
              placeholder={t.diary.searchTitleContent}
              placeholderTextColor={themeColors.textSecondary}
              style={{ 
                flex: 1, 
                marginLeft: 12, 
                fontSize: 16,
                color: themeColors.text,
              }}
            />
          </View>
        </View>

        {/* 날짜 범위 */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: themeColors.text }}>
            {t.diary.dateRange}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: themeColors.textSecondary, marginBottom: 4 }}>{t.diary.startDate}</Text>
              <TextInput
                value={startDate}
                onChangeText={(value) => handleDateChange(value, 'start')}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={themeColors.textSecondary}
                style={{
                  backgroundColor: themeColors.backgroundSecondary,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: themeColors.text,
                  borderWidth: 1,
                  borderColor: themeColors.border,
                }}
              />
            </View>
            <Text style={{ color: themeColors.textSecondary, marginTop: 16 }}>~</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: themeColors.textSecondary, marginBottom: 4 }}>{t.diary.endDate}</Text>
              <TextInput
                value={endDate}
                onChangeText={(value) => handleDateChange(value, 'end')}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={themeColors.textSecondary}
                style={{
                  backgroundColor: themeColors.backgroundSecondary,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: themeColors.text,
                  borderWidth: 1,
                  borderColor: themeColors.border,
                }}
              />
            </View>
          </View>
        </View>

        {/* 기분 필터 */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: themeColors.text }}>
            {t.diary.moodFilter}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setSelectedMood(null)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: selectedMood === null ? themeColors.primary : themeColors.backgroundSecondary,
                borderWidth: 1,
                borderColor: selectedMood === null ? themeColors.primary : themeColors.border,
              }}
            >
              <Text
                style={{
                  color: selectedMood === null ? themeColors.primaryText : themeColors.textSecondary,
                  fontSize: 14,
                  fontWeight: '500',
                }}
              >
                {t.diary.all}
              </Text>
            </TouchableOpacity>
            {moodOptions.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                onPress={() => setSelectedMood(mood.value)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: selectedMood === mood.value ? themeColors.primary : themeColors.backgroundSecondary,
                  borderWidth: 1,
                  borderColor: selectedMood === mood.value ? themeColors.primary : themeColors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 14 }}>{mood.emoji}</Text>
                <Text
                  style={{
                    color: selectedMood === mood.value ? themeColors.primaryText : themeColors.textSecondary,
                    fontSize: 12,
                    fontWeight: '500',
                  }}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 미디어 필터 */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: themeColors.text }}>
            {t.diary.mediaFilter}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setHasMedia(null)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: hasMedia === null ? themeColors.primary : themeColors.backgroundSecondary,
                borderWidth: 1,
                borderColor: hasMedia === null ? themeColors.primary : themeColors.border,
              }}
            >
              <Text
                style={{
                  color: hasMedia === null ? themeColors.primaryText : themeColors.textSecondary,
                  fontSize: 14,
                  fontWeight: '500',
                }}
              >
                {t.diary.all}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setHasMedia(true)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: hasMedia === true ? themeColors.primary : themeColors.backgroundSecondary,
                borderWidth: 1,
                borderColor: hasMedia === true ? themeColors.primary : themeColors.border,
              }}
            >
              <Text
                style={{
                  color: hasMedia === true ? themeColors.primaryText : themeColors.textSecondary,
                  fontSize: 14,
                  fontWeight: '500',
                }}
              >
                {t.diary.mediaIncluded}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setHasMedia(false)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: hasMedia === false ? themeColors.primary : themeColors.backgroundSecondary,
                borderWidth: 1,
                borderColor: hasMedia === false ? themeColors.primary : themeColors.border,
              }}
            >
              <Text
                style={{
                  color: hasMedia === false ? themeColors.primaryText : themeColors.textSecondary,
                  fontSize: 14,
                  fontWeight: '500',
                }}
              >
                {t.diary.noMedia}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 버튼 */}
        <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 40 }}>
          <TouchableOpacity
            onPress={handleReset}
            style={{
              flex: 1,
              paddingVertical: 16,
              borderRadius: 12,
              backgroundColor: themeColors.backgroundSecondary,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: themeColors.border,
            }}
          >
            <Text style={{ color: themeColors.primary, fontSize: 16, fontWeight: '600' }}>
              {t.diary.resetFilters}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSearch}
            style={{
              flex: 2,
              paddingVertical: 16,
              borderRadius: 12,
              backgroundColor: themeColors.primary,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: themeColors.primaryText, fontSize: 16, fontWeight: '600' }}>{t.diary.searchAction}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </BaseModal>
  );
};

export default SearchModal;
