import { Search, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';

import { useThemeColors } from '../../../components/providers/theme-provider';
import { Colors } from '../../../constants/colors';
import { MOOD_OPTIONS, MoodType } from '../types';
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
  const { theme: themeColors } = useThemeColors();
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
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors.paleCobalt }}>
            일기 검색
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={Colors.gray} />
          </TouchableOpacity>
        </View>

        {/* 키워드 검색 */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: themeColors.text }}>
            키워드 검색
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F5F7FF',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <Search size={20} color={Colors.gray} />
            <TextInput
              value={keyword}
              onChangeText={setKeyword}
              placeholder="제목이나 내용을 검색하세요"
              placeholderTextColor={Colors.gray}
              style={{ flex: 1, marginLeft: 12, fontSize: 16 }}
            />
          </View>
        </View>

        {/* 날짜 범위 */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: themeColors.text }}>
            날짜 범위
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: Colors.gray, marginBottom: 4 }}>시작일</Text>
              <TextInput
                value={startDate}
                onChangeText={(value) => handleDateChange(value, 'start')}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.gray}
                style={{
                  backgroundColor: '#F5F7FF',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                }}
              />
            </View>
            <Text style={{ color: Colors.gray, marginTop: 16 }}>~</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: Colors.gray, marginBottom: 4 }}>종료일</Text>
              <TextInput
                value={endDate}
                onChangeText={(value) => handleDateChange(value, 'end')}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.gray}
                style={{
                  backgroundColor: '#F5F7FF',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                }}
              />
            </View>
          </View>
        </View>

        {/* 기분 필터 */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: themeColors.text }}>
            기분별 필터
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setSelectedMood(null)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: selectedMood === null ? Colors.paleCobalt : '#F5F7FF',
                borderWidth: 1,
                borderColor: selectedMood === null ? Colors.paleCobalt : '#E5E7EB',
              }}
            >
              <Text
                style={{
                  color: selectedMood === null ? 'white' : Colors.gray,
                  fontSize: 14,
                  fontWeight: '500',
                }}
              >
                전체
              </Text>
            </TouchableOpacity>
            {MOOD_OPTIONS.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                onPress={() => setSelectedMood(mood.value)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: selectedMood === mood.value ? Colors.paleCobalt : '#F5F7FF',
                  borderWidth: 1,
                  borderColor: selectedMood === mood.value ? Colors.paleCobalt : '#E5E7EB',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 14 }}>{mood.emoji}</Text>
                <Text
                  style={{
                    color: selectedMood === mood.value ? 'white' : Colors.gray,
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
            미디어 포함 여부
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setHasMedia(null)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: hasMedia === null ? Colors.paleCobalt : '#F5F7FF',
                borderWidth: 1,
                borderColor: hasMedia === null ? Colors.paleCobalt : '#E5E7EB',
              }}
            >
              <Text
                style={{
                  color: hasMedia === null ? 'white' : Colors.gray,
                  fontSize: 14,
                  fontWeight: '500',
                }}
              >
                전체
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setHasMedia(true)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: hasMedia === true ? Colors.paleCobalt : '#F5F7FF',
                borderWidth: 1,
                borderColor: hasMedia === true ? Colors.paleCobalt : '#E5E7EB',
              }}
            >
              <Text
                style={{
                  color: hasMedia === true ? 'white' : Colors.gray,
                  fontSize: 14,
                  fontWeight: '500',
                }}
              >
                미디어 있음
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setHasMedia(false)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: hasMedia === false ? Colors.paleCobalt : '#F5F7FF',
                borderWidth: 1,
                borderColor: hasMedia === false ? Colors.paleCobalt : '#E5E7EB',
              }}
            >
              <Text
                style={{
                  color: hasMedia === false ? 'white' : Colors.gray,
                  fontSize: 14,
                  fontWeight: '500',
                }}
              >
                미디어 없음
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
              backgroundColor: '#F5F7FF',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: Colors.paleCobalt, fontSize: 16, fontWeight: '600' }}>
              초기화
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSearch}
            style={{
              flex: 2,
              paddingVertical: 16,
              borderRadius: 12,
              backgroundColor: Colors.paleCobalt,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>검색하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </BaseModal>
  );
};

export default SearchModal;
