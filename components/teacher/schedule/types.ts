export type { DayOfWeek, GeneratedSlot } from "@/db/schema";


export interface TimeSlot {
  id: string;
  startTime: string; // "09:00" in 24h
  endTime: string;   // "13:00" in 24h
  generatedSlots?: GeneratedSlot[];
}

export interface DaySchedule {
  day: DayOfWeek;
  label: string;
  isEnabled: boolean;
  slots: TimeSlot[];
}

export interface AvailabilityOverviewStats {
  activeDaysCount: number;
  totalWeeklyHours: number;
  totalSlotsCount: number;
  upcomingBookedClassesCount: number;
  nextBookedClass?: {
    studentName: string;
    topic: string;
    date: string;
    startTime: string;
    endTime: string;
  };
}

export interface BlockedDate {
  id: string;
  date: string; // "YYYY-MM-DD"
  reason: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
}

export interface TimezoneOption {
  id: string;
  label: string;
  utcOffset: string;
  displayName: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  conflictingSlot?: TimeSlot;
  conflictingDay?: DayOfWeek;
}

