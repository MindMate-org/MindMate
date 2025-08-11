import { useRouter } from 'expo-router';
import { ChevronLeft, RotateCcw, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { Colors } from '../../src/constants/colors';
import { DiaryListItem } from '../../src/features/diary/components/diary-list-item';
import { DiaryService } from '../../src/features/diary/services';
import { formatDateTimeString } from '../../src/lib/date-utils';

type DeletedDiary = {
  id: number;
  title: string | null;
  body: string | null;
  deleted_at: string | null;
  created_at: string | null;
  media_uri?: string | null;
  media_type?: string | null;
  mood?: string | null;
};

/**
 * 휴지통 페이지 컴포넌트
 */
const TrashPage = () => {
  const router = useRouter();
  const [deletedDiaries, setDeletedDiaries] = useState<DeletedDiary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeletedDiaries();
  }, []);

  const fetchDeletedDiaries = async () => {
    try {
      setLoading(true);
      const result = await DiaryService.getDeletedDiariesWithMedia();
      setDeletedDiaries(result);
    } catch (error) {
      console.error('휴지통 일기 조회 실패:', error);
      Alert.alert('오류', '휴지통 일기를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (id: number, title: string | null) => {
    Alert.alert('일기 복원', `"${title || '제목 없음'}" 일기를 복원하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '복원',
        onPress: async () => {
          try {
            await DiaryService.restoreDiary(id);
            Alert.alert('성공', '일기가 복원되었습니다.');
            fetchDeletedDiaries();
          } catch (error) {
            console.error('일기 복원 실패:', error);
            Alert.alert('오류', '일기 복원에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const handlePermanentDelete = (id: number, title: string | null) => {
    Alert.alert(
      '영구 삭제',
      `"${title || '제목 없음'}" 일기를 영구적으로 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '영구 삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await DiaryService.permanentDeleteDiary(id);
              Alert.alert('완료', '일기가 영구적으로 삭제되었습니다.');
              fetchDeletedDiaries();
            } catch (error) {
              console.error('일기 영구 삭제 실패:', error);
              Alert.alert('오류', '일기 삭제에 실패했습니다.');
            }
          },
        },
      ],
    );
  };

  const handleBack = () => router.back();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 헤더 */}
      <View className="mt-8 flex-row items-center justify-between border-b-2 border-turquoise bg-white px-4 py-4">
        <TouchableOpacity onPress={handleBack}>
          <ChevronLeft size={24} color={Colors.paleCobalt} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-paleCobalt">휴지통</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        className="flex-1 bg-turquoise px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {loading ? (
          <View className="flex-1 items-center justify-center" style={{ marginTop: 100 }}>
            <ActivityIndicator size="large" color="#576bcd" />
            <Text className="mt-4 text-center text-base text-paleCobalt">
              휴지통을 불러오는 중...
            </Text>
          </View>
        ) : deletedDiaries.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Trash2 size={64} color={Colors.gray} />
            <Text className="mt-4 text-lg text-gray">휴지통이 비어있습니다</Text>
            <Text className="mt-2 text-sm text-gray">삭제된 일기가 없습니다</Text>
          </View>
        ) : (
          <View className="pb-4">
            <Text className="mb-4 text-sm text-gray">
              삭제된 일기는 30일 후 자동으로 영구 삭제됩니다
            </Text>
            {deletedDiaries.map((diary) => {
              // 썸네일 URI 설정
              const diaryWithThumbnail = {
                ...diary,
                thumbnailUri: diary.media_uri,
              };

              return (
                <View key={diary.id} className="mb-4">
                  <DiaryListItem
                    item={diaryWithThumbnail}
                    onPress={() => {}} // 휴지통에서는 상세보기 비활성화
                    formatDateTime={formatDateTimeString}
                  />

                  {/* 휴지통 전용 버튼들 */}
                  <View className="mx-4 -mt-2 mb-2 flex-row items-center justify-between">
                    <Text className="text-xs text-gray">
                      삭제: {diary.deleted_at ? formatDateTimeString(diary.deleted_at) : ''}
                    </Text>

                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => handleRestore(diary.id, diary.title)}
                        className="flex-row items-center rounded-full bg-green-100 px-3 py-1"
                      >
                        <RotateCcw size={14} color="#059669" />
                        <Text className="ml-1 text-xs font-medium text-green-700">복원</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handlePermanentDelete(diary.id, diary.title)}
                        className="flex-row items-center rounded-full bg-red-100 px-3 py-1"
                      >
                        <Trash2 size={14} color="#DC2626" />
                        <Text className="ml-1 text-xs font-medium text-red-700">영구삭제</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TrashPage;
