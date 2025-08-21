import { Search, X } from 'lucide-react-native';
import { Dispatch, SetStateAction } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

import { useThemeColors } from '../providers/theme-provider';

type SearchInputType = {
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
  onSubmitEditing?: () => void;
  placeholder?: string;
};

const SearchInput = ({ value, onChange, onSubmitEditing, placeholder }: SearchInputType) => {
  const { theme: themeColors, isDark } = useThemeColors();
  
  return (
    <View style={{
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 24,
      backgroundColor: themeColors.surface,
      paddingHorizontal: 16,
      shadowColor: themeColors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      <TextInput
        style={{
          height: 56,
          flex: 1,
          color: themeColors.text,
        }}
        value={value}
        onChangeText={onChange}
        returnKeyType="search"
        onSubmitEditing={onSubmitEditing}
        placeholder={placeholder}
        placeholderTextColor={themeColors.textSecondary}
      />
      {value.length > 0 && (
        <TouchableOpacity 
          onPress={() => onChange('')} 
          style={{ marginRight: 8 }}
        >
          <X size={18} color={themeColors.error} />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={onSubmitEditing}>
        <Search color={themeColors.primary} />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;
