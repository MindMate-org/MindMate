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
} from 'react-native';

import { Colors } from '../../constants/colors';
import { HapticFeedback } from '../../utils/haptic-feedback';

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
  buttons = [{ text: '확인' }],
  type = 'info',
  onDismiss,
}) => {
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
        return 'bg-red-500';
      case 'cancel':
        return 'bg-gray-200';
      default:
        return 'bg-paleCobalt';
    }
  };

  const getButtonTextStyle = (style?: string) => {
    switch (style) {
      case 'cancel':
        return 'text-gray-700';
      default:
        return 'text-white';
    }
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onDismiss}>
      <Animated.View
        className="flex-1 items-center justify-center"
        style={{ 
          opacity: fadeAnim,
          backgroundColor: 'rgba(0, 0, 0, 0.1)'
        }}
      >
        <Animated.View
          className="mx-6 rounded-2xl bg-white p-6 shadow-lg"
          style={{
            transform: [{ scale: scaleAnim }],
            minWidth: Dimensions.get('window').width * 0.8,
            maxWidth: Dimensions.get('window').width * 0.9,
          }}
        >
          {/* 헤더 */}
          <View className="mb-4 flex-row items-center">
            <View className="mr-3">{getIcon()}</View>
            <View className="flex-1">
              {title && (
                <Text className="text-lg font-bold" style={{ color: getTypeColor() }}>
                  {title}
                </Text>
              )}
            </View>
          </View>

          {/* 메시지 */}
          <Text className="text-gray-700 mb-6 text-base leading-6">{message}</Text>

          {/* 버튼들 */}
          <View
            className={`flex-row gap-3 ${buttons.length === 1 ? 'justify-center' : 'justify-end'}`}
          >
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                className={`flex-1 rounded-xl px-4 py-3 ${getButtonStyle(button.style)}`}
                onPress={() => handleButtonPress(button)}
                activeOpacity={0.8}
              >
                <Text
                  className={`text-center text-base font-medium ${getButtonTextStyle(button.style)}`}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
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
        buttons: buttons || [{ text: '확인' }],
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

  // 편의 메소드들
  static success(message: string, title = '성공'): Promise<void> {
    HapticFeedback.success();
    return CustomAlertManager.alert(title, message, [{ text: '확인' }], 'success');
  }

  static error(message: string, title = '오류'): Promise<void> {
    HapticFeedback.error();
    return CustomAlertManager.alert(title, message, [{ text: '확인' }], 'error');
  }

  static warning(message: string, title = '경고'): Promise<void> {
    HapticFeedback.warning();
    return CustomAlertManager.alert(title, message, [{ text: '확인' }], 'warning');
  }

  static info(message: string, title = '알림'): Promise<void> {
    HapticFeedback.light();
    return CustomAlertManager.alert(title, message, [{ text: '확인' }], 'info');
  }

  static confirm(
    title: string,
    message: string,
    onConfirm?: () => void,
    onCancel?: () => void,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      CustomAlertManager.alert(
        title,
        message,
        [
          {
            text: '취소',
            style: 'cancel',
            onPress: () => {
              if (onCancel) onCancel();
              resolve(false);
            },
          },
          {
            text: '확인',
            onPress: () => {
              if (onConfirm) onConfirm();
              resolve(true);
            },
          },
        ],
        'info',
      );
    });
  }
}

export default CustomAlert;
