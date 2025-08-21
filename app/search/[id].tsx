import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Camera, ChevronLeft, ChevronRight, MapPin, MoreHorizontal, Edit3, Trash2 } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { FlatList, Image, Text, useWindowDimensions, View, SafeAreaView, TouchableOpacity, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../../src/components/ui/button';
import { CustomAlertManager } from '../../src/components/ui/custom-alert';
import { useThemeColors } from '../../src/components/providers/theme-provider';
import { useI18n } from '../../src/hooks/use-i18n';
import { SearchData } from '../../src/features/search/db/search-db-types';
import {
  fetchDeleteSearchById,
  fetchGetMediaById,
  fetchGetSearchById,
} from '../../src/features/search/search-services';
import { getCategoryData } from '../../src/features/search/utils/getCategoryData';
import { deleteAlert } from '../../src/lib/common-alert';
import { MediaFullType } from '../../src/lib/db/share-db-types';

const ItemDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const { t } = useI18n();
  const { theme: themeColors, isDark } = useThemeColors();
  const [items, setItems] = useState<SearchData | null>(null);
  const [media, setMedia] = useState<MediaFullType[]>([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const itemWidth = screenWidth - 28;

  useFocusEffect(
    useCallback(() => {
      initializeAll();
    }, []),
  );

  const initializeAll = async () => {
    try {
      const [search, media] = await Promise.all([fetchGetSearchById(+id), fetchGetMediaById(+id)]);
      setItems(search);
      setMedia(media);
    } catch (error) {
      CustomAlertManager.error(t.search.loadFailed);
    }
  };

  // 삭제 로직
  const handleDeleteSearch = async () => {
    try {
      deleteAlert({
        type: 'delete',
        text1: t.search.deleteConfirm,
        text2: '',
        onPress: deleteSearchWithAlert,
      });
    } catch (error) {
      CustomAlertManager.error(t.search.deleteFailed);
    }
  };

  const deleteSearchWithAlert = async () => {
    try {
      await fetchDeleteSearchById(+id);
      await CustomAlertManager.success(t.locale.startsWith('en') ? 'Item deleted successfully.' : '물건이 삭제되었습니다.');
      router.back();
    } catch (error) {
      console.error('Item delete failed:', error);
      CustomAlertManager.error(t.locale.startsWith('en') ? 'An error occurred while deleting the item.' : '물건 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = () => {
    router.push(`/search/search-form?id=${id}`);
  };

  if (items === null)
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
        <View style={{ 
          flex: 1, 
          alignItems: 'center', 
          justifyContent: 'center', 
          paddingHorizontal: 16, 
          paddingVertical: 32 
        }}>
          <Text style={{ color: themeColors.text }}>{t.search.loadingText}</Text>
        </View>
      </SafeAreaView>
    );

  const { color } = getCategoryData(items.category, t.locale.startsWith('en') ? 'en' : 'ko');
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      {/* 헤더 */}
      <View style={{
        marginTop: 32,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: themeColors.surface,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={themeColors.primary} />
        </TouchableOpacity>
        <Text style={{
          flex: 1,
          textAlign: 'center',
          fontSize: 18,
          fontWeight: 'bold',
          color: themeColors.text,
        }}>{t.search.itemDetail}</Text>
        <TouchableOpacity
          onPress={() => setIsMenuVisible(!isMenuVisible)}
          style={{
            borderRadius: 20,
            padding: 8,
            backgroundColor: isMenuVisible ? `${themeColors.primary}20` : 'transparent',
          }}
        >
          <MoreHorizontal size={24} color={themeColors.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={{ 
        flex: 1, 
        justifyContent: 'space-between', 
        backgroundColor: themeColors.background, 
        paddingHorizontal: 16, 
        paddingVertical: 32 
      }}>
        <View style={{ flex: 1 }}>
          <View style={{ 
            marginBottom: 48, 
            width: '100%', 
            flexDirection: 'row', 
            alignItems: 'center' 
          }}>
            <Text style={{ 
              marginRight: 16, 
              fontSize: 20, 
              fontWeight: 'bold',
              color: themeColors.text
            }}>{items.name}</Text>
            <View style={{
              height: 32,
              width: 96,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 16,
              backgroundColor: themeColors.accent,
            }}>
              <Text style={{ 
                fontSize: 12,
                color: themeColors.primary
              }}>{items.category}</Text>
            </View>
          </View>

          <View style={{ marginBottom: 24 }}>
            {media.length > 0 ? (
              <View>
                <View style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  zIndex: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 20,
                  backgroundColor: themeColors.primary,
                  padding: 8,
                }}>
                  <ChevronLeft color={themeColors.primaryText} />
                </View>
                <View style={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  zIndex: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 20,
                  backgroundColor: themeColors.primary,
                  padding: 8,
                }}>
                  <ChevronRight color={themeColors.primaryText} />
                </View>
                <FlatList
                  data={media}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={itemWidth}
                  decelerationRate="fast"
                  renderItem={({ item }) => (
                    <View
                      style={{ 
                        width: itemWidth,
                        height: 200,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 12,
                      }}
                    >
                      <Image
                        source={{ uri: item.file_path }}
                        resizeMode="cover"
                        style={{
                          height: '100%',
                          width: '100%',
                          borderRadius: 12,
                        }}
                      />
                    </View>
                  )}
                />
              </View>
            ) : (
              <View style={{
                height: 200,
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                backgroundColor: themeColors.accent,
              }}>
                <Camera size={44} color={themeColors.primary} />
              </View>
            )}
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            <MapPin size={18} color={themeColors.primary} />
            <Text style={{ 
              fontSize: 14, 
              fontWeight: 'bold',
              color: themeColors.text
            }}>{items.location}</Text>
          </View>
          
          <View style={{
            height: 168,
            width: '100%',
            borderRadius: 12,
            backgroundColor: themeColors.surface,
            padding: 24,
            shadowColor: themeColors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <Text style={{ 
              fontSize: 16,
              color: themeColors.text
            }}>{items.description}</Text>
          </View>
        </View>

        {/* 빈 공간으로 유지 */}
        <View style={{ paddingBottom: Math.max(insets.bottom + 16, 34) }} />
      </View>

      {/* 메뉴 */}
      {isMenuVisible && (
        <View style={{
          position: 'absolute',
          right: 16,
          top: 80,
          zIndex: 10,
          width: 160,
          borderRadius: 12,
          backgroundColor: themeColors.surface,
          padding: 8,
          shadowColor: themeColors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.4 : 0.2,
          shadowRadius: 8,
          elevation: 8,
        }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
            }}
            onPress={() => {
              setIsMenuVisible(false);
              handleEdit();
            }}
          >
            <Edit3 size={18} color={themeColors.primary} />
            <Text style={{
              marginLeft: 12,
              fontSize: 14,
              color: themeColors.text,
              fontWeight: '500',
            }}>{t.search.modify}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
            }}
            onPress={() => {
              setIsMenuVisible(false);
              handleDeleteSearch();
            }}
          >
            <Trash2 size={18} color={themeColors.error || '#ef4444'} />
            <Text style={{
              marginLeft: 12,
              fontSize: 14,
              color: themeColors.error || '#ef4444',
              fontWeight: '500',
            }}>{t.search.deleteItem}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 메뉴 닫기용 오버레이 */}
      {isMenuVisible && (
        <Pressable 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          onPress={() => setIsMenuVisible(false)}
        />
      )}
    </SafeAreaView>
  );
};

export default ItemDetailScreen;
