import { db } from '../../../hooks/use-initialize-database';
import type {
  ScheduleType,
  CreateScheduleDataType,
  UpdateScheduleDataType,
} from '../types/schedule-types';

// 일정 목록 조회
export const fetchGetSchedules = async (): Promise<ScheduleType[]> => {
  try {
    const result = await db.getAllAsync<ScheduleType>('SELECT * FROM schedules ORDER BY time ASC');
    return result;
  } catch (error) {
    console.error('Failed to get schedules:', error);
    return [];
  }
};

// 특정 날짜의 일정 조회
export const fetchGetSchedulesByDate = async (date: string): Promise<ScheduleType[]> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await db.getAllAsync<ScheduleType>(
      'SELECT * FROM schedules WHERE time BETWEEN ? AND ? ORDER BY time ASC',
      [startOfDay.toISOString(), endOfDay.toISOString()],
    );
    return result;
  } catch (error) {
    console.error('Failed to get schedules by date:', error);
    return [];
  }
};

// 일정 생성
export const fetchCreateSchedule = async (data: CreateScheduleDataType): Promise<number | null> => {
  try {
    const result = await db.runAsync(
      `INSERT INTO schedules (title, contents, time, location, companion, alarm_id, image_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.contents || null,
        data.time,
        data.location || null,
        data.companion || null,
        data.alarm_id || '',
        data.image_id || '',
      ],
    );
    return result.lastInsertRowId as number;
  } catch (error) {
    console.error('Failed to create schedule:', error);
    return null;
  }
};

// 일정 업데이트
export const fetchUpdateSchedule = async (
  id: number,
  data: UpdateScheduleDataType,
): Promise<boolean> => {
  try {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.contents !== undefined) {
      updates.push('contents = ?');
      values.push(data.contents);
    }
    if (data.time !== undefined) {
      updates.push('time = ?');
      values.push(data.time);
    }
    if (data.location !== undefined) {
      updates.push('location = ?');
      values.push(data.location);
    }
    if (data.companion !== undefined) {
      updates.push('companion = ?');
      values.push(data.companion);
    }
    if (data.is_completed !== undefined) {
      updates.push('is_completed = ?');
      values.push(data.is_completed);
    }

    if (updates.length === 0) return false;

    values.push(id);
    await db.runAsync(`UPDATE schedules SET ${updates.join(', ')} WHERE id = ?`, values);
    return true;
  } catch (error) {
    console.error('Failed to update schedule:', error);
    return false;
  }
};

// 일정 삭제
export const fetchDeleteSchedule = async (id: number): Promise<boolean> => {
  try {
    await db.runAsync('DELETE FROM schedules WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Failed to delete schedule:', error);
    return false;
  }
};

// 일정 완료/미완료 토글
export const toggleScheduleCompletion = async (id: number): Promise<boolean> => {
  try {
    const schedule = await db.getFirstAsync<ScheduleType>(
      'SELECT is_completed FROM schedules WHERE id = ?',
      [id],
    );
    if (!schedule) return false;

    const newStatus = schedule.is_completed === 1 ? 0 : 1;
    await db.runAsync('UPDATE schedules SET is_completed = ? WHERE id = ?', [newStatus, id]);
    return true;
  } catch (error) {
    console.error('Failed to toggle schedule completion:', error);
    return false;
  }
};

// 특정 일정 조회
export const fetchGetScheduleById = async (id: number): Promise<ScheduleType | null> => {
  try {
    const result = await db.getFirstAsync<ScheduleType>('SELECT * FROM schedules WHERE id = ?', [
      id,
    ]);
    return result || null;
  } catch (error) {
    console.error('Failed to get schedule by id:', error);
    return null;
  }
};
