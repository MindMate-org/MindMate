import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomAlertManager } from '../../src/components/ui/custom-alert';
import { useResetAppState } from '../../src/store/global-store';

export const useDataClear = () => {
  const router = useRouter();
  const resetAppState = useResetAppState();

  const performDataClear = async () => {
    try {
      console.log('=== 테스트 데이터 삭제 시작 ===');

      // 1. 상태 초기화
      resetAppState();
      console.log('✓ App state reset');

      // 2. AsyncStorage 초기화
      await AsyncStorage.clear();
      console.log('✓ AsyncStorage cleared');

      // 3. 데이터베이스 초기화
      const { db } = await import('../../src/hooks/use-initialize-database');
      
      const tables = [
        'contact_tag', 'note_item', 'note_group', 'subtasks_executions', 
        'subtasks', 'routine_executions', 'routine_statistics', 'alarms',
        'media', 'diaries', 'schedules', 'routines', 'contact', 'tag', 'search'
      ];

      for (const table of tables) {
        try {
          await db.runAsync(`DELETE FROM ${table}`);
          console.log(`✓ Cleared table: ${table}`);
        } catch (error) {
          console.log(`✗ Failed to clear table ${table}:`, error);
        }
      }

      // 4. ID 재설정
      try {
        await db.runAsync("DELETE FROM sqlite_sequence");
        console.log('✓ Reset auto-increment IDs');
      } catch (error) {
        console.log('✗ Failed to reset auto-increment:', error);
      }

      // 5. 사용자 알림 및 이동
      await CustomAlertManager.success('모든 데이터가 삭제되었습니다!\n\n앱이 초기 상태로 재시작됩니다.');
      
      console.log('✓ Navigating to onboarding...');
      router.replace('/onboarding/welcome');
      
      console.log('=== 데이터 삭제 완료 ===');

    } catch (error) {
      console.error('=== 데이터 삭제 실패 ===', error);
      CustomAlertManager.error(`데이터 삭제 실패: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return { performDataClear };
};