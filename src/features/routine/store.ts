/**
 * 루틴 관련 Zustand 상태 관리
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { RoutineType } from './types';

type RoutineStore = {
  // 상태
  routines: RoutineType[];
  selectedDate: string;
  isLoading: boolean;
  error: string | null;

  // 액션
  setRoutines: (routines: RoutineType[]) => void;
  setSelectedDate: (date: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addRoutine: (routine: RoutineType) => void;
  updateRoutine: (id: string, routine: Partial<RoutineType>) => void;
  removeRoutine: (id: string) => void;
  clearError: () => void;
};

export const useRoutineStore = create<RoutineStore>()(
  subscribeWithSelector(
    immer((set) => ({
      // 초기 상태
      routines: [],
      selectedDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD 형식
      isLoading: false,
      error: null,

      // 액션 - Immer를 사용하여 불변성 유지하면서 코드 단순화
      setRoutines: (routines) =>
        set((state) => {
          state.routines = routines;
        }),

      setSelectedDate: (selectedDate) =>
        set((state) => {
          state.selectedDate = selectedDate;
        }),

      setLoading: (isLoading) =>
        set((state) => {
          state.isLoading = isLoading;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
        }),

      addRoutine: (routine) =>
        set((state) => {
          state.routines.push(routine);
        }),

      updateRoutine: (id, updatedRoutine: Partial<RoutineType>) =>
        set((state) => {
          const index = state.routines.findIndex((routine: RoutineType) => routine.id === id);
          if (index !== -1) {
            Object.assign(state.routines[index], updatedRoutine);
          }
        }),

      removeRoutine: (id: string) =>
        set((state) => {
          state.routines = state.routines.filter((routine: RoutineType) => routine.id !== id);
        }),

      clearError: () =>
        set((state) => {
          state.error = null;
        }),
    })),
  ),
);

// Selector 훅들 - 컴포넌트에서 필요한 상태만 구독하도록 최적화
export const useRoutines = () => useRoutineStore((state) => state.routines);
export const useSelectedDate = () => useRoutineStore((state) => state.selectedDate);
export const useRoutineLoading = () => useRoutineStore((state) => state.isLoading);
export const useRoutineError = () => useRoutineStore((state) => state.error);

// 액션만 가져오는 훅 (상태 변경 시 리렌더링 방지)
export const useRoutineActions = () =>
  useRoutineStore((state) => ({
    setRoutines: state.setRoutines,
    setSelectedDate: state.setSelectedDate,
    setLoading: state.setLoading,
    setError: state.setError,
    addRoutine: state.addRoutine,
    updateRoutine: state.updateRoutine,
    removeRoutine: state.removeRoutine,
    clearError: state.clearError,
  }));
