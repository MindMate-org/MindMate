import { X } from 'lucide-react-native';
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '../../hooks/use-i18n';
import { useThemeColors } from '../providers/theme-provider';

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ visible, onClose }) => {
  const { theme: themeColors } = useThemeColors();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const isEnglish = t.locale.startsWith('en');

  const privacyContent = isEnglish
    ? {
        title: 'Privacy Policy',
        lastUpdated: 'Last Updated: December 2024',
        sections: [
          {
            title: '1. Information We Collect',
            content: `MIND MATE is a local-first application that prioritizes your privacy. All your personal data including diaries, schedules, routines, contacts, and search items are stored locally on your device.

• Personal information you enter (name, age, contact details)
• Diary entries and mood data
• Schedule and routine information
• Contact information you add
• Search and item data
• Photos and media you attach

All this information remains on your device and is not transmitted to external servers.`,
          },
          {
            title: '2. How We Use Your Information',
            content: `Your information is used exclusively to provide the app's functionality:

• Display and organize your diary entries
• Manage your schedules and routines
• Store your contacts and relationships
• Enable search functionality
• Provide data export capabilities

We do not access, analyze, or use your personal data for any other purposes.`,
          },
          {
            title: '3. Data Storage and Security',
            content: `• All data is stored locally on your device using SQLite database
• No data is transmitted to external servers or cloud services
• You have full control over your data
• Data export is available in JSON format for backup purposes
• You can delete all data at any time from the settings menu`,
          },
          {
            title: '4. Permissions',
            content: `MIND MATE may request the following permissions:

• Camera and Photo Library: To attach photos to diary entries and profiles
• Notifications: To send you reminders for schedules and routines
• File System: To export and backup your data

These permissions are only used for the stated functionality and you can revoke them at any time.`,
          },
          {
            title: '5. Data Sharing',
            content: `We do not share, sell, or transfer your personal data to third parties. Your information stays on your device and under your control.

Data export functionality allows you to create backups that you can share or store as you choose.`,
          },
          {
            title: "6. Children's Privacy",
            content: `MIND MATE is designed for users of all ages. We do not knowingly collect or solicit personal information from children under 13 without parental consent.`,
          },
          {
            title: '7. Changes to This Policy',
            content: `We may update this privacy policy from time to time. Any changes will be reflected in the app with an updated "Last Updated" date.`,
          },
          {
            title: '8. Contact Us',
            content: `If you have questions about this privacy policy or MIND MATE's privacy practices, you can contact us through the app's feedback system.`,
          },
        ],
      }
    : {
        title: '개인정보 처리방침',
        lastUpdated: '최종 업데이트: 2024년 12월',
        sections: [
          {
            title: '1. 수집하는 정보',
            content: `MIND MATE는 개인정보 보호를 최우선으로 하는 로컬 우선 애플리케이션입니다. 일기, 일정, 루틴, 연락처, 검색 항목을 포함한 모든 개인 데이터는 사용자의 기기에 로컬로 저장됩니다.

• 사용자가 입력한 개인정보 (이름, 나이, 연락처 정보)
• 일기 항목 및 기분 데이터
• 일정 및 루틴 정보
• 추가한 연락처 정보
• 검색 및 물건 데이터
• 첨부한 사진 및 미디어

이 모든 정보는 기기에 남아있으며 외부 서버로 전송되지 않습니다.`,
          },
          {
            title: '2. 정보 사용 방법',
            content: `사용자의 정보는 앱의 기능 제공을 위해서만 사용됩니다:

• 일기 항목 표시 및 정리
• 일정 및 루틴 관리
• 연락처 및 관계 저장
• 검색 기능 제공
• 데이터 내보내기 기능 제공

다른 목적으로 개인 데이터에 접근, 분석, 사용하지 않습니다.`,
          },
          {
            title: '3. 데이터 저장 및 보안',
            content: `• 모든 데이터는 SQLite 데이터베이스를 사용하여 기기에 로컬로 저장됩니다
• 외부 서버나 클라우드 서비스로 데이터가 전송되지 않습니다
• 사용자가 데이터를 완전히 제어합니다
• 백업 목적으로 JSON 형식의 데이터 내보내기가 가능합니다
• 설정 메뉴에서 언제든지 모든 데이터를 삭제할 수 있습니다`,
          },
          {
            title: '4. 권한',
            content: `MIND MATE는 다음 권한을 요청할 수 있습니다:

• 카메라 및 사진 라이브러리: 일기 항목 및 프로필에 사진 첨부
• 알림: 일정 및 루틴 알림 발송
• 파일 시스템: 데이터 내보내기 및 백업

이러한 권한은 명시된 기능에만 사용되며 언제든지 취소할 수 있습니다.`,
          },
          {
            title: '5. 데이터 공유',
            content: `개인 데이터를 제3자와 공유, 판매, 전송하지 않습니다. 정보는 기기에 남아있으며 사용자의 제어 하에 있습니다.

데이터 내보내기 기능을 통해 사용자가 선택적으로 공유하거나 저장할 수 있는 백업을 생성할 수 있습니다.`,
          },
          {
            title: '6. 아동의 개인정보',
            content: `MIND MATE는 모든 연령의 사용자를 위해 설계되었습니다. 부모의 동의 없이 13세 미만 아동의 개인정보를 의도적으로 수집하거나 요청하지 않습니다.`,
          },
          {
            title: '7. 정책 변경',
            content: `이 개인정보 처리방침을 수시로 업데이트할 수 있습니다. 변경 사항은 업데이트된 "최종 업데이트" 날짜와 함께 앱에 반영됩니다.`,
          },
          {
            title: '8. 연락처',
            content: `이 개인정보 처리방침이나 MIND MATE의 개인정보 관행에 대한 질문이 있으시면 앱의 피드백 시스템을 통해 연락해 주세요.`,
          },
        ],
      };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: themeColors.surface,
          paddingTop: (StatusBar.currentHeight || 0) + 60,
          paddingHorizontal: 24,
        }}
      >
        {/* 헤더 */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: themeColors.text,
                textAlign: 'center',
              }}
            >
              {privacyContent.title}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: themeColors.textSecondary,
                textAlign: 'center',
                marginTop: 4,
              }}
            >
              {privacyContent.lastUpdated}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              padding: 8,
            }}
          >
            <X size={24} color={themeColors.text} />
          </TouchableOpacity>
        </View>

        {/* 내용 */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: 120 + Math.max(insets.bottom, 10),
          }}
          showsVerticalScrollIndicator={true}
        >
          {privacyContent.sections.map((section, index) => (
            <View key={index} style={{ marginBottom: 32 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: themeColors.primary,
                  marginBottom: 12,
                }}
              >
                {section.title}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: themeColors.text,
                }}
              >
                {section.content}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* 하단 확인 버튼 */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 24,
            right: 24,
            paddingTop: 30,
            paddingBottom: Math.max(insets.bottom, 10),
            backgroundColor: themeColors.surface,
          }}
        >
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: themeColors.primary,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: themeColors.primaryText,
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              {isEnglish ? 'I Understand' : '확인했습니다'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PrivacyPolicyModal;
