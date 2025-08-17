import CommonBox from '@components/ui/common-box';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

import { useThemeColors } from '../../../components/providers/theme-provider';

import SearchCategoryButton from './search-category-button';
import { getCategoryData } from '../utils/getCategoryData';

type SearchItemCardProps = {
  id: string;
  category: string;
  name: string;
  location: string;
};

const SearchItemCard = ({ id, category, name, location }: SearchItemCardProps) => {
  const { theme: themeColors } = useThemeColors();
  
  const handlePress = () => {
    router.push(`/search/${id}`);
  };

  const { color } = getCategoryData(category);

  return (
    <CommonBox color={color}>
      <TouchableOpacity onPress={handlePress}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ marginRight: 16 }}>
            <SearchCategoryButton label={category} isSelected={false} />
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
                backgroundColor: color, 
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
