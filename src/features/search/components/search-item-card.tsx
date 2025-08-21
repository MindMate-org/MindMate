import CommonBox from '@components/ui/common-box';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

import { useThemeColors } from '../../../components/providers/theme-provider';
import { useI18n } from '../../../hooks/use-i18n';

import SearchCategoryButton from './search-category-button';
import { getCategoryData } from '../utils/getCategoryData';

const colorMap: Record<string, string> = {
  black: '#000000',
  gray: '#6B7280',
  white: '#9CA3AF',
  teal: '#14B8A6',
  paleYellow: '#F59E0B',
  pink: '#EC4899',
  turquoise: '#06B6D4',
  foggyBlue: '#93C5FD',
  paleCobalt: '#576BCD',
  red: '#EF4444',
};

const getColorValue = (colorName: string): string => {
  return colorMap[colorName] || colorMap.paleCobalt;
};

type SearchItemCardProps = {
  id: string;
  category: string;
  name: string;
  location: string;
};

const SearchItemCard = ({ id, category, name, location }: SearchItemCardProps) => {
  const { theme: themeColors } = useThemeColors();
  const { t } = useI18n();
  
  const handlePress = () => {
    router.push(`/search/${id}`);
  };

  const { icon: Icon, color } = getCategoryData(category, t.locale.startsWith('en') ? 'en' : 'ko');

  return (
    <CommonBox color={color}>
      <TouchableOpacity onPress={handlePress}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ marginRight: 16, padding: 8 }}>
            {Icon ? <Icon size={24} color={themeColors.primary} /> : <SearchCategoryButton label={category} isSelected={false} />}
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ 
              marginBottom: 4, 
              flexDirection: 'row', 
              alignItems: 'center', 
              gap: 8 
            }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold',
                color: themeColors.text,
              }}>{name}</Text>
              <Text style={{ 
                width: 96, 
                borderRadius: 6, 
                backgroundColor: getColorValue(color), 
                textAlign: 'center', 
                fontSize: 12,
                color: '#FFFFFF',
                paddingVertical: 2,
                paddingHorizontal: 8,
              }}>{category}</Text>
            </View>
            <Text style={{ 
              fontSize: 16, 
              color: themeColors.textSecondary 
            }}>{location}</Text>
          </View>

          <TouchableOpacity>
            <ChevronRight color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </CommonBox>
  );
};

export default SearchItemCard;
