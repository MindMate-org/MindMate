/**
 * 루틴 관련 SQLite DB CRUD 서비스
 */

import { db } from '../../hooks/use-initialize-database';
import { RoutineType, CreateRoutinePayload, UpdateRoutinePayload } from './types';
import {
  RoutineDbType,
  SubTaskDbType,
  CreateRoutineDbType,
  RoutineWithSubTasksType,
  RoutineQueryOptions,
} from './db/routine-db-types';
import { shouldRunOnDate } from './utils';

/**
 * DB 타입을 앱 타입으로 변환하는 헬퍼 함수
 */
const mapDbToRoutineType = (
  dbRoutine: RoutineDbType,
  subTasks: SubTaskDbType[] = [],
): RoutineType => {
  return {
    id: dbRoutine.id.toString(),
    name: dbRoutine.name,
    details: dbRoutine.details || undefined,
    imageUrl: dbRoutine.image_url || undefined,
    repeatCycle: dbRoutine.repeat_cycle as any,
    alarmTime: dbRoutine.alarm_time || undefined,
    deadline: dbRoutine.deadline || undefined,
    subTasks: subTasks.map((subTask) => ({
      id: subTask.id.toString(),
      routineId: subTask.routine_id.toString(),
      title: subTask.title,
      isCompleted: Boolean(subTask.is_completed),
      order: subTask.order_index,
    })),
    createdAt: dbRoutine.created_at,
    updatedAt: dbRoutine.updated_at,
  };
};

/**
 * 앱 타입을 DB 타입으로 변환하는 헬퍼 함수
 */
const mapToCreateRoutineDbType = (payload: CreateRoutinePayload): CreateRoutineDbType => {
  const now = new Date().toISOString();
  return {
    name: payload.name,
    details: payload.details || null,
    image_url: payload.imageUrl || null,
    repeat_cycle: payload.repeatCycle,
    alarm_time: payload.alarmTime || null,
    deadline: payload.deadline || null,
  };
};

/**
 * 모든 루틴을 가져오는 함수
 * @param options - 쿼리 옵션
 * @returns 해당 조건의 루틴 목록
 */
export const fetchGetRoutines = async (
  options: RoutineQueryOptions = {},
): Promise<RoutineType[]> => {
  try {
    // 루틴과 하위 작업을 LEFT JOIN으로 함께 조회
    let query = `
      SELECT r.*, 
             s.id as sub_task_id,
             s.title as sub_task_title,
             s.order_index as sub_task_order,
             s.is_completed as sub_task_completed
      FROM routines r
      LEFT JOIN subtasks s ON r.id = s.routine_id
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    // 날짜 필터링 (해당 날짜 이전에 생성된 루틴만 - 반복 설정에 따라 해당 날짜에 실행될 수 있음)
    if (options.date) {
      conditions.push("DATE(r.created_at, '+9 hours') <= DATE(?, '+9 hours')");
      params.push(options.date); // 'YYYY-MM-DD'만 전달
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    // 최신 루틴부터, 하위 작업은 순서대로 정렬
    query += ` ORDER BY r.created_at DESC, s.order_index ASC`;

    // 페이지네이션 적용
    if (options.limit) {
      query += ` LIMIT ${options.limit}`;
      if (options.offset) {
        query += ` OFFSET ${options.offset}`;
      }
    }

    const result = await db.getAllAsync(query, params);

    // 결과를 루틴별로 그룹화 (하위 작업이 여러 개일 수 있으므로)
    const routineMap = new Map<number, RoutineWithSubTasksType>();

    result.forEach((row: any) => {
      const routineId = row.id;

      if (!routineMap.has(routineId)) {
        routineMap.set(routineId, {
          id: row.id,
          name: row.name,
          details: row.details,
          image_url: row.image_url,
          repeat_cycle: row.repeat_cycle,
          alarm_time: row.alarm_time,
          deadline: row.deadline,
          created_at: row.created_at,
          updated_at: row.updated_at,
          subTasks: [],
        });
      }

      if (row.sub_task_id) {
        const routine = routineMap.get(routineId)!;
        routine.subTasks.push({
          id: row.sub_task_id,
          routine_id: row.id,
          title: row.sub_task_title,
          order_index: row.sub_task_order,
          is_completed: row.sub_task_completed,
          created_at: row.created_at,
          updated_at: row.updated_at,
        });
      }
    });

    // DB 타입을 앱 타입으로 변환
    const allRoutines = Array.from(routineMap.values()).map((routine) => {
      const routineData: RoutineDbType = {
        id: routine.id,
        name: routine.name,
        details: routine.details,
        image_url: routine.image_url,
        repeat_cycle: routine.repeat_cycle,
        alarm_time: routine.alarm_time,
        deadline: routine.deadline,
        created_at: routine.created_at,
        updated_at: routine.updated_at,
      };
      return mapDbToRoutineType(routineData, routine.subTasks);
    });

    // 특정 날짜에 실행되어야 하는 루틴만 필터링
    if (options.date) {
      // YYYY-MM-DD 형식을 UTC 기반으로 정확히 파싱
      const [year, month, day] = options.date.split('-').map(Number);
      const targetDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0)); // UTC 기반으로 생성

      const filteredRoutines = allRoutines.filter((routine) => {
        const shouldRun = shouldRunOnDate(routine, targetDate);
        return shouldRun;
      });

      return filteredRoutines;
    }

    return allRoutines;
  } catch (error) {
    console.error('Error fetching routines:', error);
    throw new Error('루틴 목록을 가져오는데 실패했습니다.');
  }
};

/**
 * 특정 루틴을 가져오는 함수
 * @param id - 루틴 ID
 * @returns 루틴 상세 정보
 */
export const fetchGetRoutineById = async (id: string): Promise<RoutineType> => {
  try {
    // 루틴 기본 정보 조회
    const routineQuery = 'SELECT * FROM routines WHERE id = ?';
    const routineResult = (await db.getFirstAsync(routineQuery, [id])) as RoutineDbType | null;

    if (!routineResult) {
      throw new Error('루틴을 찾을 수 없습니다.');
    }

    // 해당 루틴의 하위 작업들을 순서대로 조회
    const subTasksQuery = 'SELECT * FROM subtasks WHERE routine_id = ? ORDER BY order_index ASC';
    const subTasksResult = (await db.getAllAsync(subTasksQuery, [id])) as SubTaskDbType[];

    return mapDbToRoutineType(routineResult, subTasksResult);
  } catch (error) {
    console.error('Error fetching routine by id:', error);
    throw new Error('루틴 상세 정보를 가져오는데 실패했습니다.');
  }
};

/**
 * 새로운 루틴을 생성하는 함수
 * @param payload - 생성할 루틴 데이터
 * @returns 생성된 루틴 정보
 */
export const fetchCreateRoutine = async (payload: CreateRoutinePayload): Promise<RoutineType> => {
  try {
    await db.runAsync('BEGIN TRANSACTION');

    // 시작 날짜가 있으면 해당 날짜를, 없으면 현재 시간을 사용
    const startDate = payload.startDate
      ? (() => {
          const date = new Date(payload.startDate);
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          const pureDate = `${year}-${month}-${day}`;
          return pureDate;
        })()
      : (() => {
          const now = new Date();
          const year = now.getFullYear();
          const month = (now.getMonth() + 1).toString().padStart(2, '0');
          const day = now.getDate().toString().padStart(2, '0');
          const pureDate = `${year}-${month}-${day}`;
          return pureDate;
        })();
    const routineData = mapToCreateRoutineDbType(payload);

    // 루틴 기본 정보 삽입
    const routineQuery = `
      INSERT INTO routines (name, details, image_url, repeat_cycle, alarm_time, deadline, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const routineResult = await db.runAsync(routineQuery, [
      routineData.name,
      routineData.details,
      routineData.image_url,
      routineData.repeat_cycle,
      routineData.alarm_time,
      routineData.deadline,
      startDate,
      startDate,
    ]);

    const routineId = routineResult.lastInsertRowId;

    // 하위 작업이 있으면 함께 생성
    if (payload.subTasks && payload.subTasks.length > 0) {
      const subTaskQuery = `
        INSERT INTO subtasks (routine_id, title, order_index, is_completed, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      for (const subTask of payload.subTasks) {
        await db.runAsync(subTaskQuery, [
          routineId,
          subTask.title,
          subTask.order,
          0, // is_completed = false (미완료 상태로 시작)
          startDate,
          startDate,
        ]);
      }
    }

    await db.runAsync('COMMIT');

    // 생성된 루틴 반환
    return await fetchGetRoutineById(routineId.toString());
  } catch (error) {
    await db.runAsync('ROLLBACK');
    console.error('Error creating routine:', error);
    throw new Error('루틴 생성에 실패했습니다.');
  }
};

/**
 * 루틴을 수정하는 함수
 * @param payload - 수정할 루틴 데이터
 * @returns 수정된 루틴 정보
 */
export const fetchUpdateRoutine = async (payload: UpdateRoutinePayload): Promise<RoutineType> => {
  try {
    await db.runAsync('BEGIN TRANSACTION');

    const now = new Date().toISOString();
    const routineId = parseInt(payload.id);

    // 루틴 기본 정보 업데이트 (변경된 필드만)
    if (
      payload.name ||
      payload.details ||
      payload.imageUrl ||
      payload.repeatCycle ||
      payload.alarmTime ||
      payload.deadline
    ) {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (payload.name) {
        updateFields.push('name = ?');
        updateValues.push(payload.name);
      }
      if (payload.details !== undefined) {
        updateFields.push('details = ?');
        updateValues.push(payload.details);
      }
      if (payload.imageUrl !== undefined) {
        updateFields.push('image_url = ?');
        updateValues.push(payload.imageUrl);
      }
      if (payload.repeatCycle) {
        updateFields.push('repeat_cycle = ?');
        updateValues.push(payload.repeatCycle);
      }
      if (payload.alarmTime !== undefined) {
        updateFields.push('alarm_time = ?');
        updateValues.push(payload.alarmTime);
      } else {
        // alarmTime이 undefined인 경우 (알림 비활성화) NULL로 설정
        updateFields.push('alarm_time = ?');
        updateValues.push(null);
      }
      if (payload.deadline !== undefined) {
        updateFields.push('deadline = ?');
        updateValues.push(payload.deadline);
      }

      updateFields.push('updated_at = ?');
      updateValues.push(now);
      updateValues.push(routineId);

      const routineQuery = `UPDATE routines SET ${updateFields.join(', ')} WHERE id = ?`;
      await db.runAsync(routineQuery, updateValues);
    }

    // 하위 작업 업데이트 (기존 것 삭제 후 새로 생성)
    if (payload.subTasks) {
      // 기존 하위 작업 모두 삭제
      await db.runAsync('DELETE FROM subtasks WHERE routine_id = ?', [routineId]);

      // 새로운 하위 작업들 추가
      if (payload.subTasks.length > 0) {
        const subTaskQuery = `
          INSERT INTO subtasks (routine_id, title, order_index, is_completed, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        for (const subTask of payload.subTasks) {
          await db.runAsync(subTaskQuery, [
            routineId,
            subTask.title,
            subTask.order,
            0, // is_completed = false (수정 시에는 미완료로 초기화)
            now,
            now,
          ]);
        }
      }
    }

    await db.runAsync('COMMIT');

    // 수정된 루틴 반환
    return await fetchGetRoutineById(payload.id);
  } catch (error) {
    await db.runAsync('ROLLBACK');
    console.error('Error updating routine:', error);
    throw new Error('루틴 수정에 실패했습니다.');
  }
};

/**
 * 루틴을 삭제하는 함수
 * @param id - 삭제할 루틴 ID
 */
export const fetchDeleteRoutine = async (id: string): Promise<void> => {
  try {
    await db.runAsync('BEGIN TRANSACTION');

    const routineId = parseInt(id);

    // 외래키 제약조건 때문에 순서대로 삭제
    // 1. 하위 작업 삭제
    await db.runAsync('DELETE FROM subtasks WHERE routine_id = ?', [routineId]);

    // 2. 루틴 실행 기록 삭제
    await db.runAsync('DELETE FROM routine_executions WHERE routine_id = ?', [routineId]);

    // 3. 루틴 통계 삭제
    await db.runAsync('DELETE FROM routine_statistics WHERE routine_id = ?', [routineId]);

    // 4. 루틴 삭제 (마지막)
    await db.runAsync('DELETE FROM routines WHERE id = ?', [routineId]);

    await db.runAsync('COMMIT');
  } catch (error) {
    await db.runAsync('ROLLBACK');
    console.error('Error deleting routine:', error);
    throw new Error('루틴 삭제에 실패했습니다.');
  }
};

/**
 * 하위 작업 완료 상태를 변경하는 함수
 * @param subTaskId - 하위 작업 ID
 * @param isCompleted - 완료 여부
 */
export const updateSubTaskCompletion = async (
  subTaskId: string,
  isCompleted: boolean,
): Promise<void> => {
  try {
    const now = new Date().toISOString();
    // 하위 작업의 완료 상태와 수정 시간 업데이트
    const query = 'UPDATE subtasks SET is_completed = ?, updated_at = ? WHERE id = ?';
    await db.runAsync(query, [isCompleted ? 1 : 0, now, subTaskId]);
  } catch (error) {
    console.error('Error updating sub task completion:', error);
    throw new Error('하위 작업 상태 변경에 실패했습니다.');
  }
};

/**
 * 반복 설정이 유효한지 검증하는 함수
 * @param repeatCycle - 검증할 반복 설정
 * @returns 유효성 검증 결과
 */
export const validateRepeatCycle = (repeatCycle: string): boolean => {
  const weekdays = ['월', '화', '수', '목', '금', '토', '일'] as const;
  const weekOrders = ['첫째주', '둘째주', '셋째주', '넷째주', '마지막주'] as const;

  const validPatterns = [
    /^매일$/,
    /^\d+일마다$/,
    new RegExp(`^매주 (${weekdays.join('|')})$`),
    /^매달 \d+일$/,
    new RegExp(`^매달 (${weekOrders.join('|')}) (${weekdays.join('|')})$`),
  ];

  return validPatterns.some((pattern) => pattern.test(repeatCycle));
};
