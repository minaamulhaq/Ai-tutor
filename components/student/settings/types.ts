export type StudentSettingsNavId =
  | "account"
  | "security"
  | "notifications"
  | "privacy"
  | "billing"
  | "danger";

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  isCurrent: boolean;
  lastActive: string;
}

export interface StudentSettingsState {
  // Account Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  timezone: string;
  language: string;
  parentEmailNotificationCopy: boolean;

  // Security Settings
  twoFactorEnabled: boolean;
  twoFactorMethod: "sms" | "authenticator";
  sessions: ActiveSession[];

  // Notification Preferences
  emailLessonReminders: boolean;
  emailWeeklyDigest: boolean;
  whatsappClassAlerts: boolean;
  whatsappTutorMessages: boolean;
  promotionalAnnouncements: boolean;
  reminderNoticeMinutes: number; // 15, 30, 60

  // Privacy & Safety
  profileVisibility: "tutors_only" | "private";
  showTargetGradesToTutors: boolean;
  allowDirectMessagesFromTutors: boolean;

  // Billing & Currency
  preferredCurrency: "PKR" | "USD";
  billingEmail: string;
  defaultPaymentMethod: "JazzCash" | "EasyPaisa" | "Credit / Debit Card";
}

export type StudentSettingsErrors = Partial<Record<string, string>>;
