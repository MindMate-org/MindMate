import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState, useEffect, useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View, SafeAreaView } from 'react-native';

import Button from '../../../src/components/ui/button';
import SearchInput from '../../../src/components/ui/search-input';
import { useThemeColors } from '../../../src/components/providers/theme-provider';
import { useI18n } from '../../../src/hooks/use-i18n';
import SearchCategoryButton from '../../../src/features/search/components/search-category-button';
import SearchItemCard from '../../../src/features/search/components/search-item-card';
import { getSearchCategories } from '../../../src/features/search/constants/search-category-constants';
import { SearchData } from '../../../src/features/search/db/search-db-types';
import { getCategoryData } from '../../../src/features/search/utils/getCategoryData';
import { db } from '../../../src/hooks/use-initialize-database';

const HomeScreen = () => {
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
  const searchCategories = getSearchCategories(t.locale.startsWith('en') ? 'en' : 'ko');
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
      setSelectCategory(t.common.categories.all);
    }, [t]),
  );

  useEffect(() => {
    if (input.length === 0) {
      setSearch('');
    }
  }, [input]);

  const displayItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return items.filter((item) => {
      // 전체인 경우 항상 통과, 특정 카테고리인 경우 일치 여부 검사
      const matchesCategory = selectCategory === t.common.categories.all || item.category === selectCategory;

      // search가 빈 문자열이면 항상 통과, 아니면 포함 여부 검사
      const matchesSearch = !normalizedSearch || item.name.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [items, selectCategory, search]);

  const { icon: Icon } = getCategoryData(selectCategory, t.locale.startsWith('en') ? 'en' : 'ko');

  const resetSearch = () => {
    setInput('');
    setSearch('');
  };

  const getBackgroundColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'paleCobalt': '#576BCD',
      'foggyBlue': '#9BB5D6',
      'paleYellow': '#F5E6A8',
      'pink': '#F4A6CD',
      'teal': '#14b8a6',
    };
    return colorMap[color] || '#576BCD';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <View style={{ 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 16,
        paddingTop: 24 
      }}>
        <View className="mb-4 w-full">
          <SearchInput
            value={input}
            onChange={setInput}
            onSubmitEditing={() => setSearch(input)}
            placeholder={t.common.searchPlaceholder}
          />
        </View>

        <View style={{ 
          marginBottom: 32, 
          width: '100%', 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          gap: 4 
        }}>
          {searchCategories.map((category, index) => {
            const isSelected = selectCategory === category.label;
            return (
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderWidth: isSelected ? 2 : 0,
                  borderColor: isSelected ? (isDark ? '#FFFFFF' : '#000000') : 'transparent',
                  backgroundColor: getBackgroundColor(category.color),
                }}
                key={index}
                onPress={() => {
                  setSelectCategory(category.label);
                  resetSearch();
                }}
              >
                <SearchCategoryButton
                  label={category.label}
                  onPress={() => {
                    setSelectCategory(category.label);
                    resetSearch();
                  }}
                  isSelected={isSelected}
                />
                <Text style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: themeColors.text,
                }}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView className="w-full">
          {displayItems.length === 0 && (
            <View style={{
              marginTop: 40,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <View style={{ marginBottom: 12 }}>{Icon && <Icon size={48} color={themeColors.textSecondary} />}</View>
              <Text style={{
                marginBottom: 8,
                fontSize: 18,
                color: themeColors.text,
                textAlign: 'center'
              }}>{t.search.noItemsYet}</Text>
              <Text style={{
                marginBottom: 12,
                fontSize: 14,
                color: themeColors.textSecondary,
                textAlign: 'center'
              }}>{t.search.registerFirstItem}</Text>
              <Button onPress={handleCreateItem} className="w-3/5">
                <Text className="text-white">{t.search.registerItem}</Text>
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
