export interface Schedule {
  id: number;
  title: string;
  contents?: string;
  time: string; // ISO string format
  location?: string;
  companion?: string;
  is_completed: number; // 0 or 1 (SQLite boolean)
  alarm_id?: string;
  image_id?: string;
  created_at: string;
}

export interface Alarm {
  id: number;
  schedule_id: number;
  date: string; // ISO date string
  time: number; // minutes before the scheduled time
  created_at: string;
}

export interface CreateScheduleData {
  title: string;
  contents?: string;
  time: string;
  location?: string;
  companion?: string;
  alarm_id?: string;
  image_id?: string;
}

export interface UpdateScheduleData extends Partial<CreateScheduleData> {
  is_completed?: number;
}
