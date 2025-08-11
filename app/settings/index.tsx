import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Info, 
  Moon, 
  Globe, 
  Trash2, 
  Download,
  ChevronRight 
} from 'lucide-react-native';
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Alert,
  Switch 
} from 'react-native';

import { useGlobalStore } from '../../src/store/global-store';

const SettingsPage = () => {
  const router = useRouter();
  const { 
    theme, 
    language, 
    setTheme, 
    setLanguage 
  } = useGlobalStore();

  const handleThemeChange = (value: boolean) => {
    setTheme(value ? 'dark' : 'light');
  };

  const handleLanguageToggle = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  const handleDataExport = () => {
    Alert.alert(
      '데이터 내보내기',
      '모든 데이터를 백업 파일로 내보내시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '내보내기', 
          onPress: () => {
            // TODO: 데이터 내보내기 기능 구현
            Alert.alert('알림', '데이터 내보내기 기능이 준비 중입니다.');
          }
        }
      ]
    );
  };

  const handleDataClear = () => {
    Alert.alert(
      '데이터 초기화',
      '모든 데이터가 영구적으로 삭제됩니다. 계속하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '최종 확인',
              '정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
              [
                { text: '취소', style: 'cancel' },
                { 
                  text: '삭제', 
                  style: 'destructive',
                  onPress: () => {
                    // TODO: 데이터 초기화 기능 구현
                    Alert.alert('알림', '데이터 초기화 기능이 준비 중입니다.');
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'MindMate 정보',
      'Version 1.0.0\n\n일정, 루틴, 일기, 연락처, 검색을 통합 관리하는 개인 생산성 앱입니다.',
      [{ text: '확인' }]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement,
    danger = false 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
  }) => (
    <TouchableOpacity 
      className={`flex-row items-center bg-white p-4 ${danger ? '' : 'border-b border-gray-100'}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="mr-4">
        {icon}
      </View>
      <View className="flex-1">
        <Text className={`text-base font-medium ${danger ? 'text-red-500' : 'text-gray-800'}`}>
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
        )}
      </View>
      {rightElement || (
        <ChevronRight size={20} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-turquoise">
      {/* 헤더 */}
      <View className="flex-row items-center bg-turquoise px-4 py-3 pt-safe">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
          <ArrowLeft size={24} color="#576bcd" />
          <Text className="ml-2 text-lg font-medium text-paleCobalt">설정</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        <View className="px-4 pb-safe">
          {/* 계정 섹션 */}
          <View className="mt-6">
            <Text className="mb-3 px-4 text-sm font-medium text-gray-600">계정</Text>
            <View className="rounded-xl bg-white shadow-sm overflow-hidden">
              <SettingItem
                icon={<User size={24} color="#576BCD" />}
                title="프로필"
                subtitle="개인 정보 관리"
                onPress={() => router.push('/address-book')}
              />
            </View>
          </View>

          {/* 환경설정 섹션 */}
          <View className="mt-6">
            <Text className="mb-3 px-4 text-sm font-medium text-gray-600">환경설정</Text>
            <View className="rounded-xl bg-white shadow-sm overflow-hidden">
              <SettingItem
                icon={<Moon size={24} color="#576BCD" />}
                title="다크 모드"
                subtitle={theme === 'dark' ? '사용 중' : '사용 안함'}
                rightElement={
                  <Switch
                    value={theme === 'dark'}
                    onValueChange={handleThemeChange}
                    trackColor={{ false: '#f3f4f6', true: '#576BCD' }}
                    thumbColor={theme === 'dark' ? '#ffffff' : '#f3f4f6'}
                  />
                }
              />
              
              <SettingItem
                icon={<Globe size={24} color="#576BCD" />}
                title="언어"
                subtitle={language === 'ko' ? '한국어' : 'English'}
                onPress={handleLanguageToggle}
              />
              
              <SettingItem
                icon={<Bell size={24} color="#576BCD" />}
                title="알림"
                subtitle="푸시 알림 설정"
                onPress={() => {
                  Alert.alert('알림', '알림 설정 기능이 준비 중입니다.');
                }}
              />
            </View>
          </View>

          {/* 데이터 섹션 */}
          <View className="mt-6">
            <Text className="mb-3 px-4 text-sm font-medium text-gray-600">데이터</Text>
            <View className="rounded-xl bg-white shadow-sm overflow-hidden">
              <SettingItem
                icon={<Download size={24} color="#576BCD" />}
                title="데이터 내보내기"
                subtitle="백업 파일 생성"
                onPress={handleDataExport}
              />
            </View>
          </View>

          {/* 지원 섹션 */}
          <View className="mt-6">
            <Text className="mb-3 px-4 text-sm font-medium text-gray-600">지원</Text>
            <View className="rounded-xl bg-white shadow-sm overflow-hidden">
              <SettingItem
                icon={<Shield size={24} color="#576BCD" />}
                title="개인정보 처리방침"
                onPress={() => {
                  Alert.alert('개인정보 처리방침', '개인정보 처리방침 페이지가 준비 중입니다.');
                }}
              />
              
              <SettingItem
                icon={<Info size={24} color="#576BCD" />}
                title="앱 정보"
                onPress={handleAbout}
              />
            </View>
          </View>

          {/* 위험 섹션 */}
          <View className="mt-6 mb-8">
            <Text className="mb-3 px-4 text-sm font-medium text-gray-600">위험</Text>
            <View className="rounded-xl bg-white shadow-sm overflow-hidden">
              <SettingItem
                icon={<Trash2 size={24} color="#ef4444" />}
                title="모든 데이터 삭제"
                subtitle="앱의 모든 데이터가 영구적으로 삭제됩니다"
                onPress={handleDataClear}
                danger
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsPage;