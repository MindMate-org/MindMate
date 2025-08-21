import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

import BaseModal from './base-modal';
import { useThemeColors } from '../../../components/providers/theme-provider';
import { useI18n } from '../../../hooks/use-i18n';
import {
  FONT_SIZE_OPTIONS,
  getFontFamilyOptions,
  TEXT_ALIGN_OPTIONS,
  getTextAlignLabels,
  TEXT_COLOR_OPTIONS,
  BACKGROUND_COLOR_OPTIONS,
} from '../constants/style-options';
import { DiaryStyleType } from '../types';

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
  const { theme: themeColors } = useThemeColors();
  const { t } = useI18n();

  return (
    <BaseModal visible={visible} onClose={onClose} height="70%">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        style={{ flex: 1 }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 20,
            color: themeColors.text,
          }}
        >
          {t.locale.startsWith('en') ? 'Style Settings' : '스타일 설정'}
        </Text>

        {/* 폰트 */}
        <Text
          style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 10, color: themeColors.primary }}
        >
          {t.locale.startsWith('en') ? 'Font' : '폰트'}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {getFontFamilyOptions(t.locale.startsWith('en')).map((font) => (
            <TouchableOpacity
              key={font.value}
              onPress={() => onStyleChange({ ...style, fontFamily: font.value })}
              style={{
                backgroundColor:
                  style.fontFamily === font.value ? themeColors.primary : themeColors.accent,
                borderRadius: 8,
                paddingVertical: 10,
                paddingHorizontal: 16,
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color:
                    style.fontFamily === font.value ? themeColors.primaryText : themeColors.text,
                  fontFamily: font.value === 'default' ? undefined : font.value,
                }}
              >
                {font.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 글자 크기 */}
        <Text
          style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 10, color: themeColors.primary }}
        >
          {t.locale.startsWith('en') ? 'Font Size' : '글자 크기'}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {FONT_SIZE_OPTIONS.map((size) => (
            <TouchableOpacity
              key={size}
              onPress={() => onStyleChange({ ...style, fontSize: size })}
              style={{
                backgroundColor: style.fontSize === size ? themeColors.primary : themeColors.accent,
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 16,
                marginRight: 8,
                marginBottom: 8,
                minWidth: 50,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: style.fontSize === size ? themeColors.primaryText : themeColors.text,
                  fontSize: 14,
                }}
              >
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 텍스트 색상 */}
        <Text
          style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 10, color: themeColors.primary }}
        >
          {t.locale.startsWith('en') ? 'Text Color' : '텍스트 색상'}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          {TEXT_COLOR_OPTIONS.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => onStyleChange({ ...style, textColor: color })}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: color,
                borderWidth: 3,
                borderColor: style.textColor === color ? themeColors.primary : themeColors.accent,
                marginRight: 8,
                marginBottom: 8,
              }}
            />
          ))}
        </View>

        {/* 텍스트 정렬 */}
        <Text
          style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 10, color: themeColors.primary }}
        >
          {t.locale.startsWith('en') ? 'Text Alignment' : '텍스트 정렬'}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
          {TEXT_ALIGN_OPTIONS.map((align) => (
            <TouchableOpacity
              key={align}
              onPress={() => onStyleChange({ ...style, textAlign: align })}
              style={{
                flex: 1,
                backgroundColor:
                  style.textAlign === align ? themeColors.primary : themeColors.accent,
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: style.textAlign === align ? themeColors.primaryText : themeColors.text,
                  fontWeight: '600',
                }}
              >
                {getTextAlignLabels(t.locale.startsWith('en'))[align]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 배경색 */}
        <Text
          style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 10, color: themeColors.primary }}
        >
          {t.locale.startsWith('en') ? 'Background Color' : '배경색'}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          {BACKGROUND_COLOR_OPTIONS.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => onStyleChange({ ...style, backgroundColor: color })}
              style={{
                width: 50,
                height: 50,
                borderRadius: 8,
                backgroundColor: color,
                borderWidth: 3,
                borderColor:
                  style.backgroundColor === color ? themeColors.primary : themeColors.accent,
                marginRight: 8,
                marginBottom: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            />
          ))}
        </View>

        {/* 미리보기 */}
        <Text
          style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 10, color: themeColors.primary }}
        >
          {t.locale.startsWith('en') ? 'Preview' : '미리보기'}
        </Text>
        <View
          style={{
            backgroundColor: style.backgroundColor,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: themeColors.accent,
          }}
        >
          <Text
            style={{
              fontSize: style.fontSize,
              color: style.textColor,
              textAlign: style.textAlign,
              fontFamily: style.fontFamily === 'default' ? undefined : style.fontFamily,
              lineHeight: style.fontSize * 1.4,
            }}
          >
            {t.locale.startsWith('en')
              ? 'This is preview text. Check how your selected style looks.'
              : '이것은 미리보기 텍스트입니다. 선택한 스타일이 어떻게 보이는지 확인하세요.'}
          </Text>
        </View>
      </ScrollView>
    </BaseModal>
  );
};

export default StylePicker;
