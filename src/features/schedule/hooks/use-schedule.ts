import { useFocusEffect } from '@react-navigation/native';
import { useState, useEffect, useCallback } from 'react';

import { fetchGetSchedules, fetchGetSchedulesByDate } from '../services/schedule-services';
import type { ScheduleType } from '../types/schedule-types';

export const useSchedules = () => {
  const [schedules, setSchedules] = useState<ScheduleType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchGetSchedules();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSchedules();
    }, [fetchSchedules]),
  );

  return {
    schedules,
    loading,
    refetch: fetchSchedules,
  };
};

export const useSchedulesByDate = (date: string) => {
  const [schedules, setSchedules] = useState<ScheduleType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedulesByDate = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchGetSchedulesByDate(date);
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules by date:', error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchSchedulesByDate();
  }, [fetchSchedulesByDate]);

  return {
    schedules,
    loading,
    refetch: fetchSchedulesByDate,
  };
};
