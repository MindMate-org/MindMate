import { useLocalSearchParams, useRouter } from 'expo-router';
import { CircleCheckBig, ArrowLeft } from 'lucide-react-native';
import { useState, useCallback } from 'react';
import { Text, TouchableOpacity, View, SafeAreaView, ScrollView, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { useThemeColors } from '../../../src/components/providers/theme-provider';
import { useI18n } from '../../../src/hooks/use-i18n';

import ContactDetailGroupSectionList from '../../../src/features/address-book/components/contact-detail-group-section-list';
import EditContactDetailGroupModal from '../../../src/features/address-book/components/edit-contact-detail-group-modal';
import FormEditContact from '../../../src/features/address-book/components/form-edit-contact';
import { CustomAlertManager } from '../../../src/components/ui/custom-alert';

const Edit = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();
  const { theme: themeColors, isDark } = useThemeColors();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

  const handleCancel = useCallback(async () => {
    const confirmed = await CustomAlertManager.confirm(
      t.locale.startsWith('en') ? 'Confirm' : '확인',
      t.locale.startsWith('en') ? 'Do you want to cancel writing?' : '작성을 취소하시겠습니까?',
    );
    if (confirmed) {
      router.back();
    }
  }, [t.locale, router]);

  // 안드로이드 하드웨어 뒤로가기 버튼 처리
  const handleBackPress = useCallback(() => {
    handleCancel();
    return true; // 기본 뒤로가기 동작 방지
  }, [handleCancel]);

  // 화면이 포커스될 때 BackHandler 등록/해제
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => subscription.remove();
    }, [handleBackPress]),
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: themeColors.background,
      }}
    >
      {/* 헤더 */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: themeColors.background,
          paddingHorizontal: 16,
          paddingVertical: 12,
          marginTop: 32,
        }}
      >
        <TouchableOpacity
          onPress={handleCancel}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <ArrowLeft size={24} color={themeColors.primary} />
          <Text
            style={{
              marginLeft: 8,
              fontSize: 18,
              fontWeight: '500',
              color: themeColors.primary,
            }}
          >
            {t.addressBook.editContact}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
          <FormEditContact id={id} />

          {/* 기존 연락처 편집 시에만 그룹 관련 기능 표시 */}
          {id !== 'new' && (
            <>
              <ContactDetailGroupSectionList id={id} isModalVisible={isModalVisible} />
              <View style={{ marginVertical: 24, alignItems: 'center' }}>
                <AddContactDetailGroupButton onPress={() => setIsModalVisible(true)} />
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {isModalVisible && id !== 'new' && (
        <EditContactDetailGroupModal
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          id={id}
          refetch={() => {}}
        />
      )}
    </SafeAreaView>
  );
};

const AddContactDetailGroupButton = ({ onPress }: { onPress: () => void }) => {
  const { t } = useI18n();
  const { theme: themeColors } = useThemeColors();

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: themeColors.primary,
        backgroundColor: themeColors.surface,
        paddingHorizontal: 24,
        paddingVertical: 12,
      }}
      onPress={onPress}
    >
      <CircleCheckBig size={20} color={themeColors.primary} />
      <Text
        style={{
          marginLeft: 8,
          fontSize: 14,
          fontWeight: '500',
          color: themeColors.primary,
        }}
      >
        {t.addressBook.addContactGroup}
      </Text>
    </TouchableOpacity>
  );
};

export default Edit;
