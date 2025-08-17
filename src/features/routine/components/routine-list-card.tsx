import { Pencil, Trash } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { useThemeColors } from '../../../components/providers/theme-provider';

/**
 * 루틴 리스트 카드 컴포넌트
 * @param title - 루틴 이름
 * @param time - 시간
 * @param duration - 기간/소요시간
 * @param onPress - 카드 클릭 시 콜백
 * @param onEdit - 편집 아이콘 클릭 시 콜백
 * @param onDelete - 삭제 아이콘 클릭 시 콜백
 * @param className - 추가 스타일 클래스
 */
export interface RoutineListCardPropsType {
  title: string;
  time: string;
  duration: string;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

const RoutineListCard: React.FC<RoutineListCardPropsType> = ({
  title,
  time,
  duration,
  onPress,
  onEdit,
  onDelete,
  className = '',
}) => {
  const { theme: themeColors, isDark } = useThemeColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        marginBottom: 12,
        width: '100%',
        flexDirection: 'row',
        borderRadius: 12,
        backgroundColor: themeColors.surface,
        height: 96,
        position: 'relative',
        shadowColor: themeColors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      <View style={{
        width: 8,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        backgroundColor: themeColors.primary,
      }} />
      <View style={{ position: 'absolute', top: 16, right: 20, flexDirection: 'row', zIndex: 2 }}>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={{ marginRight: 8 }}>
            <Pencil size={24} color={themeColors.primary} />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity onPress={onDelete}>
            <Trash size={24} color={themeColors.primary} />
          </TouchableOpacity>
        )}
      </View>
      <View style={{ height: '100%', flex: 1, paddingLeft: 16, paddingRight: 16 }}>
        <View style={{ height: '100%', flex: 1, justifyContent: 'center' }}>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            color: themeColors.text, 
            marginBottom: 4 
          }}>
            {title}
          </Text>
          <Text style={{ 
            fontSize: 20, 
            color: themeColors.textSecondary 
          }}>
            {time} ~{duration}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(RoutineListCard);
