/**
 * 루틴 변경 관련 커스텀 훅
 */

import { useState } from 'react';

import {
  fetchCreateRoutine,
  fetchUpdateRoutine,
  fetchDeleteRoutine,
  updateSubTaskCompletion,
} from '../services';
import { CreateRoutinePayload, UpdateRoutinePayload, RoutineType } from '../types';

/**
 * 루틴 생성 훅
 */
export const useCreateRoutine = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoutine = async (payload: CreateRoutinePayload): Promise<RoutineType | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchCreateRoutine(payload);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : '루틴 생성에 실패했습니다.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createRoutine,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};

/**
 * 루틴 수정 훅
 */
export const useUpdateRoutine = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRoutine = async (payload: UpdateRoutinePayload): Promise<RoutineType | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchUpdateRoutine(payload);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : '루틴 수정에 실패했습니다.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateRoutine,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};

/**
 * 루틴 삭제 훅
 */
export const useDeleteRoutine = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteRoutine = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await fetchDeleteRoutine(id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '루틴 삭제에 실패했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteRoutine,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};

/**
 * 하위 작업 완료 상태 변경 훅
 */
export const useUpdateSubTaskCompletion = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCompletion = async (subTaskId: string, isCompleted: boolean): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await updateSubTaskCompletion(subTaskId, isCompleted);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '하위 작업 상태 변경에 실패했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateCompletion,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
