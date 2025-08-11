import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';

import { Colors } from '../../../constants/colors';

import BottomModal from '@/src/components/ui/bottom-modal';

interface AlarmTimeModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialDate?: Date;
}

/**
 * 일정 알림 시간 설정 모달
 *
 * 날짜와 시간을 선택하여 일정의 알림 시간을 설정할 수 있습니다.
 */
export const AlarmTimeModal: React.FC<AlarmTimeModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  initialDate = new Date(),
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedDate);
    onClose();
  };

  const showDatePicker = () => {
    setMode('date');
    setShowPicker(true);
  };

  const showTimePicker = () => {
    setMode('time');
    setShowPicker(true);
  };

  return (
    <BottomModal isModalVisible={isVisible} setIsModalVisible={onClose}>
      <View className="p-6">
        <Text className="mb-6 text-center text-lg font-bold text-gray-800">
          알림 시간 설정
        </Text>

        {/* 날짜 선택 */}
        <View className="mb-4">
          <Text className="mb-2 text-sm font-medium text-gray-600">날짜</Text>
          <TouchableOpacity
            onPress={showDatePicker}
            className="rounded-lg border border-gray-300 bg-white p-3"
          >
            <Text className="text-base text-gray-800">
              {selectedDate.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short',
              })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 시간 선택 */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium text-gray-600">시간</Text>
          <TouchableOpacity
            onPress={showTimePicker}
            className="rounded-lg border border-gray-300 bg-white p-3"
          >
            <Text className="text-base text-gray-800">
              {selectedDate.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* DateTimePicker */}
        {showPicker && (
          <DateTimePicker
            value={selectedDate}
            mode={mode}
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
            locale="ko-KR"
          />
        )}

        {/* 버튼들 */}
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={onClose}
            className="flex-1 rounded-lg border border-gray-300 bg-white py-3"
          >
            <Text className="text-center text-base font-medium text-gray-700">
              취소
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleConfirm}
            className="flex-1 rounded-lg py-3"
            style={{ backgroundColor: Colors.paleCobalt }}
          >
            <Text className="text-center text-base font-medium text-white">
              확인
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomModal>
  );
};