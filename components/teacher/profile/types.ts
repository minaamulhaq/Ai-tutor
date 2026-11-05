import type { EducationEntry, ExperienceEntry, CertificateEntry } from "@/db/schema";

export type { EducationEntry, ExperienceEntry, CertificateEntry };

export interface TeacherProfileData {
  // Overview & Identity
  id: string;
  avatarUrl: string;
  firstName: string;
  lastName: string;
  headline: string;
  role: string;
  isVerified: boolean;
  isEmailVerified: boolean;

  // Personal Information
  email: string;
  phone: string;
  city: string;
  country: string;
  preferredLanguage: string;
  timezone: string;

  // Professional Details
  aboutMe: string;
  subjects: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  teachingLanguages: string[];
  teachingMethodology: string;
  certificates: CertificateEntry[];

  // Teaching Preferences
  studentLevels: string[];
  sessionDurationMinutes: number; // 60 for 1-hour 1-on-1 MVP
  hourlyRatePkr: number; // e.g. 3500 PKR
  hourlyRateUsd?: number; // Optional for future global currency expansion ($35)
  teachingMode: string; // "100% Online (1-on-1)"
  meetingProvider: string; // "Google Meet"

  // Account Information
  accountStatus: "active" | "suspended" | "pending";
  accountReference: string;
  memberSince: string;
  lastUpdated: string;
}

export interface ProfileCompletionResult {
  percentage: number;
  completedFields: number;
  totalFields: number;
  missingFields: string[];
}

export type ProfileFormErrors = Partial<Record<string, string>>;
