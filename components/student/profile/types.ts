export interface EnrolledSubjectItem {
  id: string;
  subject: string;
  currentGrade?: string;
  targetGrade?: string;
}

export interface StudentStats {
  totalHoursLearned: number;
  classesCompleted: number;
  activeTutorsCount: number;
  attendanceRate: number; // e.g. 98%
  currentStreakDays: number;
}

export interface NotificationPreferences {
  emailReminders: boolean;
  whatsappAlerts: boolean;
  classStartNoticeMinutes: number; // 15, 30, 60
}

/**
 * 1-to-1 Reflection of PostgreSQL Database Schema
 * (users table + student_profiles table + Supabase Auth user_metadata)
 */
export interface StudentProfileData {
  // Identity (public.users table in PostgreSQL)
  id: string;
  fullName: string; // matches users.full_name
  email: string; // matches users.email
  role: "student" | "teacher" | "admin";
  avatarUrl: string; // matches users.avatar_url
  phone: string; // matches users.phone

  // Academic Profile (student_profiles table in PostgreSQL)
  academicLevel: string; // matches student_profiles.academic_level
  examinationBoard: string; // matches student_profiles.examination_board
  institution?: string; // matches student_profiles.institution
  targetExamSeries?: string; // matches student_profiles.target_exam_series
  subjects: EnrolledSubjectItem[]; // matches student_profiles.enrolled_subjects (jsonb)

  // Learning Goals & Format (student_profiles table in PostgreSQL)
  primaryGoals: string[]; // matches student_profiles.primary_goals (text[])
  sessionFormat: string; // matches student_profiles.session_format
  customNote?: string; // matches student_profiles.custom_note

  // Optional Guardian Information (student_profiles table in PostgreSQL)
  guardianName?: string; // matches student_profiles.guardian_name
  guardianRelationship?: string; // matches student_profiles.guardian_relationship
  guardianPhone?: string; // matches student_profiles.guardian_phone
  guardianEmail?: string; // matches student_profiles.guardian_email
  isEmergencyContact?: boolean; // matches student_profiles.is_emergency_contact

  // Personal & Location Meta (Supabase Auth user_metadata)
  city?: string;
  country?: string;
  timezone?: string;
  preferredLanguages?: string[];
  dateOfBirth?: string;
  gender?: string;
  tagline?: string;
  bio?: string;
  whatsappNumber?: string;
  preferredLearningStyle?: string;
  availableTimeSlots?: string[];

  // App & Studio State
  stats: StudentStats;
  notifications: NotificationPreferences;
  accountStatus: "active" | "inactive" | "pending";
  accountReference: string;
  memberSince: string;
  lastUpdated: string;
}

export interface StudentProfileCompletionResult {
  percentage: number;
  completedCount: number;
  totalCount: number;
  missingItems: string[];
}

export type StudentProfileErrors = Partial<Record<string, string>>;
