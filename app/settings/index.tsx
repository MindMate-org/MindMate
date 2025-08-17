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
  ChevronRight,
} from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Switch } from 'react-native';

import { CustomAlertManager } from '../../src/components/ui/custom-alert';
import { useThemeColors } from '../../src/components/providers/theme-provider';
import { useI18n } from '../../src/hooks/use-i18n';
import { useGlobalStore } from '../../src/store/global-store';

const SettingsPage = () => {
  const router = useRouter();
  const { theme, language, setTheme, setLanguage } = useGlobalStore();
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();

  const handleThemeChange = (value: boolean) => {
    setTheme(value ? 'dark' : 'light');
  };

  const handleLanguageToggle = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  const handleDataExport = () => {
    CustomAlertManager.confirm(
      t.settings.dataExport,
      t.settings.dataExportConfirm,
      () => {
        // TODO: 데이터 내보내기 기능 구현
        CustomAlertManager.info(t.settings.dataExportPending);
      },
    );
  };

  const handleDataClear = () => {
    CustomAlertManager.confirm(
      t.settings.deleteAllData,
      t.settings.deleteAllDataConfirm,
      () => {
        CustomAlertManager.confirm(
          t.settings.finalConfirm,
          t.settings.deleteAllDataFinal,
          async () => {
            try {
              // 데이터베이스 초기화
              const { db } = await import('../../src/hooks/use-initialize-database');

              // 모든 테이블 데이터 삭제
              await db.runAsync('DELETE FROM diaries');
              await db.runAsync('DELETE FROM media');
              await db.runAsync('DELETE FROM schedules');
              await db.runAsync('DELETE FROM routines');
              await db.runAsync('DELETE FROM subtasks');
              await db.runAsync('DELETE FROM address_book');

              CustomAlertManager.success(t.settings.deleteAllDataSuccess);
            } catch (error) {
              console.error('데이터 초기화 실패:', error);
              CustomAlertManager.error(t.settings.deleteAllDataError);
            }
          },
        );
      },
    );
  };

  const handleAbout = () => {
    CustomAlertManager.info(
      'MindMate 정보\n\nVersion 1.0.0\n\n일정, 루틴, 일기, 연락처, 검색을 통합 관리하는 개인 생산성 앱입니다.',
    );
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    danger = false,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: themeColors.surface,
        padding: 16,
        borderBottomWidth: danger ? 0 : 1,
        borderBottomColor: themeColors.border,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{ marginRight: 16 }}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '500',
          color: danger ? themeColors.error : themeColors.text,
        }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{
            color: themeColors.textSecondary,
            marginTop: 4,
            fontSize: 14,
          }}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement || <ChevronRight size={20} color={themeColors.textMuted} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? themeColors.background : '#F0F3FF' }}>
      {/* 헤더 */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: themeColors.surface, 
        paddingHorizontal: 16, 
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ArrowLeft size={24} color={themeColors.primary} />
          <Text style={{ 
            marginLeft: 8, 
            fontSize: 18, 
            fontWeight: '600', 
            color: themeColors.text 
          }}>{t.settings.title}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16, paddingBottom: 40 }}>
          {/* 계정 섹션 */}
          <View style={{ marginTop: 24 }}>
            <Text style={{
              color: themeColors.textSecondary,
              marginBottom: 12,
              paddingHorizontal: 16,
              fontSize: 14,
              fontWeight: '500'
            }}>{t.settings.account}</Text>
            <View style={{
              borderRadius: 12,
              backgroundColor: themeColors.surface,
              shadowColor: themeColors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
              <SettingItem
                icon={<User size={24} color={themeColors.primary} />}
                title={t.settings.profile}
                subtitle={t.settings.personalInfo}
                onPress={() => router.push('/address-book')}
              />
            </View>
          </View>

          {/* 환경설정 섹션 */}
          <View className="mt-6">
            <Text className="text-gray-600 mb-3 px-4 text-sm font-medium">환경설정</Text>
            <View className="overflow-hidden rounded-xl bg-white shadow-sm">
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
                title={t.settings.notifications}
                subtitle={t.settings.notificationSubtitle}
                onPress={() => {
                  CustomAlertManager.info(t.settings.notificationsPending);
                }}
              />
            </View>
          </View>

          {/* 데이터 섹션 */}
          <View className="mt-6">
            <Text className="text-gray-600 mb-3 px-4 text-sm font-medium">데이터</Text>
            <View className="overflow-hidden rounded-xl bg-white shadow-sm">
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
            <Text className="text-gray-600 mb-3 px-4 text-sm font-medium">지원</Text>
            <View className="overflow-hidden rounded-xl bg-white shadow-sm">
              <SettingItem
                icon={<Shield size={24} color="#576BCD" />}
                title="개인정보 처리방침"
                onPress={() => {
                  CustomAlertManager.info('개인정보 처리방침 페이지가 준비 중입니다.');
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
          <View className="mb-8 mt-6">
            <Text className="text-gray-600 mb-3 px-4 text-sm font-medium">위험</Text>
            <View className="overflow-hidden rounded-xl bg-white shadow-sm">
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
