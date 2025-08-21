import { getTranslations } from './i18n';
import { CustomAlertManager } from '../components/ui/custom-alert';

type AlertType = {
  type: 'delete' | 'confirm';
  text1: string;
  text2?: string;
  onPress: () => void;
};

/**
 *
 * @param param0 {타입 : "delete" | "confirm", 제목, 부제목, 삭제시 함수}
 */
export const deleteAlert = ({ type, text1, text2, onPress }: AlertType) => {
  // 현재 언어 설정 가져오기
  const { useAppStore } = require('../store/app-store');
  const language = useAppStore.getState().language;
  const t = getTranslations(language);

  const isEnglish = language === 'en';

  // type에 따라 버튼 텍스트 결정
  const confirmText =
    type === 'delete' ? (isEnglish ? 'Delete' : '삭제') : isEnglish ? 'Confirm' : '확인';
  const cancelText = isEnglish ? 'Cancel' : '취소';

  CustomAlertManager.alert(
    text1,
    text2 || '',
    [
      {
        text: confirmText,
        style: type === 'delete' ? 'destructive' : 'default',
        onPress: onPress,
      },
      {
        text: cancelText,
        style: 'cancel',
      },
    ],
    type === 'delete' ? 'warning' : 'info',
  );
};
