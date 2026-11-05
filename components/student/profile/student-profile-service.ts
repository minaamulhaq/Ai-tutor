import {
  StudentProfileData,
  StudentProfileCompletionResult,
  EnrolledSubjectItem,
} from "./types";
import {
  getStudentProfileAction,
  saveStudentProfileAction,
} from "@/app/actions/student";
import { uploadUserAvatar } from "@/lib/media/avatarStorage";

// ============================================================================
// SYSTEM CATALOGS (ZuhDemy Academic & Student Standards)
// ============================================================================

export const AVAILABLE_ACADEMIC_LEVELS = [
  "O-Levels (Year 10-11)",
  "IGCSE (Year 10-11)",
  "A-Levels (Year 12-13)",
  "Matriculation (9th - 10th)",
  "Intermediate / FSc Pre-Engineering",
  "Intermediate / FSc Pre-Medical",
  "Intermediate / ICS",
  "Middle School (Grade 6-8)",
  "Undergraduate / University",
];

export const AVAILABLE_CURRICULUMS = [
  "Cambridge CAIE",
  "Edexcel International",
  "Federal Board (FBISE)",
  "Punjab Board (BISE Lahore / Rawalpindi)",
  "Sindh Board (BIEK / BSEK)",
  "KPK Board (BISE Peshawar)",
  "International Baccalaureate (IB)",
  "American High School Diploma",
];

export const AVAILABLE_SUBJECTS = [
  "Mathematics (Pure & Mechanics)",
  "Mathematics (Additional / Further)",
  "Physics (A-Level / FSc / IGCSE)",
  "Chemistry (A-Level / FSc / IGCSE)",
  "Computer Science & Programming",
  "Biology (A-Level / Pre-Medical)",
  "English Language & Composition",
  "English Literature",
  "Economics",
  "Accounting & Finance",
  "Business Studies",
  "Statistics & Probability",
  "Urdu Language & Literature",
  "Pakistan Studies & Islamiyat",
  "Sociology",
  "Psychology",
  "Law",
  "World History & Geography",
  "Python & Web Development",
];

export const AVAILABLE_LEARNING_STYLES = [
  "Visual & Diagram-Based",
  "Past Paper & Problem Solving",
  "Concept-First & Theoretical",
  "Interactive Discussion & Step-by-Step",
  "Intensive Exam Revision & Crash Course",
];

export const AVAILABLE_TIME_SLOTS = [
  "Weekday Evenings (4:00 PM - 7:00 PM)",
  "Weekday Nights (7:00 PM - 10:00 PM)",
  "Weekend Mornings (9:00 AM - 1:00 PM)",
  "Weekend Afternoons (2:00 PM - 6:00 PM)",
  "Weekend Evenings (6:00 PM - 10:00 PM)",
];

export const AVAILABLE_LANGUAGES = [
  "English",
  "Urdu",
  "Punjabi",
  "Arabic",
  "French",
  "German",
];

export const AVAILABLE_TIMEZONES = [
  { value: "Asia/Karachi", label: "Asia/Karachi (PKT, UTC+5)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST, UTC+4)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST, UTC+0/+1)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT, UTC-5)" },
  { value: "Asia/Riyadh", label: "Asia/Riyadh (AST, UTC+3)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT, UTC+8)" },
];

export const GRADE_OPTIONS = ["A*", "A", "B", "C", "D", "E", "N/A"];

export const STUDENT_GOAL_OPTIONS = [
  { id: "straight_as", label: "🎯 Aiming for Straight A/A*s", sub: "Top grade academic excellence" },
  { id: "past_papers", label: "📝 Past Paper & Exam Technique", sub: "Solving topical & yearly papers" },
  { id: "entry_test", label: "🚀 University Entry Test Prep", sub: "MDCAT, ECAT, NET, SAT drills" },
  { id: "concept_gaps", label: "💡 Concept Clarity & Basics", sub: "Clear weak foundation doubts" },
  { id: "crash_course", label: "⚡ Rapid Exam Revision", sub: "Fast-paced syllabus coverage" },
  { id: "homework_help", label: "📚 Homework & Weekly Support", sub: "Ongoing test preparation" },
];

// ============================================================================
// INITIAL SEED DATA FOR DEMO STUDENT (SARAH JENKINS)
// ============================================================================

export const INITIAL_STUDENT_PROFILE: StudentProfileData = {
  id: "usr_stud_01",
  fullName: "Sarah Jenkins",
  email: "sarah.jenkins@example.com",
  role: "student",
  avatarUrl:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&auto=format&fit=crop&q=80",
  phone: "+92 321 8492011",
  whatsappNumber: "+92 321 8492011",
  dateOfBirth: "2007-08-14",
  gender: "Female",
  tagline: "High School Senior & Aspiring Software Engineer",
  bio: "Pre-Engineering A-Level student with a strong passion for Mathematics, Computer Science, and Physics. Preparing for Cambridge CAIE May/June exams and upcoming university entrance tests (NUST / FAST).",

  city: "Lahore",
  country: "Pakistan",
  timezone: "Asia/Karachi",
  preferredLanguages: ["English", "Urdu"],

  academicLevel: "A-Levels (Year 12-13)",
  institution: "Beaconhouse College Campus Gulberg",
  examinationBoard: "Cambridge CAIE",
  targetExamSeries: "May / June 2026",
  subjects: [
    {
      id: "subj-01",
      subject: "Computer Science & Programming",
      currentGrade: "A",
      targetGrade: "A*",
    },
    {
      id: "subj-02",
      subject: "Mathematics (Pure & Mechanics)",
      currentGrade: "B",
      targetGrade: "A*",
    },
    {
      id: "subj-03",
      subject: "Physics (A-Level / FSc)",
      currentGrade: "B",
      targetGrade: "A",
    },
  ],

  primaryGoals: [
    "🎯 Aiming for Straight A/A*s",
    "📝 Past Paper & Exam Technique",
    "🚀 University Entry Test Prep",
  ],
  sessionFormat: "1-on-1 Focused Session",
  customNote:
    "Secure straight A*s in Cambridge A-Levels (9618 CS, 9709 Math, 9702 Physics) and achieve a top 5% percentile in FAST-NUCES and NET entry tests.",

  preferredLearningStyle: "Past Paper & Problem Solving",
  availableTimeSlots: [
    "Weekday Evenings (4:00 PM - 7:00 PM)",
    "Weekend Mornings (9:00 AM - 1:00 PM)",
  ],

  guardianName: "Tariq Jenkins",
  guardianRelationship: "Father",
  guardianPhone: "+92 300 4567890",
  guardianEmail: "tariq.jenkins@example.com",
  isEmergencyContact: true,

  stats: {
    totalHoursLearned: 38,
    classesCompleted: 24,
    activeTutorsCount: 3,
    attendanceRate: 98,
    currentStreakDays: 12,
  },

  notifications: {
    emailReminders: true,
    whatsappAlerts: true,
    classStartNoticeMinutes: 15,
  },

  accountStatus: "active",
  accountReference: "ZD-STU-2024-8842",
  memberSince: "October 2024",
  lastUpdated: new Date().toISOString(),
};

// ============================================================================
// PROFILE COMPLETION CALCULATOR
// ============================================================================

export function calculateStudentProfileCompletion(
  profile: StudentProfileData
): StudentProfileCompletionResult {
  const checklist = [
    { name: "Profile Photo", valid: Boolean(profile.avatarUrl) },
    { name: "Full Name & Bio", valid: Boolean(profile.fullName && profile.bio) },
    { name: "Contact & Phone", valid: Boolean(profile.email && (profile.phone || profile.whatsappNumber)) },
    { name: "City & Country", valid: Boolean(profile.city && profile.country) },
    { name: "Academic Level & School", valid: Boolean(profile.academicLevel && profile.institution) },
    { name: "Target Exam Board", valid: Boolean(profile.examinationBoard && profile.targetExamSeries) },
    { name: "Enrolled Subjects", valid: profile.subjects.length > 0 },
    { name: "Learning Goals", valid: profile.primaryGoals.length > 0 },
    { name: "Session Format", valid: Boolean(profile.sessionFormat) },
    { name: "Available Time Slots", valid: (profile.availableTimeSlots?.length || 0) > 0 },
  ];

  const completedCount = checklist.filter((item) => item.valid).length;
  const totalCount = checklist.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  const missingItems = checklist.filter((item) => !item.valid).map((item) => item.name);

  return {
    percentage,
    completedCount,
    totalCount,
    missingItems,
  };
}

// ============================================================================
// DYNAMIC DATABASE DATA SERVICE (LIVE POSTGRESQL + SUPABASE)
// ============================================================================

const STORAGE_KEY = "zuhdemy_student_profile_data";

export async function apiFetchStudentProfile(): Promise<StudentProfileData> {
  try {
    const actionResult = await getStudentProfileAction();

    if (actionResult.success && actionResult.user) {
      const { user, studentProfile, metadata } = actionResult;

      // 1. Full Name directly from public.users table
      const fullName = (user.fullName || metadata.full_name || "Student").trim();

      // 2. Map enrolled subjects from database or metadata fallback
      const dbSubjects = studentProfile?.enrolledSubjects || [];
      const subjects: EnrolledSubjectItem[] =
        Array.isArray(dbSubjects) && dbSubjects.length > 0
          ? dbSubjects.map((sub: any, idx: number) => ({
              id: sub.id || `subj-${idx}-${Date.now()}`,
              subject: sub.subject || "General Science",
              currentGrade: sub.currentGrade || "B",
              targetGrade: sub.targetGrade || "A*",
            }))
          : Array.isArray(metadata.subjects) && metadata.subjects.length > 0
          ? (metadata.subjects as string[]).map((subName: string, idx: number) => ({
              id: `subj-meta-${idx}`,
              subject: subName,
              currentGrade: "B",
              targetGrade: "A*",
            }))
          : [];

      // 3. Learning goals array from student_profiles.primaryGoals
      const primaryGoals =
        studentProfile?.primaryGoals && studentProfile.primaryGoals.length > 0
          ? studentProfile.primaryGoals
          : Array.isArray(metadata.primaryGoals) && metadata.primaryGoals.length > 0
          ? (metadata.primaryGoals as string[])
          : ["🎯 Aiming for Straight A/A*s", "📝 Past Paper & Exam Technique"];

      // 4. Construct live StudentProfileData directly matching database tables
      const liveProfile: StudentProfileData = {
        id: user.id,
        fullName,
        email: user.email || "",
        role: (user.role as any) || "student",
        avatarUrl: user.avatarUrl || metadata.avatar_url || "",
        phone: user.phone || metadata.phone || "",
        whatsappNumber: metadata.whatsappNumber || user.phone || "",
        dateOfBirth: metadata.dateOfBirth || "",
        gender: metadata.gender || "Prefer not to say",
        tagline:
          metadata.tagline ||
          `${studentProfile?.academicLevel || metadata.academicLevel || "Student"} • ${studentProfile?.examinationBoard || metadata.examinationBoard || "Cambridge CAIE"}`,
        bio:
          metadata.bio ||
          `Enrolled student preparing for ${studentProfile?.academicLevel || metadata.academicLevel || "examinations"}. Dedicated to academic excellence with ZuhDemy expert tutors.`,

        city: metadata.city || "Lahore",
        country: metadata.country || "Pakistan",
        timezone: metadata.timezone || "Asia/Karachi",
        preferredLanguages: metadata.preferredLanguages || ["English", "Urdu"],

        academicLevel:
          studentProfile?.academicLevel || metadata.academicLevel || "A-Levels (Year 12-13)",
        examinationBoard:
          studentProfile?.examinationBoard || metadata.examinationBoard || "Cambridge CAIE",
        institution:
          studentProfile?.institution || metadata.institution || "College / High School",
        targetExamSeries:
          studentProfile?.targetExamSeries || metadata.targetExamYear || "May / June 2026",
        subjects,

        primaryGoals,
        sessionFormat:
          studentProfile?.sessionFormat || metadata.preferredLearningFormat || "1-on-1 Focused Session",
        customNote: studentProfile?.customNote || metadata.customNote || "",

        guardianName: studentProfile?.guardianName || metadata.guardianName || "",
        guardianRelationship: studentProfile?.guardianRelationship || metadata.guardianRelationship || "Father",
        guardianPhone: studentProfile?.guardianPhone || metadata.guardianPhone || "",
        guardianEmail: studentProfile?.guardianEmail || metadata.guardianEmail || "",
        isEmergencyContact: studentProfile?.isEmergencyContact ?? Boolean(metadata.isEmergencyContact ?? false),

        preferredLearningStyle:
          metadata.preferredLearningStyle || "Past Paper & Problem Solving",
        availableTimeSlots: metadata.availableTimeSlots || [
          "Weekday Evenings (4:00 PM - 7:00 PM)",
          "Weekend Mornings (9:00 AM - 1:00 PM)",
        ],

        stats: {
          totalHoursLearned: metadata.stats?.totalHoursLearned ?? 0,
          classesCompleted: metadata.stats?.classesCompleted ?? 0,
          activeTutorsCount: metadata.stats?.activeTutorsCount ?? 0,
          attendanceRate: metadata.stats?.attendanceRate ?? 100,
          currentStreakDays: metadata.stats?.currentStreakDays ?? 1,
        },

        notifications: metadata.notifications || {
          emailReminders: true,
          whatsappAlerts: true,
          classStartNoticeMinutes: 15,
        },

        accountStatus: "active",
        accountReference: `ZD-STU-${user.id.slice(0, 8).toUpperCase()}`,
        memberSince: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          : "October 2024",
        lastUpdated: new Date().toISOString(),
      };

      // Cache locally for instant loading
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(liveProfile));
        } catch {
          // Ignore storage quota
        }
      }

      return liveProfile;
    }
  } catch (err) {
    console.warn("apiFetchStudentProfile: server action error, trying local cache:", err);
  }

  // Fallback to local cache if offline or unauthenticated
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore JSON parse error
    }
  }

  return INITIAL_STUDENT_PROFILE;
}

export async function apiUpdateStudentProfile(
  updated: StudentProfileData
): Promise<StudentProfileData> {
  const enrolledSubjects = (updated.subjects || []).map((s) => ({
    subject: s.subject,
    currentGrade: s.currentGrade,
    targetGrade: s.targetGrade,
  }));

  const result = await saveStudentProfileAction({
    fullName: updated.fullName,
    phone: updated.phone,
    avatarUrl: updated.avatarUrl,
    whatsappNumber: updated.whatsappNumber,
    city: updated.city,
    country: updated.country,
    timezone: updated.timezone,
    preferredLanguages: updated.preferredLanguages,
    dateOfBirth: updated.dateOfBirth,
    gender: updated.gender,
    tagline: updated.tagline,
    bio: updated.bio,

    academicLevel: updated.academicLevel,
    examinationBoard: updated.examinationBoard,
    institution: updated.institution,
    targetExamSeries: updated.targetExamSeries,
    enrolledSubjects,
    primaryGoals: updated.primaryGoals || [],
    sessionFormat: updated.sessionFormat,
    customNote: updated.customNote,
    preferredLearningStyle: updated.preferredLearningStyle,
    availableTimeSlots: updated.availableTimeSlots,

    guardianName: updated.guardianName || undefined,
    guardianRelationship: updated.guardianRelationship || undefined,
    guardianPhone: updated.guardianPhone || undefined,
    guardianEmail: updated.guardianEmail || undefined,
    isEmergencyContact: updated.isEmergencyContact,

    notifications: updated.notifications,
  });

  if (!result.success) {
    throw new Error(result.error || "Failed to update profile");
  }

  const dataWithTimestamp: StudentProfileData = {
    ...updated,
    lastUpdated: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
    } catch {
      // localStorage quota or error
    }
  }

  return dataWithTimestamp;
}

export async function apiResetStudentProfile(): Promise<StudentProfileData> {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
  return apiFetchStudentProfile();
}

export async function apiUploadStudentAvatar(file: File): Promise<string> {
  const result = await uploadUserAvatar(file, "student");
  return result.url;
}
