import { CheckCircle, AlertCircle, Info } from 'lucide-react-native';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  Alert as RNAlert,
  StatusBar,
  Pressable,
} from 'react-native';

import { Colors } from '../../constants/colors';
import { getTranslations } from '../../lib/i18n';
import { useLanguage } from '../../store/app-store';
import { HapticFeedback } from '../../utils/haptic-feedback';
import { useThemeColors } from '../providers/theme-provider';

export interface CustomAlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface CustomAlertProps {
  visible: boolean;
  title?: string;
  message: string;
  buttons?: CustomAlertButton[];
  type?: 'success' | 'error' | 'info' | 'warning';
  onDismiss?: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons,
  type = 'info',
  onDismiss,
}) => {
  const language = useLanguage();
  const t = getTranslations(language);
  const { theme: themeColors, isDark } = useThemeColors();

  const defaultButtons = buttons || [{ text: t.common.ok }];
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} color="#10B981" />;
      case 'error':
        return <AlertCircle size={24} color="#EF4444" />;
      case 'warning':
        return <AlertCircle size={24} color="#F59E0B" />;
      default:
        return <Info size={24} color={Colors.paleCobalt} />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      default:
        return Colors.paleCobalt;
    }
  };

  const handleButtonPress = (button: CustomAlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  const getButtonStyle = (style?: string) => {
    switch (style) {
      case 'destructive':
        return { backgroundColor: '#EF4444' };
      case 'cancel':
        return { backgroundColor: '#FEF3C7' };
      default:
        return { backgroundColor: Colors.paleCobalt };
    }
  };

  const getButtonTextStyle = (style?: string) => {
    switch (style) {
      case 'cancel':
        return { color: Colors.paleCobalt };
      case 'destructive':
        return { color: '#FFFFFF' };
      default:
        return { color: '#FFFFFF' };
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent={true}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: StatusBar.currentHeight || 0,
        }}
        onPress={onDismiss}
      >
        <Pressable onPress={(e) => e.stopPropagation()} onStartShouldSetResponder={() => true}>
          <Animated.View
            style={{
              marginHorizontal: 24,
              borderRadius: 16,
              backgroundColor: themeColors.surface,
              padding: 24,
              shadowColor: themeColors.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.3 : 0.15,
              shadowRadius: 8,
              elevation: 8,
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
              minWidth: Dimensions.get('window').width * 0.8,
              maxWidth: Dimensions.get('window').width * 0.9,
            }}
          >
            {/* 헤더 */}
            <View
              style={{
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View style={{ marginRight: 12 }}>{getIcon()}</View>
              <View style={{ flex: 1 }}>
                {title && (
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: getTypeColor(),
                    }}
                  >
                    {title}
                  </Text>
                )}
              </View>
            </View>

            {/* 메시지 */}
            {message && message.trim() && (
              <Text
                style={{
                  color: themeColors.text,
                  marginBottom: 20,
                  fontSize: 16,
                  lineHeight: 24,
                }}
              >
                {message.replace(/\\n/g, '\n')}
              </Text>
            )}

            {/* 버튼들 - 3개 이상이면 세로로 배치 */}
            <View
              style={{
                flexDirection: defaultButtons.length > 2 ? 'column' : 'row',
                gap: 12,
                justifyContent: defaultButtons.length === 1 ? 'center' : 'flex-end',
                marginBottom: 20,
              }}
            >
              {defaultButtons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    {
                      flex: defaultButtons.length <= 2 ? 1 : 0,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                    },
                    getButtonStyle(button.style),
                  ]}
                  onPress={() => handleButtonPress(button)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      {
                        textAlign: 'center',
                        fontSize: 14,
                        fontWeight: '500',
                      },
                      getButtonTextStyle(button.style),
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// 전역에서 사용할 수 있는 Alert 함수들
export class CustomAlertManager {
  private static currentAlert: {
    component: React.ReactElement;
    resolve: (value?: any) => void;
  } | null = null;

  private static alertContainer: {
    showAlert: (alert: React.ReactElement) => void;
    hideAlert: () => void;
  } | null = null;

  static setAlertContainer(container: typeof CustomAlertManager.alertContainer) {
    CustomAlertManager.alertContainer = container;
  }

  static alert(
    title: string,
    message?: string,
    buttons?: CustomAlertButton[],
    type?: 'success' | 'error' | 'info' | 'warning',
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!CustomAlertManager.alertContainer) {
        // Fallback to native alert
        RNAlert.alert(
          title,
          message,
          buttons?.map((b) => ({
            text: b.text,
            onPress: b.onPress,
            style: b.style as any,
          })),
        );
        resolve();
        return;
      }

      const alertProps: CustomAlertProps = {
        visible: true,
        title,
        message: message || '',
        buttons: buttons || [{ text: CustomAlertManager.getTranslations().common.ok }],
        type,
        onDismiss: () => {
          CustomAlertManager.alertContainer?.hideAlert();
          resolve();
        },
      };

      const alertComponent = <CustomAlert {...alertProps} />;
      CustomAlertManager.alertContainer.showAlert(alertComponent);
    });
  }

  // Helper method to get current translations
  private static getTranslations() {
    const { useAppStore } = require('../../store/app-store');
    const language = useAppStore.getState().language;
    return getTranslations(language);
  }

  // 편의 메소드들
  static success(message: string, title?: string): Promise<void> {
    const t = CustomAlertManager.getTranslations();
    HapticFeedback.success();
    return CustomAlertManager.alert(
      title || (t.locale.startsWith('en') ? 'Success' : '성공'),
      message,
      [{ text: t.common.ok }],
      'success',
    );
  }

  static error(message: string, title?: string): Promise<void> {
    const t = CustomAlertManager.getTranslations();
    HapticFeedback.error();
    return CustomAlertManager.alert(
      title || t.common.error,
      message,
      [{ text: t.common.ok }],
      'error',
    );
  }

  static warning(message: string, title?: string): Promise<void> {
    const t = CustomAlertManager.getTranslations();
    HapticFeedback.warning();
    return CustomAlertManager.alert(
      title || (t.locale.startsWith('en') ? 'Warning' : '경고'),
      message,
      [{ text: t.common.ok }],
      'warning',
    );
  }

  static info(message: string, title?: string): Promise<void> {
    const t = CustomAlertManager.getTranslations();
    HapticFeedback.light();
    return CustomAlertManager.alert(
      title || (t.locale.startsWith('en') ? 'Alert' : '알림'),
      message,
      [{ text: t.common.ok }],
      'info',
    );
  }

  static confirm(
    title: string,
    message: string,
    onConfirm?: () => void,
    onCancel?: () => void,
  ): Promise<boolean> {
    const t = CustomAlertManager.getTranslations();
    return new Promise((resolve) => {
      CustomAlertManager.alert(
        title,
        message,
        [
          {
            text: t.common.confirm,
            onPress: () => {
              if (onConfirm) onConfirm();
              resolve(true);
            },
          },
          {
            text: t.common.cancel,
            style: 'cancel',
            onPress: () => {
              if (onCancel) onCancel();
              resolve(false);
            },
          },
        ],
        'info',
      );
    });
  }
}

export default CustomAlert;
