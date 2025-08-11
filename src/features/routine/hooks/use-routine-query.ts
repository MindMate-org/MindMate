/**
 * 루틴 조회 관련 커스텀 훅
 */

import { useState, useEffect } from 'react';

import { RoutineQueryOptions } from '../db/routine-db-types';
import { fetchGetRoutines, fetchGetRoutineById } from '../services';
import { RoutineType } from '../types';

/**
 * 루틴 목록 조회 훅
 */
export const useRoutineQuery = (options: RoutineQueryOptions = {}) => {
  const [routines, setRoutines] = useState<RoutineType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchRoutines = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchGetRoutines(options);
      setRoutines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '루틴 목록을 가져오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, [options.date, options.limit, options.offset, refreshKey]);

  return {
    routines,
    isLoading,
    error,
    refetch: fetchRoutines,
    forceRefresh: () => setRefreshKey((prev) => prev + 1),
  };
};

/**
 * 루틴 상세 조회 훅
 */
export const useRoutineDetailQuery = (id: string | null) => {
  const [routine, setRoutine] = useState<RoutineType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutine = async () => {
    if (!id) {
      setRoutine(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchGetRoutineById(id);
      setRoutine(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '루틴 상세 정보를 가져오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutine();
  }, [id]);

  return {
    routine,
    isLoading,
    error,
    refetch: fetchRoutine,
  };
};
