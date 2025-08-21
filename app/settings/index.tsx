import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Switch } from 'react-native';

import { CustomAlertManager } from '../../src/components/ui/custom-alert';
import PrivacyPolicyModal from '../../src/components/ui/privacy-policy-modal';
import { useThemeColors } from '../../src/components/providers/theme-provider';
import { useI18n } from '../../src/hooks/use-i18n';
import { notificationService } from '../../src/lib/notification-service';
import { useTheme, useLanguage, useSetTheme, useSetLanguage } from '../../src/store/app-store';
import { useDataClear } from './test-data-clear';

const SettingsPage = () => {
  const router = useRouter();
  const theme = useTheme();
  const language = useLanguage();
  const setTheme = useSetTheme();
  const setLanguage = useSetLanguage();
  const { performDataClear } = useDataClear();
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

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
      async () => {
        try {
          // 데이터베이스에서 모든 데이터 가져오기
          const { db } = await import('../../src/hooks/use-initialize-database');

          const [diaries, schedules, routines, contacts, searchItems, media, tags] = await Promise.all([
            db.getAllAsync('SELECT * FROM diaries ORDER BY created_at DESC'),
            db.getAllAsync('SELECT * FROM schedules ORDER BY created_at DESC'),
            db.getAllAsync('SELECT * FROM routines ORDER BY created_at DESC'),
            db.getAllAsync('SELECT * FROM contact ORDER BY name ASC'),
            db.getAllAsync('SELECT * FROM search ORDER BY created_at DESC'),
            db.getAllAsync('SELECT * FROM media ORDER BY created_at DESC'),
            db.getAllAsync('SELECT * FROM tag ORDER BY name ASC'),
          ]);

          const exportData = {
            exportDate: new Date().toISOString(),
            version: '1.0.0',
            data: {
              diaries: diaries || [],
              schedules: schedules || [],
              routines: routines || [],
              contacts: contacts || [],
              searchItems: searchItems || [],
              media: media || [],
              tags: tags || [],
            },
            counts: {
              diaries: diaries?.length || 0,
              schedules: schedules?.length || 0,
              routines: routines?.length || 0,
              contacts: contacts?.length || 0,
              searchItems: searchItems?.length || 0,
              media: media?.length || 0,
              tags: tags?.length || 0,
            }
          };

          // JSON 파일로 내보내기 준비
          const jsonString = JSON.stringify(exportData, null, 2);
          
          try {
            // 파일 시스템을 사용해서 실제 파일 저장
            
            // 파일명 생성 (현재 날짜 포함)
            const now = new Date();
            const dateString = now.toISOString().slice(0, 19).replace(/:/g, '-');
            const fileName = `mindmate-backup-${dateString}.json`;
            
            // 파일 저장 및 공유
            const fileUri = FileSystem.documentDirectory + fileName;
            
            console.log('Saving file to:', fileUri);
            console.log('Data size:', jsonString.length, 'characters');
            
            await FileSystem.writeAsStringAsync(fileUri, jsonString);
            
            // 파일이 실제로 저장되었는지 확인
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            console.log('File saved successfully:', fileInfo);
            
            // 공유 다이얼로그 열기
            if (await Sharing.isAvailableAsync()) {
              console.log('Sharing is available, opening share dialog');
              await Sharing.shareAsync(fileUri, {
                mimeType: 'application/json',
                dialogTitle: t.locale.startsWith('en') ? 'Save MindMate Backup' : 'MindMate 백업 저장',
              });
            } else {
              console.log('Sharing is not available');
              // 공유가 불가능한 경우 다른 방법 제공
              CustomAlertManager.info(
                t.locale.startsWith('en') 
                  ? `File saved successfully!\n\nLocation: ${fileUri}\n\nYou can find this file in your device's file manager.`
                  : `파일이 성공적으로 저장되었습니다!\n\n위치: ${fileUri}\n\n기기의 파일 관리자에서 찾을 수 있습니다.`,
                t.locale.startsWith('en') ? 'File Saved' : '파일 저장됨'
              );
              return; // 여기서 종료하여 중복 메시지 방지
            }
            
            CustomAlertManager.success(
              (t.locale.startsWith('en') 
                ? `Data export completed!\n\nFile: ${fileName}\n\n📍 How to access your backup:\n1. Check your Downloads folder\n2. Look for AirDrop/Files app\n3. Check your cloud storage (Google Drive, iCloud, etc.)\n\nTotal items exported:\n• Diaries: ${exportData.counts.diaries}\n• Schedules: ${exportData.counts.schedules}\n• Routines: ${exportData.counts.routines}\n• Contacts: ${exportData.counts.contacts}\n• Search Items: ${exportData.counts.searchItems}\n• Media Files: ${exportData.counts.media}\n• Tags: ${exportData.counts.tags}`
                : `데이터 내보내기 완료!\n\n파일: ${fileName}\n\n📍 백업 파일 확인 방법:\n1. 다운로드 폴더를 확인하세요\n2. AirDrop/파일 앱을 확인하세요\n3. 클라우드 저장소를 확인하세요 (Google Drive, iCloud 등)\n\n내보낸 항목:\n• 일기: ${exportData.counts.diaries}개\n• 일정: ${exportData.counts.schedules}개\n• 루틴: ${exportData.counts.routines}개\n• 연락처: ${exportData.counts.contacts}개\n• 검색 항목: ${exportData.counts.searchItems}개\n• 미디어 파일: ${exportData.counts.media}개\n• 태그: ${exportData.counts.tags}개`)
            );
          } catch (sharingError) {
            console.warn('파일 공유 실패, 데이터만 준비됨:', sharingError);
            // 공유가 실패해도 데이터는 성공적으로 준비되었음을 알림
            CustomAlertManager.success(
              (t.locale.startsWith('en') 
                ? `Data prepared successfully!\n\nTotal items exported:\n• Diaries: ${exportData.counts.diaries}\n• Schedules: ${exportData.counts.schedules}\n• Routines: ${exportData.counts.routines}\n• Contacts: ${exportData.counts.contacts}\n• Search Items: ${exportData.counts.searchItems}\n• Media Files: ${exportData.counts.media}\n• Tags: ${exportData.counts.tags}`
                : `데이터 준비 완료!\n\n내보낸 항목:\n• 일기: ${exportData.counts.diaries}개\n• 일정: ${exportData.counts.schedules}개\n• 루틴: ${exportData.counts.routines}개\n• 연락처: ${exportData.counts.contacts}개\n• 검색 항목: ${exportData.counts.searchItems}개\n• 미디어 파일: ${exportData.counts.media}개\n• 태그: ${exportData.counts.tags}개`)
            );
            console.log('Exported data:', jsonString);
          }
        } catch (error) {
          console.error('Data export failed:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          CustomAlertManager.error(
            t.locale.startsWith('en') 
              ? `Data export failed.\n\nError: ${errorMessage}`
              : `데이터 내보내기에 실패했습니다.\n\n오류: ${errorMessage}`
          );
        }
      },
    );
  };

  const handleDataClear = () => {
    console.log('=== handleDataClear 호출됨 ===');
    
    CustomAlertManager.confirm(
      '모든 데이터 삭제',
      '정말로 모든 데이터를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.',
      () => {
        console.log('사용자가 삭제 확인함');
        performDataClear();
      }
    );
  };

  const handleNotificationSettings = () => {
    CustomAlertManager.alert(
      t.locale.startsWith('en') ? 'Notification Settings' : '알림 설정',
      t.locale.startsWith('en') ? 'Choose notification type:' : '알림 유형을 선택하세요:',
      [
        {
          text: t.locale.startsWith('en') ? '📅 Schedule Notifications' : '📅 일정 알림',
          onPress: () => {
            CustomAlertManager.confirm(
              t.locale.startsWith('en') ? 'Schedule Notifications' : '일정 알림',
              t.locale.startsWith('en') 
                ? 'Schedule notifications are managed individually when creating or editing schedules.\n\nWould you like to go to the Schedule page?' 
                : '일정 알림은 일정 생성 또는 편집 시 개별적으로 관리됩니다.\n\n일정 페이지로 이동하시겠습니까?',
              () => {
                router.push('/(tabs)/schedule');
              }
            );
          }
        },
        {
          text: t.locale.startsWith('en') ? '🔄 Routine Notifications' : '🔄 루틴 알림',
          onPress: () => {
            CustomAlertManager.confirm(
              t.locale.startsWith('en') ? 'Routine Notifications' : '루틴 알림',
              t.locale.startsWith('en') 
                ? 'Routine notifications are managed individually when creating or editing routines.\n\nWould you like to go to the Routine page?' 
                : '루틴 알림은 루틴 생성 또는 편집 시 개별적으로 관리됩니다.\n\n루틴 페이지로 이동하시겠습니까?',
              () => {
                router.push('/(tabs)/routine');
              }
            );
          }
        },
        {
          text: t.locale.startsWith('en') ? '⚙️ System Settings' : '⚙️ 시스템 설정',
          onPress: async () => {
            try {
              // Expo Notifications를 직접 사용하여 권한 확인
              const { status: existingStatus } = await Notifications.getPermissionsAsync();
              
              if (existingStatus === 'granted') {
                CustomAlertManager.success(
                  t.locale.startsWith('en') 
                    ? 'Notification permissions are enabled.\n\nYou can disable notifications in your device settings.' 
                    : '알림 권한이 활성화되어 있습니다.\n\n기기 설정에서 알림을 비활성화할 수 있습니다.'
                );
              } else {
                CustomAlertManager.confirm(
                  t.locale.startsWith('en') ? 'Enable Notifications' : '알림 활성화',
                  t.locale.startsWith('en') 
                    ? 'Notifications are disabled. Would you like to enable them?' 
                    : '알림이 비활성화되어 있습니다. 활성화하시겠습니까?',
                  async () => {
                    try {
                      const { status } = await Notifications.requestPermissionsAsync();
                      if (status === 'granted') {
                        // notification service 초기화 시도
                        const initSuccess = await notificationService.initialize();
                        CustomAlertManager.success(
                          t.locale.startsWith('en') 
                            ? `Notifications enabled successfully!${initSuccess ? '' : '\n\nNote: Some notification features may need app restart.'}` 
                            : `알림이 성공적으로 활성화되었습니다!${initSuccess ? '' : '\n\n참고: 일부 알림 기능은 앱 재시작이 필요할 수 있습니다.'}`
                        );
                      } else {
                        CustomAlertManager.error(
                          t.locale.startsWith('en') ? 'Failed to enable notifications. Please check your device settings.' : '알림 활성화에 실패했습니다. 기기 설정을 확인해주세요.'
                        );
                      }
                    } catch (permissionError) {
                      console.error('Permission request error:', permissionError);
                      CustomAlertManager.error(
                        t.locale.startsWith('en') ? 'Failed to request notification permissions.' : '알림 권한 요청에 실패했습니다.'
                      );
                    }
                  }
                );
              }
            } catch (error) {
              console.error('Notification settings error:', error);
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              CustomAlertManager.error(
                t.locale.startsWith('en') 
                  ? `Error checking notification settings.\n\nDetails: ${errorMessage}` 
                  : `알림 설정 확인 중 오류가 발생했습니다.\n\n세부 정보: ${errorMessage}`,
                t.locale.startsWith('en') ? 'Error' : '오류'
              );
            }
          }
        },
        {
          text: t.locale.startsWith('en') ? 'Cancel' : '취소',
          style: 'cancel'
        }
      ]
    );
  };

  const handleAbout = () => {
    CustomAlertManager.info(
      t.settings.appInfo + '\n\nVersion 1.0.0\n\n' + (t.locale.startsWith('en') 
        ? 'A personal productivity app that integrates schedule, routine, diary, contacts, and search management.'
        : '일정, 루틴, 일기, 연락처, 검색을 통합 관리하는 개인 생산성 앱입니다.'),
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
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      {/* 헤더 */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: themeColors.surface, 
        paddingHorizontal: 16, 
        paddingVertical: 12,
        marginTop: 32,
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
                onPress={async () => {
                  try {
                    // 내 정보가 있는지 확인
                    const { AddressBookService } = await import('../../src/features/address-book/services');
                    const myContact = await AddressBookService.fetchGetMyContact();
                    
                    if (myContact) {
                      // 기존 내 정보가 있으면 편집 페이지로
                      router.push(`/address-book/edit/${myContact.id}`);
                    } else {
                      // 내 정보가 없으면 새로 생성
                      router.push('/address-book/edit/new?isMyInfo=true');
                    }
                  } catch (error) {
                    console.error('Failed to check my contact:', error);
                    // 오류시 일반 주소록 페이지로 이동
                    router.push('/address-book');
                  }
                }}
              />
            </View>
          </View>

          {/* 환경설정 섹션 */}
          <View style={{ marginTop: 24 }}>
            <Text style={{
              color: themeColors.textSecondary,
              marginBottom: 12,
              paddingHorizontal: 16,
              fontSize: 14,
              fontWeight: '500'
            }}>{t.settings.preferences}</Text>
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
                icon={<Moon size={24} color={themeColors.primary} />}
                title={t.settings.darkMode}
                subtitle={theme === 'dark' ? t.settings.enabled : t.settings.disabled}
                rightElement={
                  <Switch
                    value={theme === 'dark'}
                    onValueChange={handleThemeChange}
                    trackColor={{ false: themeColors.border, true: themeColors.primary }}
                    thumbColor={theme === 'dark' ? themeColors.primaryText : themeColors.surface}
                  />
                }
              />

              <SettingItem
                icon={<Globe size={24} color={themeColors.primary} />}
                title={t.settings.language}
                subtitle={language === 'ko' ? '한국어' : 'English'}
                onPress={handleLanguageToggle}
              />

              <SettingItem
                icon={<Bell size={24} color={themeColors.primary} />}
                title={t.settings.notifications}
                subtitle={t.settings.notificationSubtitle}
                onPress={() => {
                  handleNotificationSettings();
                }}
              />
            </View>
          </View>

          {/* 데이터 섹션 */}
          <View style={{ marginTop: 24 }}>
            <Text style={{
              color: themeColors.textSecondary,
              marginBottom: 12,
              paddingHorizontal: 16,
              fontSize: 14,
              fontWeight: '500'
            }}>{t.settings.data}</Text>
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
                icon={<Download size={24} color={themeColors.primary} />}
                title={t.settings.dataExport}
                subtitle={t.settings.dataBackup}
                onPress={handleDataExport}
              />
            </View>
          </View>

          {/* 지원 섹션 */}
          <View style={{ marginTop: 24 }}>
            <Text style={{
              color: themeColors.textSecondary,
              marginBottom: 12,
              paddingHorizontal: 16,
              fontSize: 14,
              fontWeight: '500'
            }}>{t.settings.support}</Text>
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
                icon={<Shield size={24} color={themeColors.primary} />}
                title={t.settings.privacy}
                onPress={() => setShowPrivacyModal(true)}
              />

              <SettingItem
                icon={<Info size={24} color={themeColors.primary} />}
                title={t.settings.appInfo}
                onPress={handleAbout}
              />
            </View>
          </View>

          {/* 위험 섹션 */}
          <View style={{ marginBottom: 32, marginTop: 24 }}>
            <Text style={{
              color: themeColors.textSecondary,
              marginBottom: 12,
              paddingHorizontal: 16,
              fontSize: 14,
              fontWeight: '500'
            }}>{t.settings.danger}</Text>
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
                icon={<Trash2 size={24} color={themeColors.error} />}
                title={t.settings.deleteAllData}
                subtitle={t.settings.deleteAllDataSubtitle}
                onPress={handleDataClear}
                danger
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 개인정보 처리방침 모달 */}
      <PrivacyPolicyModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </SafeAreaView>
  );
};

export default SettingsPage;
