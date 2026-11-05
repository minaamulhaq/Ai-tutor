import { pgTable, uuid, text, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * 1. Users Table
 * 
 * Synchronized with Supabase Auth (auth.users).
 * Stores public profile and core identity information.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // References Supabase auth.users.id
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role", { enum: ["student", "teacher", "admin"] })
    .default("student")
    .notNull(),
  avatarUrl: text("avatar_url"),
  phone: text("phone"),
  refreshToken: text("refresh_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Typed structure for enrolled subject standing and target grade
 */
export interface EnrolledSubject {
  subject: string;
  currentGrade?: string;
  targetGrade?: string;
}

/**
 * 2. Student Profiles Table
 * 
 * 1-to-1 extension table for student-specific academic standing,
 * goal chips, exam syllabus, and optional guardian contacts.
 */
export const studentProfiles = pgTable("student_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),

  // School & Examination Board
  academicLevel: text("academic_level").notNull(), // e.g. "A-Levels (Year 12-13)", "O-Levels", "Matric"
  examinationBoard: text("examination_board").notNull(), // e.g. "Cambridge CAIE", "Federal Board (FBISE)"
  institution: text("institution"), // e.g. "Beaconhouse College Campus Gulberg"
  targetExamSeries: text("target_exam_series"), // e.g. "May / June 2026"

  // Enrolled Subjects & Target Grades (stored as structured JSON array for instant 1-query fetch)
  enrolledSubjects: jsonb("enrolled_subjects").$type<EnrolledSubject[]>().default([]).notNull(),

  // Learning Goals & Style (Zero-typing chips + optional note)
  primaryGoals: text("primary_goals").array().default([]).notNull(), // e.g. ["Aiming for Straight A/A*s", "Past Paper Practice"]
  sessionFormat: text("session_format").default("1-on-1 Focused Session").notNull(),
  customNote: text("custom_note"),

  // Parent / Guardian Information (100% Optional)
  guardianName: text("guardian_name"),
  guardianRelationship: text("guardian_relationship"), // e.g. "Father", "Mother", "Guardian"
  guardianPhone: text("guardian_phone"),
  guardianEmail: text("guardian_email"),
  isEmergencyContact: boolean("is_emergency_contact").default(false),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * 2b. Student Favorites Table
 * Tracks teachers saved by students for quick booking and re-enrollment.
 */
export const studentFavorites = pgTable("student_favorites", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  teacherId: uuid("teacher_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Typed structures for Teacher Profile
 */
export interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  fieldOfStudy?: string;
  completionYear?: string;
}

export interface ExperienceEntry {
  id: string;
  role: string;
  institution: string;
  duration?: string;
  description?: string;
}

export interface CertificateEntry {
  id: string;
  title: string;
  issuer: string;
  year?: string;
  isVerified?: boolean;
}

/**
 * 3. Teacher Profiles Table
 * 
 * 1-to-1 extension table for verified teacher credentials,
 * hourly rates, subject competencies, and teaching methodology.
 */
export const teacherProfiles = pgTable("teacher_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),

  // Professional Headline & Bio
  headline: text("headline").notNull(),
  aboutMe: text("about_me"),
  teachingMethodology: text("teaching_methodology"),

  // Subjects, Levels, Languages (Arrays)
  subjects: text("subjects").array().default([]).notNull(),
  studentLevels: text("student_levels").array().default([]).notNull(),
  teachingLanguages: text("teaching_languages").array().default([]).notNull(),

  // Pricing & Preferences
  hourlyRatePkr: integer("hourly_rate_pkr").default(2500).notNull(),
  hourlyRateUsd: integer("hourly_rate_usd").default(25),
  sessionDurationMinutes: integer("session_duration_minutes").default(60).notNull(),
  teachingMode: text("teaching_mode").default("100% Online (1-on-1)").notNull(),
  meetingProvider: text("meeting_provider").default("Google Meet").notNull(),

  // Experience & Credentials (JSONB arrays)
  experienceYears: text("experience_years").default("1-2 Years"),
  education: jsonb("education").$type<EducationEntry[]>().default([]).notNull(),
  experience: jsonb("experience").$type<ExperienceEntry[]>().default([]).notNull(),
  certificates: jsonb("certificates").$type<CertificateEntry[]>().default([]).notNull(),

  // Location & Contact Extras
  city: text("city").default("Lahore"),
  country: text("country").default("Pakistan"),
  timezone: text("timezone").default("Asia/Karachi"),

  // Verification & Status
  isVerified: boolean("is_verified").default(false),
  accountStatus: text("account_status", { enum: ["active", "suspended", "pending"] })
    .default("active")
    .notNull(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * 4. Teacher Availabilities Table
 * 
 * Stores weekly teaching availability windows and generated 1-hour slots
 * for 1-on-1 private classes on ZuhDemy.
 */
export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface GeneratedSlot {
  id: string;
  startTime: string; // "09:00" in 24h
  endTime: string;   // "10:00" in 24h
  durationMinutes: number; // 60
}


export const teacherAvailabilities = pgTable("teacher_availabilities", {
  id: uuid("id").defaultRandom().primaryKey(),
  teacherId: uuid("teacher_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  dayOfWeek: text("day_of_week", {
    enum: [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ],
  }).notNull(),
  startTime: text("start_time").notNull(), // "09:00" (24h)
  endTime: text("end_time").notNull(),     // "13:00" (24h)
  timezone: text("timezone").default("Asia/Karachi").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  slots: jsonb("slots").$type<GeneratedSlot[]>().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// DRIZZLE RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  studentProfile: one(studentProfiles, {
    fields: [users.id],
    references: [studentProfiles.userId],
  }),
  teacherProfile: one(teacherProfiles, {
    fields: [users.id],
    references: [teacherProfiles.userId],
  }),
  availabilities: many(teacherAvailabilities),
}));

export const studentProfilesRelations = relations(studentProfiles, ({ one }) => ({
  user: one(users, {
    fields: [studentProfiles.userId],
    references: [users.id],
  }),
}));

export const teacherProfilesRelations = relations(teacherProfiles, ({ one }) => ({
  user: one(users, {
    fields: [teacherProfiles.userId],
    references: [users.id],
  }),
}));

export const teacherAvailabilitiesRelations = relations(teacherAvailabilities, ({ one }) => ({
  teacher: one(users, {
    fields: [teacherAvailabilities.teacherId],
    references: [users.id],
  }),
}));

// Inferred TypeScript Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type StudentProfile = typeof studentProfiles.$inferSelect;
export type NewStudentProfile = typeof studentProfiles.$inferInsert;

export type TeacherProfile = typeof teacherProfiles.$inferSelect;
export type NewTeacherProfile = typeof teacherProfiles.$inferInsert;

export type TeacherAvailability = typeof teacherAvailabilities.$inferSelect;
export type NewTeacherAvailability = typeof teacherAvailabilities.$inferInsert;

/**
 * 5. Bookings Table
 * 
 * Stores 1-on-1 private tutoring class bookings between students and teachers.
 */
export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  teacherId: uuid("teacher_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  subject: text("subject").notNull(),
  topicTitle: text("topic_title").default("1-on-1 Class Session").notNull(),
  topicDescription: text("topic_description"),
  bookingReference: text("booking_reference").notNull(), // e.g. "ZUH-BK-8921"
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  durationMinutes: integer("duration_minutes").default(60).notNull(),
  hourlyRate: integer("hourly_rate").default(2500).notNull(),
  totalAmount: integer("total_amount").default(2500).notNull(),
  pricePkr: integer("price_pkr").default(2500).notNull(),
  status: text("status", { enum: ["pending", "confirmed", "rejected", "completed", "cancelled"] })
    .default("pending")
    .notNull(),
  paymentStatus: text("payment_status", { enum: ["pending", "paid", "refunded", "failed"] })
    .default("paid")
    .notNull(),
  rejectionReason: text("rejection_reason"),
  cancellationReason: text("cancellation_reason"),
  cancelledBy: uuid("cancelled_by"),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  rejectedAt: timestamp("rejected_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  hasReview: boolean("has_review").default(false).notNull(),
  studentRating: integer("student_rating"),
  studentReview: text("student_review"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 6. Teacher Google Accounts Table
 * 
 * Stores teacher Google OAuth connection data for Google Calendar events
 * and automated Google Meet link creation.
 * Secure server-only table with encrypted tokens.
 */
export const teacherGoogleAccounts = pgTable("teacher_google_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  teacherId: uuid("teacher_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  googleEmail: text("google_email").notNull(),
  encryptedRefreshToken: text("encrypted_refresh_token").notNull(),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  connectedAt: timestamp("connected_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 7. Class Sessions Table
 * 
 * Stores live meeting links, Google Calendar event IDs, and teacher notes.
 */
export const classSessions = pgTable("class_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .references(() => bookings.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  googleEventId: text("google_event_id"),
  meetingUrl: text("meeting_url"),
  meetingProvider: text("meeting_provider").default("Google Meet").notNull(),
  conferenceStatus: text("conference_status", { enum: ["pending", "ready", "failed", "not_connected"] })
    .default("pending")
    .notNull(),
  calendarStatus: text("calendar_status", { enum: ["pending", "synced", "failed", "not_connected"] })
    .default("pending")
    .notNull(),
  teacherNotes: text("teacher_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 8. In-App Notifications Table
 * 
 * Real-time event notifications for students and teachers.
 */
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type", {
    enum: [
      "booking_requested",
      "booking_approved",
      "booking_rejected",
      "booking_cancelled",
      "meet_ready",
      "calendar_error",
      "reminder",
      "general",
    ],
  }).notNull(),
  relatedBookingId: uuid("related_booking_id").references(() => bookings.id, { onDelete: "set null" }),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// DRIZZLE RELATIONS (EXTENDED)
// ============================================================================

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  student: one(users, {
    fields: [bookings.studentId],
    references: [users.id],
    relationName: "studentBookings",
  }),
  teacher: one(users, {
    fields: [bookings.teacherId],
    references: [users.id],
    relationName: "teacherBookings",
  }),
  session: one(classSessions, {
    fields: [bookings.id],
    references: [classSessions.bookingId],
  }),
  notifications: many(notifications),
}));

export const teacherGoogleAccountsRelations = relations(teacherGoogleAccounts, ({ one }) => ({
  teacher: one(users, {
    fields: [teacherGoogleAccounts.teacherId],
    references: [users.id],
  }),
}));

export const classSessionsRelations = relations(classSessions, ({ one }) => ({
  booking: one(bookings, {
    fields: [classSessions.bookingId],
    references: [bookings.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  booking: one(bookings, {
    fields: [notifications.relatedBookingId],
    references: [bookings.id],
  }),
}));

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;

export type TeacherGoogleAccount = typeof teacherGoogleAccounts.$inferSelect;
export type NewTeacherGoogleAccount = typeof teacherGoogleAccounts.$inferInsert;

export type ClassSessionModel = typeof classSessions.$inferSelect;
export type NewClassSessionModel = typeof classSessions.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

// ============================================================================
// FINANCIAL MANAGEMENT & DOUBLE-ENTRY ACCOUNTING SCHEMA
// ============================================================================

/**
 * 9. Financial Accounts (Chart of Accounts)
 * Represents double-entry nominal ledger accounts.
 */
export const financialAccounts = pgTable("financial_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountCode: text("account_code").notNull().unique(), // e.g. "1010-PROVIDER-REC"
  accountName: text("account_name").notNull(),          // e.g. "Payment Provider Clearing"
  accountType: text("account_type", { enum: ["asset", "liability", "revenue", "expense"] }).notNull(),
  currency: text("currency").default("PKR").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 10. Financial Transactions (Business-Level Events)
 * Captures high-level business events that trigger balanced ledger entries.
 */
export const financialTransactions = pgTable("financial_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
  paymentId: text("payment_id"),
  eventType: text("event_type", {
    enum: [
      "student_payment",
      "teacher_earning_allocated",
      "platform_commission",
      "provider_fee",
      "refund",
      "dispute_hold",
      "dispute_release",
      "adjustment",
    ],
  }).notNull(),
  reference: text("reference").notNull().unique(), // e.g. "TXN-2026-9812"
  currency: text("currency").default("PKR").notNull(),
  description: text("description").notNull(),
  idempotencyKey: text("idempotency_key").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 11. Ledger Entries (Immutable Double-Entry Accounting Records)
 * Every posted transaction MUST have matching debits and credits per currency.
 * Amounts are stored as integer minor units (e.g. 2500 PKR = 250,000 paisas).
 */
export const ledgerEntries = pgTable("ledger_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  transactionId: uuid("transaction_id")
    .references(() => financialTransactions.id, { onDelete: "cascade" })
    .notNull(),
  accountId: uuid("account_id")
    .references(() => financialAccounts.id, { onDelete: "restrict" })
    .notNull(),
  debitAmount: integer("debit_amount").default(0).notNull(),  // Minor currency units
  creditAmount: integer("credit_amount").default(0).notNull(), // Minor currency units
  currency: text("currency").default("PKR").notNull(),
  bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
  teacherId: uuid("teacher_id").references(() => users.id, { onDelete: "set null" }),
  studentId: uuid("student_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 12. Booking Financials (Per-Booking Financial Breakdown)
 * Single authoritative source of truth for payment status, fee splits,
 * teacher earnings status, and 24-hour dispute window timing.
 */
export const bookingFinancials = pgTable("booking_financials", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .references(() => bookings.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  paymentId: text("payment_id"),
  studentId: uuid("student_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  teacherId: uuid("teacher_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  grossAmount: integer("gross_amount").notNull(),               // Minor units (paisa)
  platformCommission: integer("platform_commission").notNull(), // Minor units (paisa)
  providerFee: integer("provider_fee").default(0).notNull(),    // Minor units (paisa)
  teacherNetAmount: integer("teacher_net_amount").notNull(),   // Minor units (paisa)
  currency: text("currency").default("PKR").notNull(),
  paymentStatus: text("payment_status", {
    enum: ["unpaid", "pending", "paid", "failed", "partially_refunded", "refunded"],
  })
    .default("paid")
    .notNull(),
  teacherEarningsStatus: text("teacher_earnings_status", {
    enum: ["not_allocated", "held", "disputed", "eligible", "released"],
  })
    .default("held")
    .notNull(),
  classCompletedAt: timestamp("class_completed_at", { withTimezone: true }),
  disputeDeadline: timestamp("dispute_deadline", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 13. Refund Records
 * Tracks full and partial refunds with payment provider linkages.
 */
export const refundRecords = pgTable("refund_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .references(() => bookings.id, { onDelete: "cascade" })
    .notNull(),
  paymentId: text("payment_id"),
  amount: integer("amount").notNull(), // Minor units (paisa)
  currency: text("currency").default("PKR").notNull(),
  reason: text("reason").notNull(),
  providerRefundId: text("provider_refund_id"),
  status: text("status", { enum: ["pending", "completed", "failed"] })
    .default("completed")
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

/**
 * 14. Disputes
 * Tracks student-teacher disputes, frozen earnings, and administrative resolutions.
 */
export const disputes = pgTable("disputes", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .references(() => bookings.id, { onDelete: "cascade" })
    .notNull(),
  studentId: uuid("student_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  teacherId: uuid("teacher_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  amountHeld: integer("amount_held").notNull(), // Minor units (paisa)
  currency: text("currency").default("PKR").notNull(),
  reason: text("reason").notNull(),
  status: text("status", { enum: ["open", "under_review", "resolved", "rejected"] })
    .default("open")
    .notNull(),
  resolution: text("resolution"),
  resolvedBy: uuid("resolved_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

/**
 * 15. Provider Settlement Reconciliations
 * Stores external provider reconciliation status, balances, and discrepancies.
 */
export const providerSettlements = pgTable("provider_settlements", {
  id: uuid("id").defaultRandom().primaryKey(),
  provider: text("provider").default("polar").notNull(),
  providerBalance: integer("provider_balance").default(0).notNull(), // Minor units
  currency: text("currency").default("PKR").notNull(),
  internalClearingBalance: integer("internal_clearing_balance").default(0).notNull(),
  discrepancy: integer("discrepancy").default(0).notNull(),
  status: text("status", { enum: ["matched", "discrepancy", "pending"] })
    .default("matched")
    .notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }).defaultNow().notNull(),
  rawDetails: jsonb("raw_details"),
});

// ============================================================================
// FINANCIAL RELATIONS
// ============================================================================

export const financialTransactionsRelations = relations(financialTransactions, ({ one, many }) => ({
  booking: one(bookings, {
    fields: [financialTransactions.bookingId],
    references: [bookings.id],
  }),
  entries: many(ledgerEntries),
}));

export const ledgerEntriesRelations = relations(ledgerEntries, ({ one }) => ({
  transaction: one(financialTransactions, {
    fields: [ledgerEntries.transactionId],
    references: [financialTransactions.id],
  }),
  account: one(financialAccounts, {
    fields: [ledgerEntries.accountId],
    references: [financialAccounts.id],
  }),
  booking: one(bookings, {
    fields: [ledgerEntries.bookingId],
    references: [bookings.id],
  }),
  teacher: one(users, {
    fields: [ledgerEntries.teacherId],
    references: [users.id],
    relationName: "teacherLedgerEntries",
  }),
  student: one(users, {
    fields: [ledgerEntries.studentId],
    references: [users.id],
    relationName: "studentLedgerEntries",
  }),
}));

export const bookingFinancialsRelations = relations(bookingFinancials, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingFinancials.bookingId],
    references: [bookings.id],
  }),
  student: one(users, {
    fields: [bookingFinancials.studentId],
    references: [users.id],
    relationName: "studentFinancials",
  }),
  teacher: one(users, {
    fields: [bookingFinancials.teacherId],
    references: [users.id],
    relationName: "teacherFinancials",
  }),
}));

export const refundRecordsRelations = relations(refundRecords, ({ one }) => ({
  booking: one(bookings, {
    fields: [refundRecords.bookingId],
    references: [bookings.id],
  }),
}));

export const disputesRelations = relations(disputes, ({ one }) => ({
  booking: one(bookings, {
    fields: [disputes.bookingId],
    references: [bookings.id],
  }),
  student: one(users, {
    fields: [disputes.studentId],
    references: [users.id],
    relationName: "studentDisputes",
  }),
  teacher: one(users, {
    fields: [disputes.teacherId],
    references: [users.id],
    relationName: "teacherDisputes",
  }),
  resolver: one(users, {
    fields: [disputes.resolvedBy],
    references: [users.id],
    relationName: "resolvedDisputes",
  }),
}));

// Inferred Financial TypeScript Types
export type FinancialAccount = typeof financialAccounts.$inferSelect;
export type NewFinancialAccount = typeof financialAccounts.$inferInsert;

export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type NewFinancialTransaction = typeof financialTransactions.$inferInsert;

export type LedgerEntry = typeof ledgerEntries.$inferSelect;
export type NewLedgerEntry = typeof ledgerEntries.$inferInsert;

export type BookingFinancial = typeof bookingFinancials.$inferSelect;
export type NewBookingFinancial = typeof bookingFinancials.$inferInsert;

export type RefundRecord = typeof refundRecords.$inferSelect;
export type NewRefundRecord = typeof refundRecords.$inferInsert;

export type Dispute = typeof disputes.$inferSelect;
export type NewDispute = typeof disputes.$inferInsert;

export type ProviderSettlement = typeof providerSettlements.$inferSelect;
export type NewProviderSettlement = typeof providerSettlements.$inferInsert;

/**
 * 9. Conversations Table
 * Stores 1-on-1 messaging threads between students and teachers.
 */
export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  teacherId: uuid("teacher_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  lastMessage: text("last_message"),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }).defaultNow().notNull(),
  lastSenderId: uuid("last_sender_id").references(() => users.id, { onDelete: "set null" }),
  unreadStudentCount: integer("unread_student_count").default(0).notNull(),
  unreadTeacherCount: integer("unread_teacher_count").default(0).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 10. Conversation Participants Table
 * Tracks per-user conversation state (pinning, muting, archiving, last read receipt).
 */
export const conversationParticipants = pgTable("conversation_participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .references(() => conversations.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  lastReadAt: timestamp("last_read_at", { withTimezone: true }).defaultNow().notNull(),
  isMuted: boolean("is_muted").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 11. Messages Table
 * Stores real-time chat bubbles, class invites, text, and rich messages.
 */
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .references(() => conversations.id, { onDelete: "cascade" })
    .notNull(),
  senderId: uuid("sender_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  receiverId: uuid("receiver_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  messageType: text("message_type", { enum: ["text", "class_invitation", "file", "image", "system"] })
    .default("text")
    .notNull(),
  status: text("status", { enum: ["sending", "sent", "delivered", "read"] })
    .default("sent")
    .notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  invitationData: jsonb("invitation_data"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 12. Message Attachments Table
 * Stores files, images, PDFs, homework sheets, and document metadata.
 */
export const messageAttachments = pgTable("message_attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  messageId: uuid("message_id")
    .references(() => messages.id, { onDelete: "cascade" })
    .notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(), // "pdf" | "image" | "doc" | "zip" | "other"
  fileSize: integer("file_size").notNull(), // size in bytes
  mimeType: text("mime_type"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Messaging Table Relations
export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  student: one(users, {
    fields: [conversations.studentId],
    references: [users.id],
    relationName: "studentConversations",
  }),
  teacher: one(users, {
    fields: [conversations.teacherId],
    references: [users.id],
    relationName: "teacherConversations",
  }),
  lastSender: one(users, {
    fields: [conversations.lastSenderId],
    references: [users.id],
    relationName: "lastSenderConversation",
  }),
  messages: many(messages),
  participants: many(conversationParticipants),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationParticipants.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [conversationParticipants.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
  attachments: many(messageAttachments),
}));

export const messageAttachmentsRelations = relations(messageAttachments, ({ one }) => ({
  message: one(messages, {
    fields: [messageAttachments.messageId],
    references: [messages.id],
  }),
}));

// Inferred Messaging TypeScript Types
export type ConversationRecord = typeof conversations.$inferSelect;
export type NewConversationRecord = typeof conversations.$inferInsert;

export type ConversationParticipantRecord = typeof conversationParticipants.$inferSelect;
export type NewConversationParticipantRecord = typeof conversationParticipants.$inferInsert;

export type MessageRecord = typeof messages.$inferSelect;
export type NewMessageRecord = typeof messages.$inferInsert;

export type MessageAttachmentRecord = typeof messageAttachments.$inferSelect;
export type NewMessageAttachmentRecord = typeof messageAttachments.$inferInsert;

/**
 * 13. Teacher Student Private Notes
 * Stores private observations, notes, and milestones for students written by the teacher.
 */
export const teacherStudentNotes = pgTable("teacher_student_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  teacherId: uuid("teacher_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  studentId: uuid("student_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const teacherStudentNotesRelations = relations(teacherStudentNotes, ({ one }) => ({
  teacher: one(users, {
    fields: [teacherStudentNotes.teacherId],
    references: [users.id],
  }),
  student: one(users, {
    fields: [teacherStudentNotes.studentId],
    references: [users.id],
  }),
}));

export type TeacherStudentNote = typeof teacherStudentNotes.$inferSelect;
export type NewTeacherStudentNote = typeof teacherStudentNotes.$inferInsert;

/**
 * 14. Teacher Payouts Table
 * Tracks teacher withdrawal requests, settlement states, and payout accounts.
 */
export const teacherPayouts = pgTable("teacher_payouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  teacherId: uuid("teacher_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  referenceId: text("reference_id").notNull(),
  amountPkr: integer("amount_pkr").notNull(),
  method: text("method").notNull(),
  methodLabel: text("method_label").notNull(),
  accountDetails: text("account_details").notNull(),
  status: text("status", { enum: ["processing", "completed", "failed", "pending"] })
    .default("processing")
    .notNull(),
  note: text("note"),
  requestedAt: timestamp("requested_at", { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
});

export const teacherPayoutsRelations = relations(teacherPayouts, ({ one }) => ({
  teacher: one(users, {
    fields: [teacherPayouts.teacherId],
    references: [users.id],
  }),
}));

export type TeacherPayout = typeof teacherPayouts.$inferSelect;
export type NewTeacherPayout = typeof teacherPayouts.$inferInsert;

/**
 * 15. Support Tickets Table
 * Handles student and teacher support inquiries, categories, priorities, and resolutions.
 */
export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  userRole: text("user_role").notNull(), // 'student' | 'teacher' | 'guest'
  name: text("name"),
  email: text("email"),
  category: text("category").notNull(), // 'billing', 'classes', 'technical', 'account', 'general'
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  bookingReference: text("booking_reference"),
  priority: text("priority", { enum: ["low", "normal", "high", "urgent"] })
    .default("normal")
    .notNull(),
  status: text("status", { enum: ["open", "in_progress", "resolved", "closed"] })
    .default("open")
    .notNull(),
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
  }),
}));

export type SupportTicket = typeof supportTickets.$inferSelect;
export type NewSupportTicket = typeof supportTickets.$inferInsert;




