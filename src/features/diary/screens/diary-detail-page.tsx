import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, MoreVertical, Trash2, Edit3, Share2, Star } from 'lucide-react-native';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Pressable,
} from 'react-native';

import ErrorState from '../../../components/ui/error-state';
import LoadingState from '../../../components/ui/loading-state';
import { Colors } from '../../../constants/colors';
import { formatDateTimeString } from '../../../lib/date-utils';
import ExportModal from '../components/export-modal';
import { MediaSlider } from '../components/media-slider';
import { DiaryService } from '../services';
import { MOOD_OPTIONS } from '../types';

type DiaryDetailType = Awaited<ReturnType<typeof DiaryService.getDiaryById>>;
type DiaryMediaType = Awaited<ReturnType<typeof DiaryService.getMediaByDiaryId>>;

export interface DiaryDetailPageProps {}

/**
 * 일기 상세 보기 페이지
 * @description 특정 일기의 상세 내용을 표시하고 편집/삭제/공유 기능을 제공합니다.
 */
const DiaryDetailPage: React.FC<DiaryDetailPageProps> = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [diary, setDiary] = useState<DiaryDetailType | null>(null);
  const [media, setMedia] = useState<DiaryMediaType>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      const numericId = parseInt(id, 10);
      if (!isNaN(numericId)) {
        fetchDiaryDetail(numericId);
      } else {
        setError('잘못된 일기 ID입니다.');
        setIsLoading(false);
      }
    }
  }, [id]);

  /**
   * 일기 상세 정보를 가져옵니다
   * @param diaryId 일기 ID
   */
  const fetchDiaryDetail = async (diaryId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const [diaryData, mediaData] = await Promise.all([
        DiaryService.getDiaryById(diaryId),
        DiaryService.getMediaByDiaryId(diaryId),
      ]);
      setDiary(diaryData);
      setMedia(mediaData);
    } catch (error) {
      console.error('일기 상세 정보 조회 실패:', error);
      setError('일기 정보를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 일기를 즐겨찾기에 추가/제거합니다
   */
  const handleToggleFavorite = useCallback(async () => {
    if (!diary) return;

    try {
      await DiaryService.toggleFavorite(diary.id, !diary.isFavorite);
      setDiary({ ...diary, isFavorite: !diary.isFavorite });
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
      Alert.alert('오류', '즐겨찾기 상태 변경에 실패했습니다.');
    }
  }, [diary]);

  /**
   * 일기를 삭제합니다
   */
  const handleDelete = () => {
    if (!diary) return;

    Alert.alert('일기 삭제', '정말로 이 일기를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await DiaryService.deleteDiary(diary.id);
            Alert.alert('완료', '일기가 삭제되었습니다.', [
              { text: '확인', onPress: () => router.back() },
            ]);
          } catch (error) {
            console.error('일기 삭제 실패:', error);
            Alert.alert('오류', '일기 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  /**
   * 일기 편집 페이지로 이동합니다
   */
  const handleEdit = () => {
    if (!diary) return;
    router.push(`/diary/edit/${diary.id}`);
  };

  const handleBack = useCallback(() => router.back(), [router]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <LoadingState message="일기를 불러오는 중..." />
      </SafeAreaView>
    );
  }

  if (error || !diary) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ErrorState
          message={error || '일기를 찾을 수 없습니다.'}
          onRetry={() => fetchDiaryDetail(parseInt(id as string, 10))}
        />
      </SafeAreaView>
    );
  }

  const mood = useMemo(() => MOOD_OPTIONS.find((m) => m.id === diary.mood), [diary.mood]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 헤더 */}
      <View className="flex-row items-center justify-between border-b-2 border-turquoise bg-white px-4 py-4">
        <TouchableOpacity onPress={handleBack}>
          <ChevronLeft size={24} color={Colors.paleCobalt} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-paleCobalt">일기 상세</Text>
        <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
          <MoreVertical size={24} color={Colors.paleCobalt} />
        </TouchableOpacity>
      </View>

      {/* 메뉴 */}
      {showMenu && (
        <View className="absolute right-4 top-16 z-10 w-32 rounded-lg bg-white p-2 shadow-lg">
          <TouchableOpacity className="flex-row items-center py-2" onPress={handleEdit}>
            <Edit3 size={16} color={Colors.paleCobalt} />
            <Text className="ml-2 text-sm text-paleCobalt">편집</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center py-2" onPress={handleToggleFavorite}>
            <Star size={16} color={diary.isFavorite ? '#fbbf24' : Colors.paleCobalt} />
            <Text className="ml-2 text-sm text-paleCobalt">
              {diary.isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center py-2"
            onPress={() => setShowExportModal(true)}
          >
            <Share2 size={16} color={Colors.paleCobalt} />
            <Text className="ml-2 text-sm text-paleCobalt">내보내기</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center py-2" onPress={handleDelete}>
            <Trash2 size={16} color="#ef4444" />
            <Text className="ml-2 text-sm text-red-500">삭제</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView className="flex-1">
        <View
          className="mx-4 mt-4 rounded-xl p-6"
          style={{
            backgroundColor: diary.backgroundColor || '#F5F7FF',
          }}
        >
          {/* 제목 */}
          <Text
            className="mb-4 text-xl font-bold"
            style={{
              color: diary.textColor,
              fontFamily: diary.font === 'default' ? undefined : diary.font,
              textAlign: diary.textAlign as 'left' | 'center' | 'right',
            }}
          >
            {diary.title}
          </Text>

          {/* 내용 */}
          <Text
            className="mb-6 leading-7"
            style={{
              color: diary.textColor,
              fontSize: diary.fontSize,
              fontFamily: diary.font === 'default' ? undefined : diary.font,
              textAlign: diary.textAlign as 'left' | 'center' | 'right',
            }}
          >
            {diary.body}
          </Text>

          {/* 미디어 */}
          {media.length > 0 && (
            <View className="mb-6">
              <MediaSlider media={media} />
            </View>
          )}
        </View>

        {/* 메타 정보 */}
        <View className="mx-4 mt-4 rounded-xl bg-white p-6 shadow-sm">
          <View className="mb-4 flex-row items-center">
            <Text className="text-gray-600 text-sm">작성일: </Text>
            <Text className="text-gray-800 text-sm font-medium">
              {formatDateTimeString(diary.createdAt)}
            </Text>
          </View>

          {mood && (
            <View className="flex-row items-center">
              <Text className="text-gray-600 text-sm">기분: </Text>
              <Text className="mr-2 text-lg">{mood.emoji}</Text>
              <Text className="text-gray-800 text-sm font-medium">{mood.name}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <ExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        diary={diary}
        media={media}
      />

      {/* 메뉴 닫기용 오버레이 */}
      {showMenu && <Pressable className="absolute inset-0" onPress={() => setShowMenu(false)} />}
    </SafeAreaView>
  );
};

export default DiaryDetailPage;
