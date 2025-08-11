import CommonBox from '@components/ui/common-box';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

import SearchCategoryButton from './search-category-button';
import { getCategoryData } from '../utils/getCategoryData';

type SearchItemCardProps = {
  id: string;
  category: string;
  name: string;
  location: string;
};

const SearchItemCard = ({ id, category, name, location }: SearchItemCardProps) => {
  const handlePress = () => {
    router.push(`/search/${id}`);
  };

  const { color } = getCategoryData(category);

  return (
    <CommonBox color={color}>
      <TouchableOpacity onPress={handlePress}>
        <View className="flex-row items-center ">
          <View className="mr-4">
            <SearchCategoryButton label={category} isSelected={false} />
          </View>

          <View className="flex-1">
            <View className="mb-1 flex-row items-center gap-2">
              <Text className="text-lg font-bold ">{name}</Text>
              <Text className={`w-24 rounded-md bg-${color} text-center text-ss`}>{category}</Text>
            </View>
            <Text className="text-md text-gray">{location}</Text>
          </View>

          <TouchableOpacity>
            <ChevronRight />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </CommonBox>
  );
};

export default SearchItemCard;
