# ZuhDemy – Complete Booking & Automated Google Meet Integration Guide

This document details the production-ready Booking Management and Automated Google Meet Integration system built for ZuhDemy.

---

## 1. System Architecture & End-to-End Workflow

```
[Student: Teacher Discovery / Profile]
         │
         ▼  (1) Select Date (Asia/Karachi) -> Fetch live 1-hour slots from DB
[Calendar & Slot Picker]
         │
         ▼  (2) Opens Booking Summary Modal -> Submit Request
[submitBookingRequestAction]
         │
         ├──> Concurrency check (assertNoBookingConflict)
         ├──> Insert booking with status: 'pending' (Escrow holding)
         └──> In-App Notifications dispatched to Teacher & Student
         │
         ▼  (3) Teacher receives booking request in Dashboard
[Teacher Classes: Pending Tab]
         │
         ├──> Teacher clicks "Approve Request" (approveBookingRequestAction)
         │           │
         │           ├──> Re-validates availability atomically
         │           ├──> Updates status to 'confirmed'
         │           ├──> Triggers Google Calendar API (events.insert with conferenceDataVersion=1)
         │           ├──> Generates unique Google Meet conference link
         │           ├──> Saves google_event_id & meeting_url into class_sessions
         │           └──> Dispatches notifications with direct Meet link
         │
         └──> Teacher clicks "Decline Request" (rejectBookingRequestAction)
                     │
                     ├──> Updates status to 'rejected' with reason
                     ├──> Releases reserved 1-hour slot immediately
                     └──> Notifies student & unlocks platform escrow
```

---

## 2. Key Components & Implementation Files

### Database & Schema
- **[`db/schema.ts`](file:///e:/MVP_PROJECT/team_project/db/schema.ts)**:
  - `bookings`: Includes `studentId`, `teacherId`, `startTime`, `endTime`, `hourlyRate`, `totalAmount`, `status` (`pending`, `confirmed`, `rejected`, `completed`, `cancelled`), `rejectionReason`, `approvedAt`, `rejectedAt`.
  - `classSessions`: Contains `googleEventId`, `meetingUrl`, `conferenceStatus` (`pending`, `ready`, `failed`, `not_connected`), `calendarStatus` (`pending`, `synced`, `failed`, `not_connected`).
  - `teacherGoogleAccounts`: Server-only table storing `encryptedRefreshToken`, `googleEmail`, `accessTokenExpiresAt`.
  - `notifications`: User in-app notifications with read status and booking references.
- **[`lib/db/init.ts`](file:///e:/MVP_PROJECT/team_project/lib/db/init.ts)**:
  - `ensureBookingSystemSchema()` safely applies DDL migrations and creates performance indexes.

### Google OAuth & Calendar Integration
- **[`lib/google/encryption.ts`](file:///e:/MVP_PROJECT/team_project/lib/google/encryption.ts)**:
  - AES-256-GCM symmetric encryption for Google refresh tokens at rest with IV and auth tag verification.
- **[`lib/google/calendar.ts`](file:///e:/MVP_PROJECT/team_project/lib/google/calendar.ts)**:
  - Google OAuth 2.0 PKCE / HMAC-signed anti-CSRF state validation.
  - `createGoogleCalendarAndMeetEvent`: Calls Google Calendar API `events.insert` with `conferenceDataVersion=1` and `conferenceSolutionKey: { type: "hangoutsMeet" }` to generate genuine Google Meet meeting links.
  - Automatic token refresh via Google OAuth token endpoint.
  - Safe retry logic and calendar deletion on cancellation.
- **API Routes**:
  - `GET /api/teacher/google/connect`: Redirects teacher to Google consent screen requesting offline access and `https://www.googleapis.com/auth/calendar.events`.
  - `GET /api/teacher/google/callback`: Securely exchanges authorization code, encrypts refresh token, and stores connection in `teacher_google_accounts`.
  - `DELETE /api/teacher/google/disconnect`: Revokes and deletes Google account connection.

### Availability & Slot Engine
- **[`services/bookingAvailabilityService.ts`](file:///e:/MVP_PROJECT/team_project/services/bookingAvailabilityService.ts)**:
  - Calculates 1-hour slots strictly in `Asia/Karachi` (UTC+5).
  - Overlap prevention: `(start_time < new_end_time AND end_time > new_start_time)` for all active `pending` and `confirmed` bookings.
  - `expireStalePendingRequests()`: Automatically expires unresponded booking requests older than 24 hours to prevent slot starvation.

### UI Integration
- **Teacher Detail & Booking Page (`app/student/teachers/[id]/page.tsx`)**:
  - Live slot query via `getTeacherSlotsForDateAction`.
  - Displays available, reserved (pending), and booked slots.
  - Comprehensive **Booking Summary Modal** with subject selector, date/time in Asia/Karachi, pricing, escrow notice, and Submit Request action.
- **Teacher Classes View (`components/teacher/classes/classes-view.tsx`)**:
  - Approve Request: Confirms booking and generates real Google Meet link.
  - Decline Request: Records rejection reason and frees time slot.
- **Student My Classes (`app/student/classes/page.tsx` & `components/student/classes/class-card.tsx`)**:
  - Dedicated "Pending Approval" tab with "Cancel Request" action.
  - "Upcoming" tab with activated "Join Class Now" Google Meet link.
  - "Cancelled & Declined" tab with clear rejection reason display.
- **Notification Dropdown (`components/notifications/notifications-dropdown.tsx`)**:
  - Integrated into both `components/student/student-header.tsx` and `components/teacher/teacher-header.tsx`.
  - Real-time unread badges and one-click navigation to relevant class dashboards.
- **Teacher Settings Google Tab (`components/teacher/settings/settings-view.tsx`)**:
  - "Google Calendar & Meet" settings tab with "Connect Google Account" and "Disconnect" actions.

---

## 3. Environment Variables Configuration

Copy `.env.example` into `.env` (or `.env.local`) and configure:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-key
DATABASE_URL=postgresql://postgres:...

# Google OAuth (Obtained from Google Cloud Console -> APIs & Services)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/teacher/google/callback

# 32-byte secret encryption key for AES-256-GCM token storage
GOOGLE_TOKEN_ENCRYPTION_KEY=zuhdemy_secure_32_byte_secret_key_123

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Google Cloud Console Setup Steps
1. Navigate to [Google Cloud Console](https://console.cloud.google.com).
2. Create or select your Google Cloud project.
3. Under **APIs & Services -> Library**, enable **Google Calendar API**.
4. Under **APIs & Services -> OAuth consent screen**:
   - Choose User Type: **External**.
   - Add scopes: `https://www.googleapis.com/auth/calendar.events` and `https://www.googleapis.com/auth/userinfo.email`.
   - Add test users (teacher Google accounts) during development.
5. Under **APIs & Services -> Credentials**:
   - Create **OAuth client ID** -> Web application.
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/teacher/google/callback`

---

## 4. End-to-End Verification Checklist

| Step | Action | Expected Result |
|---|---|---|
| 1 | Student discovers teacher on `/student/teachers/[id]` | Teacher info, subjects, hourly rate, and weekly calendar render smoothly. |
| 2 | Student selects a future date | Available 1-hour slots are loaded dynamically from Supabase in `Asia/Karachi` time. |
| 3 | Student picks a slot and clicks "Book 1-on-1 Class" | Booking Summary Modal opens showing teacher, subject, slot, duration, price, and escrow disclaimer. |
| 4 | Student submits request | Booking created with `status: pending`. Slot becomes marked as "Pending Approval". Notifications dispatched. |
| 5 | Teacher navigates to `/teacher/classes` -> Pending tab | Request appears with student info, requested slot, and "Accept Request" / "Decline" buttons. |
| 6 | Teacher approves request | Booking atomically confirmed. Google Calendar event with Google Meet link is created and saved to `class_sessions`. |
| 7 | Student checks `/student/classes` -> Upcoming tab | Class shows as Confirmed Session with green "Join Class Now" Google Meet link. |
| 8 | Teacher checks `/teacher/classes` -> Upcoming tab | Class shows as Confirmed with active Google Meet link. |
| 9 | Teacher declines a request | Booking marked `status: rejected`, rejection reason recorded, and slot is instantly freed for others. |
| 10 | Double-booking attempt | If two students attempt the same slot concurrently, the second receives an atomic concurrency conflict error. |
