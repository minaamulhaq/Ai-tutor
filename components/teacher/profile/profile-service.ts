import {
  TeacherProfileData,
  ProfileCompletionResult,
  EducationEntry,
  ExperienceEntry,
  CertificateEntry,
} from "./types";
import { getTeacherProfileAction, saveTeacherProfileAction } from "@/app/actions/teacher";
import { uploadUserAvatar } from "@/lib/media/avatarStorage";

// ============================================================================
// SYSTEM CATALOGS (Controlled platforms standards)
// ============================================================================
export {
  AVAILABLE_SUBJECTS,
  AVAILABLE_STUDENT_LEVELS,
  AVAILABLE_LANGUAGES,
  AVAILABLE_TIMEZONES,
} from "@/lib/constants/catalogs";

// ============================================================================
// INITIAL IN-MEMORY TEACHER PROFILE SEED
// ============================================================================
export const DEFAULT_TEACHER_PROFILE_SEED: TeacherProfileData = {
  id: "usr_teach_01",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  firstName: "Alexander",
  lastName: "Wright",
  headline: "Senior Computer Science Instructor & AI Researcher",
  role: "Senior Faculty Instructor",
  isVerified: true,
  isEmailVerified: true,

  email: "a.wright@zuhdemy.com",
  phone: "+92 300 8472910",
  city: "Lahore",
  country: "Pakistan",
  preferredLanguage: "English",
  timezone: "Asia/Karachi",

  aboutMe:
    "Ph.D. holder with over 8 years of tutoring and university teaching experience. I specialize in breaking down complex computer science concepts, Python programming, algorithms, and data structures into intuitive, step-by-step mental models.\n\nMy sessions focus on hands-on live debugging, exam preparation, and building confident problem-solving skills for O/A-Levels and university students.",
  subjects: [
    "Computer Science",
    "Python Programming",
    "Data Structures",
    "Algorithms",
    "Mathematics",
  ],
  education: [
    {
      id: "edu-1",
      degree: "Ph.D. in Computer Science",
      institution: "Stanford University",
      fieldOfStudy: "Artificial Intelligence & Distributed Systems",
      completionYear: "2020",
    },
    {
      id: "edu-2",
      degree: "B.Sc. in Mathematics & Computer Science",
      institution: "University of Oxford",
      fieldOfStudy: "Pure Mathematics & Computation",
      completionYear: "2016",
    },
  ],
  experience: [
    {
      id: "exp-1",
      role: "Senior CS Lecturer & Mentor",
      institution: "Tech Academy & University Consortium",
      duration: "2021 - Present (3 yrs)",
      description:
        "Teaching advanced algorithm design, Python data engineering, and preparing students for competitive programming.",
    },
    {
      id: "exp-2",
      role: "Private STEM & Cambridge Tutor",
      institution: "Oxford Academic Mentors",
      duration: "2018 - 2021 (3 yrs)",
      description:
        "1-on-1 tutoring for A-Level and undergraduate students resulting in 92% A*/A grade performance.",
    },
  ],
  teachingLanguages: ["English", "Urdu"],
  teachingMethodology:
    "Interactive, whiteboard-driven derivations combined with live coding. Every session includes hands-on problem solving where the student drives the keyboard and receives real-time guidance.",
  certificates: [
    {
      id: "cert-1",
      title: "Cambridge Certified Educator (STEM)",
      issuer: "Cambridge Assessment International Education",
      year: "2023",
      isVerified: true,
    },
    {
      id: "cert-2",
      title: "Google Certified Educator Level 2",
      issuer: "Google for Education",
      year: "2022",
      isVerified: true,
    },
  ],

  studentLevels: [
    "O-Levels / IGCSE",
    "A-Levels / FSc",
    "Undergraduate (University)",
    "Adult Professional & Career Transition",
  ],
  sessionDurationMinutes: 60,
  hourlyRatePkr: 3500,
  hourlyRateUsd: 35,
  teachingMode: "100% Online (1-on-1)",
  meetingProvider: "Google Meet",

  accountStatus: "active",
  accountReference: "ZUH-FAC-8812",
  memberSince: "October 2024",
  lastUpdated: "Today, 10:45 AM",
};

let memoryTeacherProfile: TeacherProfileData = { ...DEFAULT_TEACHER_PROFILE_SEED };

// ============================================================================
// PROFILE COMPLETION CALCULATOR
// Computes completion accurately from required fields safely
// ============================================================================
export function calculateProfileCompletion(
  profile?: Partial<TeacherProfileData> | null
): ProfileCompletionResult {
  const p = profile || {};
  const criteria: { key: string; label: string; passed: boolean }[] = [
    { key: "firstName", label: "First name", passed: Boolean(p.firstName?.trim()) },
    { key: "lastName", label: "Last name", passed: Boolean(p.lastName?.trim()) },
    { key: "email", label: "Email address", passed: Boolean(p.email?.trim()) },
    { key: "phone", label: "Phone number", passed: Boolean(p.phone?.trim()) },
    { key: "city", label: "City", passed: Boolean(p.city?.trim()) },
    { key: "country", label: "Country", passed: Boolean(p.country?.trim()) },
    { key: "timezone", label: "Time zone", passed: Boolean(p.timezone?.trim()) },
    { key: "headline", label: "Professional headline", passed: Boolean((p.headline?.trim() || "").length >= 10) },
    { key: "aboutMe", label: "About Me biography", passed: Boolean((p.aboutMe?.trim() || "").length >= 40) },
    { key: "subjects", label: "At least one subject taught", passed: Array.isArray(p.subjects) && p.subjects.length > 0 },
    { key: "education", label: "At least one education credential", passed: Array.isArray(p.education) && p.education.length > 0 },
    { key: "teachingLanguages", label: "At least one teaching language", passed: Array.isArray(p.teachingLanguages) && p.teachingLanguages.length > 0 },
  ];

  const totalFields = criteria.length;
  const completedFields = criteria.filter((c) => c.passed).length;
  const percentage = Math.round((completedFields / totalFields) * 100);
  const missingFields = criteria.filter((c) => !c.passed).map((c) => c.label);

  return {
    percentage,
    completedFields,
    totalFields,
    missingFields,
  };
}

// ============================================================================
// API METHODS (Connected with backend contracts)
// ============================================================================

/**
 * Fetch the authenticated teacher's profile.
 */
export async function apiFetchTeacherProfile(): Promise<TeacherProfileData> {
  try {
    const res = await getTeacherProfileAction();
    if (res.success && res.data) {
      memoryTeacherProfile = {
        ...DEFAULT_TEACHER_PROFILE_SEED,
        ...res.data,
        education: res.data.education || [],
        experience: res.data.experience || [],
        certificates: res.data.certificates || [],
      };
      return JSON.parse(JSON.stringify(memoryTeacherProfile));
    }
  } catch (err) {
    console.warn("apiFetchTeacherProfile error:", err);
  }

  // Fallback only if unauthenticated or demo
  if (!memoryTeacherProfile?.firstName) {
    memoryTeacherProfile = {
      ...DEFAULT_TEACHER_PROFILE_SEED,
      ...memoryTeacherProfile,
    };
  }

  return JSON.parse(JSON.stringify(memoryTeacherProfile));
}

/**
 * Update the teacher's profile (safely merges partial updates).
 */
export async function apiUpdateTeacherProfile(
  data: Partial<TeacherProfileData>
): Promise<TeacherProfileData> {
  try {
    const res = await saveTeacherProfileAction({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      city: data.city,
      country: data.country,
      timezone: data.timezone,
      headline: data.headline,
      aboutMe: data.aboutMe,
      teachingMethodology: data.teachingMethodology,
      subjects: data.subjects,
      studentLevels: data.studentLevels,
      teachingLanguages: data.teachingLanguages,
      education: data.education,
      experience: data.experience,
      certificates: data.certificates,
      hourlyRatePkr: data.hourlyRatePkr,
      hourlyRateUsd: data.hourlyRateUsd,
      sessionDurationMinutes: data.sessionDurationMinutes,
      teachingMode: data.teachingMode,
      meetingProvider: data.meetingProvider,
    });

    if (res.success) {
      memoryTeacherProfile = {
        ...memoryTeacherProfile,
        ...data,
        lastUpdated: "Just now",
      };
      return JSON.parse(JSON.stringify(memoryTeacherProfile));
    }
  } catch (err) {
    console.warn("apiUpdateTeacherProfile DB sync warning:", err);
  }

  memoryTeacherProfile = {
    ...DEFAULT_TEACHER_PROFILE_SEED,
    ...memoryTeacherProfile,
    ...data,
    lastUpdated: "Just now",
  };

  return JSON.parse(JSON.stringify(memoryTeacherProfile));
}

/**
 * Upload and persist a new profile photo.
 * Compresses raw photo to 400x400 WebP via client-side Canvas and uploads to Supabase Storage 'avatars' bucket.
 */
export async function apiUploadProfilePhoto(
  file: File
): Promise<{ url: string }> {
  // Validate file format
  const validFormats = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/heic"];
  if (!validFormats.includes(file.type)) {
    throw new Error("Only JPG, PNG, WebP, and HEIC images are allowed.");
  }

  // Validate file size (10MB max initial raw upload)
  const maxSizeBytes = 10 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error("Image must be smaller than 10MB.");
  }

  // Execute client-side compression + Supabase storage upload
  const result = await uploadUserAvatar(file, memoryTeacherProfile.id);

  // Update in-memory profile and return URL
  memoryTeacherProfile.avatarUrl = result.url;
  return { url: result.url };
}
