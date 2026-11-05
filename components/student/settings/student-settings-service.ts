import { StudentSettingsState } from "./types";
import {
  getStudentSettingsAction,
  updateStudentSettingsAction,
} from "@/app/actions/student";

export const INITIAL_STUDENT_SETTINGS: StudentSettingsState = {
  firstName: "Student",
  lastName: "",
  email: "",
  phone: "",
  whatsappNumber: "",
  timezone: "Asia/Karachi",
  language: "English",
  parentEmailNotificationCopy: true,

  twoFactorEnabled: false,
  twoFactorMethod: "sms",
  sessions: [
    {
      id: "sess_1",
      device: "Current Browser Session",
      browser: "Chrome / WebKit",
      location: "Pakistan",
      ipAddress: "Active now",
      isCurrent: true,
      lastActive: "Active now",
    },
  ],

  emailLessonReminders: true,
  emailWeeklyDigest: true,
  whatsappClassAlerts: true,
  whatsappTutorMessages: true,
  promotionalAnnouncements: false,
  reminderNoticeMinutes: 15,

  profileVisibility: "tutors_only",
  showTargetGradesToTutors: true,
  allowDirectMessagesFromTutors: true,

  preferredCurrency: "PKR",
  billingEmail: "",
  defaultPaymentMethod: "JazzCash",
};

const STORAGE_KEY = "zuhdemy_student_settings_data";

export async function apiFetchStudentSettings(): Promise<StudentSettingsState> {
  try {
    const res = await getStudentSettingsAction();
    if (res.success && res.settings) {
      return res.settings;
    }
  } catch (err) {
    console.warn("apiFetchStudentSettings database notice:", err);
  }

  // Graceful fallback to stored or initial settings if offline
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
  }
  return INITIAL_STUDENT_SETTINGS;
}

export async function apiUpdateStudentSettings(
  settings: StudentSettingsState
): Promise<StudentSettingsState> {
  try {
    const res = await updateStudentSettingsAction(settings);
    if (res.success && res.settings) {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(res.settings));
        } catch {}
      }
      return res.settings;
    }
  } catch (err) {
    console.warn("apiUpdateStudentSettings database notice:", err);
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }
  return settings;
}

export async function apiResetStudentSettings(): Promise<StudentSettingsState> {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
  return await apiFetchStudentSettings();
}

export function downloadStudentDataJSON(settings: StudentSettingsState) {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    platform: "ZuhDemy Online Tutoring",
    accountType: "Student",
    studentData: settings,
  };

  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute(
    "download",
    `zuhdemy-student-data-${Date.now()}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
