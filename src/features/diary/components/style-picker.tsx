import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

import { Colors } from '../../../constants/colors';
import { DiaryStyleType } from '../types';
import BaseModal from './base-modal';
import {
  FONT_SIZE_OPTIONS,
  TEXT_ALIGN_OPTIONS,
  TEXT_ALIGN_LABELS,
  BACKGROUND_COLOR_OPTIONS,
} from '../constants/style-options';

type StylePickerProps = {
  visible: boolean;
  onClose: () => void;
  style: DiaryStyleType;
  onStyleChange: (style: DiaryStyleType) => void;
};

/**
 * 스타일 설정 모달 컴포넌트
 *
 * 일기 작성 시 텍스트 스타일을 사용자지정할 수 있는 모달입니다.
 * 글자 크기, 텍스트 정렬, 배경색을 설정할 수 있습니다.
 *
 * @param visible - 모달 표시 여부
 * @param onClose - 모달 닫기 콜백
 * @param style - 현재 스타일 설정
 * @param onStyleChange - 스타일 변경 콜백
 */
const StylePicker = ({ visible, onClose, style, onStyleChange }: StylePickerProps) => {
  return (
    <BaseModal visible={visible} onClose={onClose} height="52%">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>
          스타일 설정
        </Text>

        {/* 글자 크기 */}
        <Text style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 8 }}>글자 크기</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {FONT_SIZE_OPTIONS.map((size) => (
            <TouchableOpacity
              key={size}
              onPress={() => onStyleChange({ ...style, fontSize: size })}
              style={{
                backgroundColor: style.fontSize === size ? Colors.paleCobalt : Colors.foggyBlue,
                borderRadius: 100,
                paddingVertical: 8,
                paddingHorizontal: 16,
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color: style.fontSize === size ? 'white' : 'black',
                }}
              >
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 텍스트 정렬 */}
        <Text style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 8 }}>텍스트 정렬</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {TEXT_ALIGN_OPTIONS.map((align) => (
            <TouchableOpacity
              key={align}
              onPress={() => onStyleChange({ ...style, textAlign: align })}
              style={{
                flex: 1,
                backgroundColor: style.textAlign === align ? Colors.paleCobalt : Colors.foggyBlue,
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: style.textAlign === align ? 'white' : 'black',
                }}
              >
                {TEXT_ALIGN_LABELS[align]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 배경색 */}
        <Text style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 8 }}>배경색</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {BACKGROUND_COLOR_OPTIONS.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => onStyleChange({ ...style, backgroundColor: color })}
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                backgroundColor: color,
                borderWidth: 2,
                borderColor: style.backgroundColor === color ? Colors.paleCobalt : 'transparent',
                marginRight: 8,
                marginBottom: 8,
              }}
            />
          ))}
        </View>
      </ScrollView>
    </BaseModal>
  );
};

export default StylePicker;
