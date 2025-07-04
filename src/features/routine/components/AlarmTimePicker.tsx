import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Clock, ChevronDown } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

/**
 * 알람/시간 선택 컴포넌트
 * @param value - 선택된 시간(Date)
 * @param onChange - 시간 변경 콜백
 * @param className - 추가 스타일 클래스
 */
type AlarmTimePickerProps = {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
};

const formatTime = (date: Date) => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

const AlarmTimePicker = ({ value, onChange, className = '' }: AlarmTimePickerProps) => {
  const [show, setShow] = useState(false);

  const onTimeChange = (_: any, selected?: Date) => {
    setShow(false);
    if (selected) onChange(selected);
  };

  return (
    <View
      className={`flex-row items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-dropShadow ${className}`}
    >
      <Clock size={22} color="#576BCD" />
      <TouchableOpacity onPress={() => setShow(true)} className="flex-1 flex-row items-center">
        <Text className="mr-2 text-lg font-bold text-paleCobalt">{formatTime(value)}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}
    </View>
  );
};

export default AlarmTimePicker;
