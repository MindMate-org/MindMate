import { Edit3, Trash2 } from 'lucide-react-native';
import { Modal, TouchableOpacity, View, Text, Pressable, StatusBar } from 'react-native';

import { useThemeColors } from '../../../components/providers/theme-provider';
import { CustomAlertManager } from '../../../components/ui/custom-alert';
import { useI18n } from '../../../hooks/use-i18n';

const ActionMenu = ({
  isVisible,
  onClose,
  onEdit,
  onDelete,
}: {
  isVisible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const { theme: themeColors, isDark } = useThemeColors();
  const { t } = useI18n();
  const isEnglish = t.locale.startsWith('en');

  const handleDelete = async () => {
    const confirmed = await CustomAlertManager.confirm(
      isEnglish ? 'Delete Contact' : '연락처 삭제',
      isEnglish ? 'Are you sure you want to delete this contact?' : '이 연락처를 삭제하시겠습니까?',
    );
    if (confirmed) {
      onDelete();
      onClose();
    }
  };

  const handleEdit = () => {
    onEdit();
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: StatusBar.currentHeight || 0,
          paddingHorizontal: 16,
        }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()} onStartShouldSetResponder={() => true}>
          <View
            style={{
              minWidth: 280,
              borderRadius: 20,
              backgroundColor: themeColors.surface,
              shadowColor: themeColors.shadow,
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: isDark ? 0.5 : 0.25,
              shadowRadius: 20,
              elevation: 12,
              overflow: 'hidden',
            }}
          >
            {/* 헤더 */}
            <View
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderBottomWidth: 1,
                borderBottomColor: themeColors.border,
                paddingHorizontal: 20,
                paddingVertical: 16,
              }}
            >
              <Text
                style={{
                  color: themeColors.textSecondary,
                  fontSize: 15,
                  fontWeight: '600',
                  textAlign: 'center',
                  letterSpacing: 0.3,
                }}
              >
                {isEnglish ? 'Contact Management' : '연락처 관리'}
              </Text>
            </View>

            <View style={{ paddingVertical: 8, paddingBottom: 16 }}>
              {/* 편집하기 */}
              <TouchableOpacity
                onPress={handleEdit}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  paddingVertical: 18,
                  backgroundColor: 'transparent',
                }}
                activeOpacity={0.6}
              >
                <View
                  style={{
                    marginRight: 16,
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: themeColors.primary + '15',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Edit3 size={18} color={themeColors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: themeColors.text,
                      fontSize: 16,
                      fontWeight: '600',
                      marginBottom: 2,
                    }}
                  >
                    {isEnglish ? 'Edit Contact' : '연락처 편집'}
                  </Text>
                  <Text
                    style={{
                      color: themeColors.textSecondary,
                      fontSize: 13,
                    }}
                  >
                    {isEnglish ? 'Modify contact information' : '연락처 정보를 수정합니다'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* 구분선 */}
              <View
                style={{
                  height: 1,
                  backgroundColor: themeColors.border,
                  marginHorizontal: 20,
                  marginVertical: 4,
                }}
              />

              {/* 삭제하기 */}
              <TouchableOpacity
                onPress={handleDelete}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  paddingVertical: 18,
                  backgroundColor: 'transparent',
                }}
                activeOpacity={0.6}
              >
                <View
                  style={{
                    marginRight: 16,
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: themeColors.error + '15',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Trash2 size={18} color={themeColors.error} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: themeColors.error,
                      marginBottom: 2,
                    }}
                  >
                    {isEnglish ? 'Delete Contact' : '연락처 삭제'}
                  </Text>
                  <Text
                    style={{
                      color: themeColors.textSecondary,
                      fontSize: 13,
                    }}
                  >
                    {isEnglish
                      ? 'Permanently remove this contact'
                      : '이 연락처를 영구적으로 삭제합니다'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ActionMenu;
