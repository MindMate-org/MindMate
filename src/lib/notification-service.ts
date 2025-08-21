/**
 * 통합 알림 서비스
 * 일정과 루틴을 위한 정확한 알림 시스템
 * 중복 방지 및 정확한 시간 보장
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// 알림 타입 정의
export interface NotificationData {
  id: string;
  type: 'schedule' | 'routine';
  itemId: string;
  title: string;
  body: string;
  scheduledTime: string; // ISO string
  isRecurring: boolean;
  repeatPattern?: string;
}

class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;
  private scheduledNotifications = new Set<string>(); // 중복 방지용

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * 알림 서비스 초기화
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // 알림 권한 요청
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return false;
      }

      // 알림 핸들러 설정
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // 기존 스케줄된 알림 로드
      await this.loadScheduledNotifications();

      this.isInitialized = true;
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 일정 알림 설정
   */
  async scheduleNotification(
    itemId: string,
    type: 'schedule' | 'routine',
    title: string,
    body: string,
    scheduledTime: Date,
    isRecurring: boolean = false,
    repeatPattern?: string,
  ): Promise<boolean> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }

    try {
      // 기존 알림 제거 (중복 방지)
      await this.cancelNotification(itemId, type);

      // 과거 시간인지 확인
      const now = new Date();
      if (scheduledTime <= now) {
        return false;
      }

      // 고유한 알림 ID 생성
      const notificationId = this.generateNotificationId(itemId, type, scheduledTime);

      // 중복 체크
      if (this.scheduledNotifications.has(notificationId)) {
        return false;
      }

      // 알림 스케줄링
      const result = await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title,
          body,
          data: {
            itemId,
            type,
            scheduledTime: scheduledTime.toISOString(),
            isRecurring,
            repeatPattern,
          },
        },
        trigger: { date: scheduledTime } as any,
      });

      // 성공적으로 스케줄된 경우 추가
      this.scheduledNotifications.add(notificationId);
      await this.saveScheduledNotifications();

      console.log(`✅ 알림 설정 완료: ${title} - ${scheduledTime.toLocaleString('ko-KR')}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 알림 취소
   */
  async cancelNotification(itemId: string, type: 'schedule' | 'routine'): Promise<boolean> {
    try {
      // 모든 스케줄된 알림 조회
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

      // 해당 아이템의 알림 찾기
      const targetNotifications = scheduledNotifications.filter((notification) => {
        const data = notification.content.data;
        return data?.itemId === itemId && data?.type === type;
      });

      // 찾은 알림들 취소
      for (const notification of targetNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        this.scheduledNotifications.delete(notification.identifier);
      }

      await this.saveScheduledNotifications();

      if (targetNotifications.length > 0) {
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 모든 알림 취소
   */
  async cancelAllNotifications(): Promise<boolean> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.scheduledNotifications.clear();
      await this.saveScheduledNotifications();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 스케줄된 알림 조회
   */
  async getScheduledNotifications(itemId?: string, type?: 'schedule' | 'routine') {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

      if (!itemId && !type) {
        return scheduledNotifications;
      }

      return scheduledNotifications.filter((notification) => {
        const data = notification.content.data;
        if (itemId && type) {
          return data?.itemId === itemId && data?.type === type;
        } else if (itemId) {
          return data?.itemId === itemId;
        } else if (type) {
          return data?.type === type;
        }
        return false;
      });
    } catch (error) {
      return [];
    }
  }

  /**
   * 고유한 알림 ID 생성
   */
  private generateNotificationId(
    itemId: string,
    type: 'schedule' | 'routine',
    scheduledTime: Date,
  ): string {
    const timestamp = scheduledTime.getTime();
    const hash = this.simpleHash(`${itemId}_${type}_${timestamp}`);
    return `${type}_${itemId}_${hash}`;
  }

  /**
   * 간단한 해시 함수
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 32비트 정수로 변환
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 스케줄된 알림 목록 저장
   */
  private async saveScheduledNotifications(): Promise<void> {
    try {
      const notificationsArray = Array.from(this.scheduledNotifications);
      await AsyncStorage.setItem('scheduledNotifications', JSON.stringify(notificationsArray));
    } catch (error) {}
  }

  /**
   * 스케줄된 알림 목록 로드
   */
  private async loadScheduledNotifications(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('scheduledNotifications');
      if (saved) {
        const notificationsArray = JSON.parse(saved);
        this.scheduledNotifications = new Set(notificationsArray);
      }
    } catch (error) {}
  }

  /**
   * 디버그: 현재 스케줄된 모든 알림 출력
   */
  async debugPrintScheduledNotifications(): Promise<void> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      notifications.forEach((notification, index) => {
        const trigger = notification.trigger as any;
        const scheduledTime = trigger.date ? new Date(trigger.date) : '미정';
        console.log(
          `   시간: ${scheduledTime instanceof Date ? scheduledTime.toLocaleString('ko-KR') : scheduledTime}`,
        );
      });
    } catch (error) {}
  }
}

// 싱글톤 인스턴스 export
export const notificationService = NotificationService.getInstance();
