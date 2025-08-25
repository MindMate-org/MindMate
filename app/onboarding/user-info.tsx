import { useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { useThemeColors } from '../../src/components/providers/theme-provider';
import { CustomAlertManager } from '../../src/components/ui/custom-alert';
import { AddressBookService } from '../../src/features/address-book/services';
import { useI18n } from '../../src/hooks/use-i18n';
import { useSetUserName } from '../../src/store/app-store';

/**
 * 온보딩 사용자 정보 입력 화면
 */
const UserInfoScreen = () => {
  const router = useRouter();
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
  const setUserName = useSetUserName();

  const [userInfo, setUserInfo] = useState({
    name: '',
    age: '',
    gender: '',
    phoneNumber: '',
    bloodType: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showBloodTypePicker, setShowBloodTypePicker] = useState(false);

  const genderOptions = t.locale.startsWith('en')
    ? [
        { label: 'Select Gender', value: '' },
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Other', value: 'Other' },
      ]
    : [
        { label: '성별 선택', value: '' },
        { label: '남성', value: '남성' },
        { label: '여성', value: '여성' },
        { label: '기타', value: '기타' },
      ];

  const bloodTypeOptions = [
    { label: t.locale.startsWith('en') ? 'Select Blood Type' : '혈액형 선택', value: '' },
    { label: 'A', value: 'A' },
    { label: 'B', value: 'B' },
    { label: 'AB', value: 'AB' },
    { label: 'O', value: 'O' },
  ];

  // 각 필드별로 개별 콜백 생성하여 리렌더링 최적화
  const handleNameChange = useCallback((value: string) => {
    setUserInfo((prev) => ({ ...prev, name: value }));
  }, []);

  const handleAgeChange = useCallback((value: string) => {
    setUserInfo((prev) => ({ ...prev, age: value }));
  }, []);

  const handlePhoneChange = useCallback((value: string) => {
    setUserInfo((prev) => ({ ...prev, phoneNumber: value }));
  }, []);

  const handleInputChange = useCallback((field: string, value: string) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
  }, []);

  const validateForm = (): boolean => {
    if (!userInfo.name.trim()) {
      CustomAlertManager.error(
        t.locale.startsWith('en') ? 'Please enter your name' : '이름을 입력해주세요',
      );
      return false;
    }

    if (!userInfo.age.trim()) {
      CustomAlertManager.error(
        t.locale.startsWith('en') ? 'Please enter your age' : '나이를 입력해주세요',
      );
      return false;
    }

    const ageNum = parseInt(userInfo.age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
      CustomAlertManager.error(
        t.locale.startsWith('en') ? 'Please enter a valid age' : '올바른 나이를 입력해주세요',
      );
      return false;
    }

    if (!userInfo.gender) {
      CustomAlertManager.error(
        t.locale.startsWith('en') ? 'Please select your gender' : '성별을 선택해주세요',
      );
      return false;
    }

    if (!userInfo.phoneNumber.trim()) {
      CustomAlertManager.error(
        t.locale.startsWith('en') ? 'Please enter your phone number' : '전화번호를 입력해주세요',
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // 주소록에 내 정보 저장
      const contactData = {
        name: userInfo.name,
        phone_number: userInfo.phoneNumber,
        memo: `나이: ${userInfo.age}, 성별: ${userInfo.gender}${userInfo.bloodType ? `, 혈액형: ${userInfo.bloodType}` : ''}`,
        is_me: 1 as const,
        profile_image: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };

      await AddressBookService.fetchCreateContact(contactData);

      // 글로벌 상태에 사용자 이름 저장
      setUserName(userInfo.name);

      CustomAlertManager.success(
        t.locale.startsWith('en') ? 'Welcome to MindMate!' : 'MindMate에 오신 것을 환영합니다!',
      );

      // 메인 앱으로 이동
      router.replace('/');
    } catch (error) {
      console.error('사용자 정보 저장 실패:', error);
      CustomAlertManager.error(
        t.locale.startsWith('en')
          ? 'Failed to save user information'
          : '사용자 정보 저장에 실패했습니다',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    CustomAlertManager.confirm(
      t.locale.startsWith('en') ? 'Skip Setup' : '설정 건너뛰기',
      t.locale.startsWith('en')
        ? 'You can add your information later in Settings. Continue?'
        : '나중에 설정에서 정보를 추가할 수 있습니다. 계속하시겠습니까?',
      async () => {
        try {
          // 임시 사용자 정보 생성 (스킵했다는 것을 표시)
          const tempContactData = {
            name: t.locale.startsWith('en') ? 'User' : '사용자',
            phone_number: '',
            memo: t.locale.startsWith('en')
              ? 'Setup skipped - please update in settings'
              : '설정 건너뛰기 - 설정에서 업데이트하세요',
            is_me: 1 as const,
            profile_image: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          };

          await AddressBookService.fetchCreateContact(tempContactData);

          // 글로벌 상태에 사용자 이름 저장
          setUserName(tempContactData.name);

          // 메인 앱으로 이동
          router.replace('/');
        } catch (error) {
          console.error('임시 사용자 정보 생성 실패:', error);
          // 에러가 발생해도 메인으로 이동 (안전한 처리)
          setUserName(t.locale.startsWith('en') ? 'User' : '사용자');
          router.replace('/');
        }
      },
    );
  };

  const PickerField = ({
    label,
    value,
    onValueChange,
    options,
    isVisible,
    setVisible,
  }: {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    options: { label: string; value: string }[];
    isVisible: boolean;
    setVisible: (visible: boolean) => void;
  }) => {
    const selectedOption = options.find((opt) => opt.value === value);

    return (
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: themeColors.text,
            marginBottom: 8,
          }}
        >
          {label}
        </Text>

        <TouchableOpacity
          onPress={() => setVisible(true)}
          style={{
            backgroundColor: themeColors.surface,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: themeColors.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: selectedOption?.value ? themeColors.text : themeColors.textMuted,
            }}
          >
            {selectedOption?.label || options[0]?.label}
          </Text>
          <ChevronDown size={20} color={themeColors.textSecondary} />
        </TouchableOpacity>

        <Modal
          visible={isVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setVisible(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 20,
            }}
            onPress={() => setVisible(false)}
            activeOpacity={1}
          >
            <View
              style={{
                backgroundColor: themeColors.surface,
                borderRadius: 16,
                paddingVertical: 20,
                minWidth: 250,
                maxWidth: '90%',
                shadowColor: themeColors.shadow,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: isDark ? 0.4 : 0.2,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: themeColors.text,
                  textAlign: 'center',
                  marginBottom: 20,
                  paddingHorizontal: 20,
                }}
              >
                {label}
              </Text>

              {options.slice(1).map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    onValueChange(option.value);
                    setVisible(false);
                  }}
                  style={{
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    borderBottomWidth: option !== options[options.length - 1] ? 1 : 0,
                    borderBottomColor: themeColors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: value === option.value ? themeColors.primary : themeColors.text,
                      fontWeight: value === option.value ? '600' : '400',
                      textAlign: 'center',
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={Platform.OS === 'ios'}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={false}
        >
          <View
            style={{
              flex: 1,
              paddingHorizontal: 24,
              paddingTop: 40,
              paddingBottom: 40,
            }}
          >
            {/* 헤더 */}
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: 'bold',
                  color: themeColors.text,
                  textAlign: 'center',
                  marginBottom: 8,
                }}
              >
                {t.locale.startsWith('en') ? 'Tell us about yourself' : '당신에 대해 알려주세요'}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: themeColors.textSecondary,
                  textAlign: 'center',
                  lineHeight: 22,
                }}
              >
                {t.locale.startsWith('en')
                  ? 'This information will help us personalize your experience'
                  : '이 정보는 개인화된 경험을 제공하는데 도움이 됩니다'}
              </Text>
            </View>

            {/* 입력 폼 */}
            <View style={{ flex: 1, minHeight: 400 }}>
              <InputField
                label={t.locale.startsWith('en') ? 'Name *' : '이름 *'}
                value={userInfo.name}
                onChangeText={handleNameChange}
                placeholder={t.locale.startsWith('en') ? 'Enter your name' : '이름을 입력하세요'}
                themeColors={themeColors}
              />

              <InputField
                label={t.locale.startsWith('en') ? 'Age *' : '나이 *'}
                value={userInfo.age}
                onChangeText={handleAgeChange}
                placeholder={t.locale.startsWith('en') ? 'Enter your age' : '나이를 입력하세요'}
                keyboardType="numeric"
                themeColors={themeColors}
              />

              <PickerField
                label={t.locale.startsWith('en') ? 'Gender *' : '성별 *'}
                value={userInfo.gender}
                onValueChange={(value) => handleInputChange('gender', value)}
                options={genderOptions}
                isVisible={showGenderPicker}
                setVisible={setShowGenderPicker}
              />

              <InputField
                label={t.locale.startsWith('en') ? 'Phone Number *' : '전화번호 *'}
                value={userInfo.phoneNumber}
                onChangeText={handlePhoneChange}
                placeholder={
                  t.locale.startsWith('en') ? 'Enter your phone number' : '전화번호를 입력하세요'
                }
                keyboardType="phone-pad"
                themeColors={themeColors}
              />

              <PickerField
                label={t.locale.startsWith('en') ? 'Blood Type (Optional)' : '혈액형 (선택사항)'}
                value={userInfo.bloodType}
                onValueChange={(value) => handleInputChange('bloodType', value)}
                options={bloodTypeOptions}
                isVisible={showBloodTypePicker}
                setVisible={setShowBloodTypePicker}
              />
            </View>

            {/* 버튼들 */}
            <View style={{ gap: 12, paddingBottom: 40 }}>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                style={{
                  backgroundColor: themeColors.primary,
                  borderRadius: 16,
                  paddingVertical: 18,
                  alignItems: 'center',
                  opacity: isLoading ? 0.7 : 1,
                  marginBottom: 8, // 갤럭시 네비게이션 바와의 간격 확보
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: themeColors.primaryText,
                  }}
                >
                  {isLoading
                    ? t.locale.startsWith('en')
                      ? 'Saving...'
                      : '저장 중...'
                    : t.locale.startsWith('en')
                      ? 'Complete Setup'
                      : '설정 완료'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSkip}
                disabled={isLoading}
                style={{
                  backgroundColor: '#FEF3C7', // 커스텀 알러트 취소 버튼과 동일한 배경색
                  borderRadius: 16,
                  paddingVertical: 18,
                  alignItems: 'center',
                  marginBottom: 20, // 갤럭시 네비게이션 바와의 간격 확보
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: '#576BCD', // 커스텀 알러트 취소 버튼과 동일한 텍스트 색상 (Colors.paleCobalt)
                  }}
                >
                  {t.locale.startsWith('en') ? 'Skip for now' : '나중에 하기'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// InputField 컴포넌트를 별도로 정의하여 리렌더링 문제 방지
const InputField = React.memo(
  ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    themeColors,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: 'default' | 'numeric' | 'phone-pad';
    themeColors: any;
  }) => {
    const inputRef = React.useRef<TextInput>(null);

    return (
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: themeColors.text,
            marginBottom: 8,
          }}
        >
          {label}
        </Text>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={themeColors.textMuted}
          keyboardType={keyboardType}
          autoCapitalize={keyboardType === 'phone-pad' ? 'none' : 'sentences'}
          autoCorrect={false}
          style={{
            backgroundColor: themeColors.surface,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 16,
            color: themeColors.text,
            borderWidth: 1,
            borderColor: themeColors.border,
            minHeight: 48, // 최소 높이 보장
          }}
        />
      </View>
    );
  },
);

export default UserInfoScreen;
