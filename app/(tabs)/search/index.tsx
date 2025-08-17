import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState, useEffect, useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View, SafeAreaView } from 'react-native';

import Button from '../../../src/components/ui/button';
import SearchInput from '../../../src/components/ui/search-input';
import { useThemeColors } from '../../../src/components/providers/theme-provider';
import { useI18n } from '../../../src/hooks/use-i18n';
import SearchCategoryButton from '../../../src/features/search/components/search-category-button';
import SearchItemCard from '../../../src/features/search/components/search-item-card';
import { searchCategories } from '../../../src/features/search/constants/search-category-constants';
import { SearchData } from '../../../src/features/search/db/search-db-types';
import { getCategoryData } from '../../../src/features/search/utils/getCategoryData';
import { db } from '../../../src/hooks/use-initialize-database';

const HomeScreen = () => {
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
  const [items, setItems] = useState<SearchData[]>([]); // 전체
  const [input, setInput] = useState(''); // 검색어
  const [search, setSearch] = useState(''); // 제출 시 검색어
  const [selectCategory, setSelectCategory] = useState(''); // 선택된 카테고리
  const router = useRouter();

  const handleCreateItem = () => {
    router.push('/search/search-form');
  };

  // search 테이블 데이터 가져오기
  const getSearchItems = async () => {
    const allItems = (await db.getAllAsync(`SELECT * FROM search`)) as SearchData[];
    setItems(allItems);
  };

  useFocusEffect(
    useCallback(() => {
      getSearchItems();
      setSelectCategory('전체');
    }, []),
  );

  useEffect(() => {
    if (input.length === 0) {
      setSearch('');
    }
  }, [input]);

  const displayItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return items.filter((item) => {
      // 전체('전체')인 경우 항상 통과, 특정 카테고리인 경우 일치 여부 검사
      const matchesCategory = selectCategory === '전체' || item.category === selectCategory;

      // search가 빈 문자열이면 항상 통과, 아니면 포함 여부 검사
      const matchesSearch = !normalizedSearch || item.name.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [items, selectCategory, search]);

  const { icon: Icon } = getCategoryData(selectCategory);

  const resetSearch = () => {
    setInput('');
    setSearch('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? themeColors.background : '#a7f3d0' }}>
      <View style={{ 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 16 
      }}>
      <View className="mb-4 w-full">
        <SearchInput
          value={input}
          onChange={setInput}
          onSubmitEditing={() => setSearch(input)}
          placeholder="검색어를 입력해주세요"
        />
      </View>

      <View className="mb-8 w-full flex-row justify-between gap-1">
        {searchCategories.map((category, index) => {
          const isSelected = selectCategory === category.label;
          return (
            <View
              className={`flex items-center justify-center rounded-xl px-3 py-2 ${
                isSelected ? 'border-paleCobalt bg-white' : `bg-${category.color}`
              }`}
              key={index}
            >
              <SearchCategoryButton
                label={category.label}
                onPress={() => {
                  setSelectCategory(category.label);
                  resetSearch();
                }}
                isSelected={isSelected}
              />
              <Text className="text-black">{category.label}</Text>
            </View>
          );
        })}
      </View>

      <ScrollView className="w-full">
        {displayItems.length === 0 && (
          <View className="mt-10 flex items-center justify-center">
            <View className="mb-3 flex">{Icon && <Icon size={48} />}</View>
            <Text className="mb-2 flex text-md">아직 {selectCategory} 물건이 없어요</Text>
            <Text className="mb-3 flex text-sm">첫 번재 물건을 등록해보세요</Text>
            <Button onPress={handleCreateItem} className="w-3/5">
              <Text className="text-white">물건 등록하기</Text>
            </Button>
          </View>
        )}
        <View className="w-full gap-4">
          {displayItems.map((item) => (
            <SearchItemCard
              key={item.id}
              id={item.id}
              category={item.category}
              name={item.name}
              location={item.location}
            />
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 80,
          right: 32,
          height: 64,
          width: 64,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 32,
          backgroundColor: themeColors.primary,
          shadowColor: themeColors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.4 : 0.2,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => handleCreateItem()}
        activeOpacity={0.8}
      >
        <Text style={{
          fontSize: 28,
          fontWeight: '300',
          color: themeColors.primaryText,
        }}>+</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
