/**
 * 공통으로 사용되는 액션들을 모은 훅
 */

import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { CustomAlertManager } from '../components/ui/custom-alert';

/**
 * 공통 액션 훅
 * @returns 공통으로 사용되는 액션 함수들
 */
export const useCommonActions = () => {
  const router = useRouter();

  /**
   * 확인 다이얼로그 표시
   * @param title - 다이얼로그 제목
   * @param message - 다이얼로그 메시지
   * @param onConfirm - 확인 버튼 클릭 시 실행될 함수
   * @param confirmText - 확인 버튼 텍스트
   * @param cancelText - 취소 버튼 텍스트
   */
  const showConfirmDialog = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      confirmText: string = '확인',
      cancelText: string = '취소',
    ) => {
      CustomAlertManager.alert(title, message, [
        {
          text: cancelText,
          style: 'cancel',
        },
        {
          text: confirmText,
          onPress: onConfirm,
          style: 'destructive',
        },
      ]);
    },
    [],
  );

  /**
   * 알림 다이얼로그 표시
   * @param title - 다이얼로그 제목
   * @param message - 다이얼로그 메시지
   * @param onOk - 확인 버튼 클릭 시 실행될 함수
   */
  const showAlert = useCallback((title: string, message: string, onOk?: () => void) => {
    CustomAlertManager.alert(title, message, [
      {
        text: '확인',
        onPress: onOk,
      },
    ]);
  }, []);

  /**
   * 삭제 확인 다이얼로그
   * @param itemName - 삭제할 항목 이름
   * @param onDelete - 삭제 확인 시 실행될 함수
   */
  const showDeleteConfirm = useCallback(
    (itemName: string, onDelete: () => void) => {
      showConfirmDialog(
        '삭제 확인',
        `${itemName}을(를) 삭제하시겠습니까?`,
        onDelete,
        '삭제',
        '취소',
      );
    },
    [showConfirmDialog],
  );

  /**
   * 에러 알림 표시
   * @param error - 에러 객체 또는 메시지
   * @param customMessage - 사용자 정의 메시지
   */
  const showError = useCallback(
    (error: Error | string, customMessage?: string) => {
      const message = customMessage || (typeof error === 'string' ? error : error.message);
      showAlert('오류', message);
    },
    [showAlert],
  );

  /**
   * 성공 알림 표시
   * @param message - 성공 메시지
   * @param onOk - 확인 버튼 클릭 시 실행될 함수
   */
  const showSuccess = useCallback(
    (message: string, onOk?: () => void) => {
      showAlert('성공', message, onOk);
    },
    [showAlert],
  );

  /**
   * 뒤로 가기
   */
  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  /**
   * 홈으로 이동
   */
  const goHome = useCallback(() => {
    router.replace('/');
  }, [router]);

  /**
   * 특정 경로로 이동
   * @param path - 이동할 경로
   * @param replace - replace 여부 (기본값: false)
   */
  const navigate = useCallback(
    (path: string, replace: boolean = false) => {
      if (replace) {
        router.replace(path);
      } else {
        router.push(path);
      }
    },
    [router],
  );

  /**
   * 로딩 상태에서 안전하게 네비게이션
   * @param path - 이동할 경로
   * @param isLoading - 로딩 상태
   * @param replace - replace 여부
   */
  const safeNavigate = useCallback(
    (path: string, isLoading: boolean = false, replace: boolean = false) => {
      if (!isLoading) {
        navigate(path, replace);
      }
    },
    [navigate],
  );

  return {
    showConfirmDialog,
    showAlert,
    showDeleteConfirm,
    showError,
    showSuccess,
    goBack,
    goHome,
    navigate,
    safeNavigate,
  };
};
