import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  BackHandler,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import { useThemeColors } from '../../src/components/providers/theme-provider';
import CheckBox from '../../src/components/ui/checkbox';
import { CustomAlertManager } from '../../src/components/ui/custom-alert';
import FormInput from '../../src/components/ui/form-input';
import MediaPicker from '../../src/components/ui/media-picker';
import { useMediaPicker } from '../../src/features/diary/hooks/use-media-picker';
import RepeatInfoModal from '../../src/features/routine/components/repeat-info-modal';
import { useAlarm } from '../../src/features/routine/hooks/use-alarm';
import {
  useCreateRoutine,
  useUpdateRoutine,
} from '../../src/features/routine/hooks/use-routine-mutation';
import { useRoutineDetailQuery } from '../../src/features/routine/hooks/use-routine-query';
import {
  CreateRoutinePayload,
  UpdateRoutinePayload,
  RepeatCycleType,
} from '../../src/features/routine/types';
import { getLocalizedRepeatCycle } from '../../src/features/routine/utils';
import { useI18n } from '../../src/hooks/use-i18n';

const RoutineDetail = () => {
  const { id, startDate } = useLocalSearchParams();
  const router = useRouter();
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
  const isEdit = id !== 'new';

  // 폼 상태 관리
  const { setValue, watch } = useForm<{ media: any[] }>({
    defaultValues: {
      media: [],
    },
  });

  const watchedMedia = watch('media');

  // 상태 관리
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subTasks, setSubTasks] = useState(['']);
  const [repeatInfo, setRepeatInfo] = useState<RepeatCycleType>('매일');
  const [alarmTime, setAlarmTime] = useState(new Date());
  const [showRepeatInfo, setShowRepeatInfo] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [deadline, setDeadline] = useState<string>(new Date().toISOString().slice(0, 10));
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [duration, setDuration] = useState<string>('00:00');
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [isAlarmEnabled, setIsAlarmEnabled] = useState(false);
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(true);
  const [showAlarmTimePicker, setShowAlarmTimePicker] = useState(false);
  const [showRepeatInput, setShowRepeatInput] = useState(false);
  const [tempRepeatInfo, setTempRepeatInfo] = useState<string>('');
  // 추가: 알림 설정 (기본 꺼짐)
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  // 루틴 조회 훅 (수정 모드일 때만)
  const { routine, isLoading, error } = useRoutineDetailQuery(isEdit ? (id as string) : null);

  // 루틴 생성/수정 훅
  const { createRoutine, isLoading: isCreating } = useCreateRoutine();
  const { updateRoutine, isLoading: isUpdating } = useUpdateRoutine();

  // 미디어 선택 훅
  const { handleImagePicker, uploadState: mediaUploadState } = useMediaPicker(
    watchedMedia,
    setValue,
  );

  // 알람 훅 (새로운 시스템)
  const { scheduleRoutineAlarm, cancelRoutineAlarm, initializeAlarms } = useAlarm();

  // 알람 설정 함수 (새로운 시스템)
  const setupAlarm = async (routineData: any) => {
    if (!routineData.alarmTime) {
      console.log('⚠️ 알림 시간이 설정되지 않음');
      return;
    }

    try {
      // 기존 알림 먼저 취소 (중복 방지)
      if (routineData.id) {
        await cancelRoutineAlarm(routineData.id.toString());
      }

      // 새로운 알림 설정
      const success = await scheduleRoutineAlarm(routineData);

      if (success) {
        console.log(`✅ 루틴 알림 설정 성공: ${routineData.name}`);
      } else {
        console.error(`❌ 루틴 알림 설정 실패: ${routineData.name}`);
      }
    } catch (error) {
      console.error('❌ 알람 설정 중 오류:', error);
    }
  };

  // 기존 루틴 데이터 로드 (수정 모드)
  useEffect(() => {
    if (routine && isEdit) {
      setTitle(routine.name);
      setDescription(routine.details || '');
      setSubTasks(routine.subTasks.map((task) => task.title));
      setRepeatInfo(routine.repeatCycle);

      // 반복 설정 상태 업데이트
      setIsRepeatEnabled(routine.repeatCycle !== '없음');

      // 알람 설정 상태 업데이트
      if (routine.alarmTime) {
        const [hours, minutes] = routine.alarmTime.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        setAlarmTime(date);
        setIsAlarmEnabled(true);
      } else {
        setIsAlarmEnabled(false);
      }

      if (routine.imageUrl) {
        setValue('media', [{ uri: routine.imageUrl, type: 'image' }]);
      }
      if (routine.deadline) setDeadline(routine.deadline);
      setDuration('00:00');
    }
  }, [routine, isEdit]);

  // 하위 작업 추가
  const addSubTask = () => {
    setSubTasks([...subTasks, '']);
  };

  // 하위 작업 삭제
  const removeSubTask = (index: number) => {
    if (subTasks.length > 1) {
      setSubTasks(subTasks.filter((_, i) => i !== index));
    }
  };

  // 알림 설정 핸들러
  const handleNotificationSettings = async () => {
    return new Promise<void>((resolve) => {
      CustomAlertManager.alert(
        t.locale.startsWith('en') ? 'Routine Settings' : '루틴 설정',
        t.locale.startsWith('en') ? 'Choose an option:' : '옵션을 선택하세요:',
        [
          {
            text: t.locale.startsWith('en') ? '⏰ Alarm Time' : '⏰ 알림 시간',
            onPress: () => {
              setShowAlarmTimePicker(true);
              resolve();
            },
          },
          {
            text: notificationEnabled
              ? t.locale.startsWith('en')
                ? '🔕 Turn Off'
                : '🔕 알림 끄기'
              : t.locale.startsWith('en')
                ? '🔔 Turn On'
                : '🔔 알림 켜기',
            onPress: () => {
              setNotificationEnabled(!notificationEnabled);
              setIsAlarmEnabled(!notificationEnabled);
              resolve();
            },
          },
          {
            text: t.locale.startsWith('en') ? 'Cancel' : '취소',
            style: 'cancel',
            onPress: () => resolve(),
          },
        ],
      );
    });
  };

  // 하위 작업 업데이트
  const updateSubTask = (index: number, value: string) => {
    const newSubTasks = [...subTasks];
    newSubTasks[index] = value;
    setSubTasks(newSubTasks);
  };

  // 루틴 저장/수정
  const handleSave = async () => {
    // 유효성 검사
    if (!title.trim()) {
      CustomAlertManager.error(t.routine.routineNameRequired);
      return;
    }

    if (subTasks.length === 0 || subTasks.every((task) => !task.trim())) {
      CustomAlertManager.error(t.routine.subTaskRequired);
      return;
    }

    // 시간 포맷팅
    const timeString = isAlarmEnabled
      ? `${alarmTime.getHours().toString().padStart(2, '0')}:${alarmTime.getMinutes().toString().padStart(2, '0')}`
      : undefined;

    // 하위 작업 데이터 준비
    const subTasksData = subTasks
      .filter((task) => task.trim())
      .map((task, index) => ({
        title: task.trim(),
        order: index + 1,
      }));

    // 이미지 URL 가져오기
    const imageUrl = watchedMedia.length > 0 ? watchedMedia[0].uri : undefined;

    if (isEdit) {
      // 수정 모드
      const updatePayload: UpdateRoutinePayload = {
        id: id as string,
        name: title.trim(),
        details: description.trim() || undefined,
        repeatCycle: isRepeatEnabled ? repeatInfo : ('없음' as RepeatCycleType),
        alarmTime: timeString,
        imageUrl: imageUrl || undefined,
        subTasks: subTasksData,
        deadline,
      };

      const result = await updateRoutine(updatePayload);
      if (result) {
        // 알람 설정
        const routineData = {
          id: id as string,
          name: title.trim(),
          details: description.trim() || undefined,
          repeatCycle: isRepeatEnabled ? repeatInfo : ('없음' as RepeatCycleType),
          alarmTime: timeString,
          imageUrl: imageUrl || undefined,
          subTasks: subTasksData,
          deadline,
          createdAt: routine?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setupAlarm(routineData);

        await CustomAlertManager.success(t.routine.routineUpdated);
        router.replace('/(tabs)/routine');
      }
    } else {
      const now = new Date();
      const createPayload: CreateRoutinePayload = {
        name: title.trim(),
        details: description.trim() || undefined,
        repeatCycle: isRepeatEnabled ? repeatInfo : ('없음' as RepeatCycleType),
        alarmTime: timeString,
        imageUrl: imageUrl || undefined,
        subTasks: subTasksData,
        startDate: startDate as string, // 시작 날짜 추가
        deadline,
        createdAt: startDate as string, // createdAt을 명시적으로 저장
      };

      const result = await createRoutine(createPayload);
      if (result) {
        // 알람 설정
        const routineData = {
          id: result.id,
          name: title.trim(),
          details: description.trim() || undefined,
          repeatCycle: isRepeatEnabled ? repeatInfo : ('없음' as RepeatCycleType),
          alarmTime: timeString,
          imageUrl: imageUrl || undefined,
          subTasks: subTasksData,
          deadline,
          createdAt: startDate as string,
          updatedAt: new Date().toISOString(),
        };

        await setupAlarm(routineData);

        await CustomAlertManager.success(t.routine.routineCreated);
        router.replace('/(tabs)/routine');
      }
    }
  };

  // 뒤로가기 처리
  const handleCancel = async () => {
    const confirmed = await CustomAlertManager.confirm(
      t.locale.startsWith('en') ? 'Confirm' : '확인',
      t.locale.startsWith('en') ? 'Do you want to cancel writing?' : '작성을 취소하시겠습니까?',
    );
    if (confirmed) {
      router.back();
    }
  };

  // 안드로이드 하드웨어 뒤로가기 버튼 처리
  const handleBackPress = useCallback(() => {
    handleCancel();
    return true;
  }, []);

  // 화면이 포커스될 때 BackHandler 등록/해제
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => subscription.remove();
    }, [handleBackPress]),
  );

  // 로딩 상태
  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: themeColors.background,
        }}
      >
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text
          style={{
            color: themeColors.textSecondary,
            marginTop: 16,
          }}
        >
          {t.routine.loadingRoutine}
        </Text>
      </SafeAreaView>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: themeColors.background,
          paddingHorizontal: 16,
        }}
      >
        <Text
          style={{
            marginBottom: 16,
            textAlign: 'center',
            color: themeColors.error,
          }}
        >
          {error}
        </Text>
        <TouchableOpacity
          style={{
            borderRadius: 8,
            backgroundColor: themeColors.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
          onPress={() => router.back()}
        >
          <Text style={{ color: themeColors.primaryText }}>{t.routine.goBack}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isSaving = isCreating || isUpdating || mediaUploadState.isUploading;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      {/* 헤더 */}
      <View
        style={{
          paddingTop: 40, // 상태바 아래 여백 증가 (32 + 8)
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          backgroundColor: themeColors.surface,
          paddingHorizontal: 16,
          paddingVertical: 16,
          shadowColor: themeColors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View
          style={{
            marginTop: 0,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <TouchableOpacity
            onPress={handleCancel}
            style={{ position: 'absolute', left: 0 }}
            disabled={isSaving}
          >
            <Ionicons name="arrow-back" size={24} color={themeColors.primary} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: themeColors.primary,
            }}
          >
            {isEdit ? t.routine.edit : t.routine.create}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{
          flex: 1,
          backgroundColor: themeColors.surface,
          paddingHorizontal: 16,
        }}
      >
        <View style={{ paddingVertical: 16 }}>
          {/* 제목 */}
          <FormInput
            value={title}
            onChangeText={setTitle}
            label={t.routine.routineName}
            placeholder={t.routine.enterRoutineName}
            required
            className="mb-6"
          />

          {/* 설명 */}
          <FormInput
            value={description}
            onChangeText={setDescription}
            label={t.routine.description}
            placeholder={t.routine.enterDescription}
            multiline
            height={80}
            className="mb-6"
          />

          {/* 하위 작업 */}
          <Text
            style={{
              marginBottom: 8,
              fontSize: 16,
              fontWeight: 'bold',
              color: themeColors.primary,
            }}
          >
            {t.routine.subTasks}
          </Text>
          {subTasks.map((task, index) => (
            <View
              key={index}
              style={{
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <TextInput
                value={task}
                onChangeText={(text) => updateSubTask(index, text)}
                placeholder={t.routine.subTaskInput}
                style={{
                  marginRight: 8,
                  flex: 1,
                  borderRadius: 12,
                  backgroundColor: themeColors.backgroundSecondary,
                  borderWidth: 1,
                  borderColor: themeColors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: themeColors.text,
                  shadowColor: themeColors.shadow,
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: isDark ? 0.2 : 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
                placeholderTextColor={themeColors.textSecondary}
              />
              {subTasks.length > 1 && (
                <TouchableOpacity onPress={() => removeSubTask(index)}>
                  <Ionicons name="remove-circle-outline" size={20} color={themeColors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity
            onPress={addSubTask}
            style={{
              marginBottom: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: themeColors.border,
              backgroundColor: themeColors.surface,
              paddingHorizontal: 16,
              paddingVertical: 12,
              shadowColor: themeColors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isDark ? 0.2 : 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: 16,
                color: themeColors.primary,
              }}
            >
              {t.routine.addNewSubTask}
            </Text>
          </TouchableOpacity>

          {/* 사진 */}
          <MediaPicker
            mediaList={watchedMedia.map((media, index) => ({
              uri: media.uri,
              type: media.type,
              id: media.id || index.toString(),
            }))}
            onAddMedia={handleImagePicker}
            onRemoveMedia={(idx) => {
              const newMedia = watchedMedia.filter((_, i) => i !== idx);
              setValue('media', newMedia);
            }}
            maxCount={1}
            label={t.routine.photoAdd}
            isLoading={mediaUploadState.isUploading}
            className="mb-6"
          />

          {/* 옵션 영역 */}
          <View
            style={{
              marginTop: 16,
              marginBottom: 24,
              borderRadius: 12,
              backgroundColor: themeColors.backgroundSecondary,
              paddingHorizontal: 16,
              paddingVertical: 16,
            }}
          >
            {/* 반복 */}
            <View
              style={{
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons
                name="time-outline"
                size={18}
                color={themeColors.primary}
                style={{ marginRight: 8 }}
              />
              <View
                style={{ flexDirection: 'row', alignItems: 'center', width: 80, marginRight: 16 }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: themeColors.primary,
                    marginRight: 4,
                  }}
                >
                  {t.routine.repeat}
                </Text>
                <TouchableOpacity onPress={() => setShowRepeatInfo(true)}>
                  <Ionicons name="help-circle-outline" size={16} color={themeColors.primary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => {
                  if (isRepeatEnabled) {
                    setTempRepeatInfo(repeatInfo);
                    setShowRepeatInput(true);
                  }
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: themeColors.text,
                  }}
                >
                  {getLocalizedRepeatCycle(repeatInfo, t)}
                </Text>
              </TouchableOpacity>
              <CheckBox
                checked={isRepeatEnabled}
                onChange={() => setIsRepeatEnabled(!isRepeatEnabled)}
                size={16}
              />
            </View>

            {/* 알림 */}
            <View
              style={{
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons
                name="notifications-outline"
                size={18}
                color={themeColors.primary}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: themeColors.primary,
                  width: 80,
                  marginRight: 16,
                }}
              >
                {t.routine.alarm}
              </Text>
              <TouchableOpacity style={{ flex: 1 }} onPress={handleNotificationSettings}>
                <Text
                  style={{
                    fontSize: 16,
                    color: themeColors.text,
                  }}
                >
                  {isAlarmEnabled
                    ? `${alarmTime.getHours().toString().padStart(2, '0')}:${alarmTime.getMinutes().toString().padStart(2, '0')} ${notificationEnabled ? '🔔' : '🔕'}`
                    : t.routine.noAlarm}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNotificationSettings}
                style={{
                  backgroundColor: themeColors.primary + '20',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: themeColors.primary,
                    fontWeight: '500',
                  }}
                >
                  {t.locale.startsWith('en') ? 'Settings' : '설정'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 알림 시간 선택기 */}
            <DateTimePickerModal
              isVisible={showAlarmTimePicker}
              mode="time"
              date={alarmTime}
              onConfirm={(date: Date) => {
                setAlarmTime(date);
                setIsAlarmEnabled(true);
                setNotificationEnabled(true);
                setShowAlarmTimePicker(false);
              }}
              onCancel={() => setShowAlarmTimePicker(false)}
              locale={t.locale.startsWith('en') ? 'en_US' : 'ko_KR'}
            />

            {/* 기한 */}
            <TouchableOpacity
              style={{
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={() => setShowDeadlinePicker(true)}
            >
              <Ionicons
                name="location-outline"
                size={18}
                color={themeColors.primary}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: themeColors.primary,
                  width: 80,
                  marginRight: 16,
                }}
              >
                {t.routine.deadline}
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: themeColors.text,
                }}
              >
                {deadline}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="chevron-forward" size={16} color={themeColors.textSecondary} />
              </View>
            </TouchableOpacity>

            {/* 기간 */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons
                name="happy-outline"
                size={18}
                color={themeColors.primary}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: themeColors.primary,
                  width: 80,
                  marginRight: 16,
                }}
              >
                {t.routine.period}
              </Text>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowDurationPicker(true)}>
                <Text
                  style={{
                    fontSize: 16,
                    color: themeColors.text,
                  }}
                >
                  {duration}
                </Text>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="chevron-forward" size={16} color={themeColors.textSecondary} />
              </View>
            </View>
          </View>

          {/* 기한 선택기 */}
          <DateTimePickerModal
            isVisible={showDeadlinePicker}
            mode="date"
            date={deadline ? new Date(deadline) : new Date()}
            onConfirm={(date: Date) => {
              setDeadline(date.toISOString().slice(0, 10));
              setShowDeadlinePicker(false);
            }}
            onCancel={() => setShowDeadlinePicker(false)}
            locale={t.locale.startsWith('en') ? 'en_US' : 'ko_KR'}
          />

          {/* 기간 선택기 */}
          <DateTimePickerModal
            isVisible={showDurationPicker}
            mode="time"
            date={new Date()} // 기본값은 현재 시간
            onConfirm={(date: Date) => {
              const hours = date.getHours().toString().padStart(2, '0');
              const minutes = date.getMinutes().toString().padStart(2, '0');
              setDuration(`${hours}:${minutes}`);
              setShowDurationPicker(false);
            }}
            onCancel={() => setShowDurationPicker(false)}
            locale={t.locale.startsWith('en') ? 'en_US' : 'ko_KR'}
          />

          {/* 하단 버튼 */}
          <View
            style={{
              marginTop: 8,
              marginBottom: 100, // 네비게이션 바 공간 확보
              flexDirection: 'row',
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={handleSave}
              style={{
                flex: 1,
                borderRadius: 12,
                backgroundColor: themeColors.primary,
                paddingVertical: 12,
              }}
              disabled={isSaving}
            >
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: '500',
                  color: themeColors.primaryText,
                }}
              >
                {isSaving ? t.routine.processing : isEdit ? t.routine.modify : t.routine.register}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCancel}
              style={{
                flex: 1,
                borderRadius: 12,
                backgroundColor: '#FEF3C7',
                paddingVertical: 12,
              }}
              disabled={isSaving}
            >
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: '500',
                  color: '#576BCD',
                }}
              >
                {t.routine.cancel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 반복 설정 안내 모달 */}
      <RepeatInfoModal visible={showRepeatInfo} onClose={() => setShowRepeatInfo(false)} />

      {/* 반복 입력 모달 */}
      {showRepeatInput && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <View
            style={{
              width: 320,
              borderRadius: 12,
              backgroundColor: themeColors.surface,
              padding: 24,
            }}
          >
            <Text
              style={{
                marginBottom: 16,
                textAlign: 'center',
                fontSize: 18,
                fontWeight: 'bold',
                color: themeColors.primary,
              }}
            >
              {t.routine.repeatSetting}
            </Text>
            <TextInput
              value={tempRepeatInfo}
              onChangeText={setTempRepeatInfo}
              placeholder="e.g. Daily, Every Monday, Every 3 days"
              style={{
                marginBottom: 16,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: themeColors.border,
                backgroundColor: themeColors.backgroundSecondary,
                padding: 12,
                fontSize: 16,
                color: themeColors.text,
              }}
              placeholderTextColor={themeColors.textSecondary}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowRepeatInput(false)}
                style={{
                  flex: 1,
                  borderRadius: 8,
                  backgroundColor: themeColors.backgroundSecondary,
                  paddingVertical: 12,
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 16,
                    fontWeight: '500',
                    color: themeColors.textSecondary,
                  }}
                >
                  {t.routine.cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setRepeatInfo(tempRepeatInfo as RepeatCycleType);
                  setShowRepeatInput(false);
                }}
                style={{
                  flex: 1,
                  borderRadius: 8,
                  backgroundColor: themeColors.primary,
                  paddingVertical: 12,
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 16,
                    fontWeight: '500',
                    color: themeColors.primaryText,
                  }}
                >
                  {t.routine.confirm}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default RoutineDetail;
