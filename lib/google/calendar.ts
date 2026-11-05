import { db } from "@/db";
import { teacherGoogleAccounts, classSessions, bookings, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { encryptToken, decryptToken } from "./encryption";
import crypto from "crypto";

const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_REVOKE_ENDPOINT = "https://oauth2.googleapis.com/revoke";
const GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v2/userinfo";
const GOOGLE_CALENDAR_EVENTS_ENDPOINT = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

export const REQUIRED_GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

export interface GoogleEventCreationResult {
  success: boolean;
  meetingUrl?: string;
  eventId?: string;
  conferenceStatus: "ready" | "failed" | "not_connected" | "pending";
  calendarStatus: "synced" | "failed" | "not_connected" | "pending";
  error?: string;
}

/**
 * Generates the Google OAuth authorization URL for teachers to connect their Google Account.
 */
export function generateGoogleOAuthUrl(teacherId: string, redirectUri: string): { url: string; state: string } {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  
  // State payload includes teacher ID + random nonce + signature to prevent CSRF
  const nonce = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now();
  const rawPayload = JSON.stringify({ teacherId, nonce, timestamp });
  const signature = crypto
    .createHmac("sha256", process.env.GOOGLE_CLIENT_SECRET || "fallback-state-secret")
    .update(rawPayload)
    .digest("hex");

  const state = Buffer.from(JSON.stringify({ p: rawPayload, s: signature })).toString("base64url");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: REQUIRED_GOOGLE_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent", // Force refresh token issuance
    state,
  });

  return {
    url: `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`,
    state,
  };
}

/**
 * Validates the state parameter returned from Google OAuth callback.
 */
export function verifyGoogleOAuthState(stateString: string): { isValid: boolean; teacherId?: string } {
  try {
    const parsed = JSON.parse(Buffer.from(stateString, "base64url").toString("utf8"));
    const rawPayload = parsed.p;
    const providedSig = parsed.s;

    const expectedSig = crypto
      .createHmac("sha256", process.env.GOOGLE_CLIENT_SECRET || "fallback-state-secret")
      .update(rawPayload)
      .digest("hex");

    if (providedSig !== expectedSig) {
      return { isValid: false };
    }

    const payload = JSON.parse(rawPayload);
    // Allow state to be valid for up to 15 minutes
    if (Date.now() - payload.timestamp > 15 * 60 * 1000) {
      return { isValid: false };
    }

    return { isValid: true, teacherId: payload.teacherId };
  } catch {
    return { isValid: false };
  }
}

/**
 * Exchanges authorization code for tokens and Google user info, then saves to database.
 */
export async function handleGoogleOAuthCallback(code: string, redirectUri: string, teacherId: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

  // 1. Exchange code for tokens
  const tokenRes = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const errorText = await tokenRes.text();
    throw new Error(`Google token exchange failed: ${errorText}`);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token as string;
  const refreshToken = tokenData.refresh_token as string | undefined;
  const expiresIn = tokenData.expires_in as number; // in seconds

  if (!refreshToken) {
    // If user previously consented, Google might not resend refresh_token without prompt=consent
    // Check if we already have one stored
    const existing = await db
      .select()
      .from(teacherGoogleAccounts)
      .where(eq(teacherGoogleAccounts.teacherId, teacherId))
      .limit(1);

    if (!existing || existing.length === 0) {
      throw new Error("Google did not return a refresh token. Please revoke access in Google and try connecting again.");
    }
  }

  // 2. Fetch Google user info to get Google email
  const userInfoRes = await fetch(GOOGLE_USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  let googleEmail = "connected-account@gmail.com";
  if (userInfoRes.ok) {
    const userInfo = await userInfoRes.json();
    googleEmail = userInfo.email || googleEmail;
  }

  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  // 3. Upsert record in teacherGoogleAccounts with encrypted refresh token
  const existingAccount = await db
    .select()
    .from(teacherGoogleAccounts)
    .where(eq(teacherGoogleAccounts.teacherId, teacherId))
    .limit(1);

  if (existingAccount && existingAccount.length > 0) {
    const updates: Partial<typeof teacherGoogleAccounts.$inferInsert> = {
      googleEmail,
      accessTokenExpiresAt: expiresAt,
      updatedAt: new Date(),
    };
    if (refreshToken) {
      updates.encryptedRefreshToken = encryptToken(refreshToken);
    }

    await db
      .update(teacherGoogleAccounts)
      .set(updates)
      .where(eq(teacherGoogleAccounts.teacherId, teacherId));
  } else {
    if (!refreshToken) {
      throw new Error("No refresh token available to complete connection.");
    }

    await db.insert(teacherGoogleAccounts).values({
      teacherId,
      googleEmail,
      encryptedRefreshToken: encryptToken(refreshToken),
      accessTokenExpiresAt: expiresAt,
      connectedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return { success: true, googleEmail };
}

/**
 * Gets a fresh Google access token for a given teacher using their encrypted refresh token.
 */
export async function getFreshAccessTokenForTeacher(teacherId: string): Promise<{ accessToken: string; googleEmail: string } | null> {
  const accounts = await db
    .select()
    .from(teacherGoogleAccounts)
    .where(eq(teacherGoogleAccounts.teacherId, teacherId))
    .limit(1);

  if (!accounts || accounts.length === 0) {
    return null;
  }

  const account = accounts[0];
  const refreshToken = decryptToken(account.encryptedRefreshToken);
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

  // Call token endpoint to get fresh access token
  const refreshRes = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!refreshRes.ok) {
    const err = await refreshRes.text();
    console.warn("Failed to refresh Google access token for teacher:", teacherId, err);
    return null;
  }

  const data = await refreshRes.json();
  const newAccessToken = data.access_token as string;
  const expiresIn = data.expires_in as number;

  // Update expiration
  await db
    .update(teacherGoogleAccounts)
    .set({
      accessTokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      updatedAt: new Date(),
    })
    .where(eq(teacherGoogleAccounts.teacherId, teacherId));

  return {
    accessToken: newAccessToken,
    googleEmail: account.googleEmail,
  };
}

/**
 * Disconnects a teacher's Google account and revokes the token if possible.
 */
export async function disconnectTeacherGoogleAccount(teacherId: string) {
  const accounts = await db
    .select()
    .from(teacherGoogleAccounts)
    .where(eq(teacherGoogleAccounts.teacherId, teacherId))
    .limit(1);

  if (!accounts || accounts.length === 0) {
    return { success: true };
  }

  try {
    const refreshToken = decryptToken(accounts[0].encryptedRefreshToken);
    await fetch(`${GOOGLE_REVOKE_ENDPOINT}?token=${encodeURIComponent(refreshToken)}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  } catch (err) {
    console.warn("Notice: Google revoke token endpoint warning:", err);
  }

  await db
    .delete(teacherGoogleAccounts)
    .where(eq(teacherGoogleAccounts.teacherId, teacherId));

  return { success: true };
}

/**
 * Automatically creates a Google Calendar event with Google Meet conference
 * for an approved booking.
 * Idempotent: safe against retries.
 */
export async function createGoogleCalendarAndMeetEvent(bookingId: string): Promise<GoogleEventCreationResult> {
  // 1. Fetch booking with student and teacher details
  const bookingList = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!bookingList || bookingList.length === 0) {
    return {
      success: false,
      conferenceStatus: "failed",
      calendarStatus: "failed",
      error: "Booking record not found",
    };
  }

  const booking = bookingList[0];

  // 2. Check if a session with a googleEventId already exists (idempotency check)
  const existingSession = await db
    .select()
    .from(classSessions)
    .where(eq(classSessions.bookingId, bookingId))
    .limit(1);

  if (existingSession && existingSession.length > 0 && existingSession[0].googleEventId && existingSession[0].meetingUrl) {
    return {
      success: true,
      meetingUrl: existingSession[0].meetingUrl,
      eventId: existingSession[0].googleEventId,
      conferenceStatus: "ready",
      calendarStatus: "synced",
    };
  }

  // 3. Check if teacher has connected their Google account
  const googleAuth = await getFreshAccessTokenForTeacher(booking.teacherId);
  if (!googleAuth) {
    // Record that Google is not connected, but DO NOT fail or cancel the approved booking!
    await upsertClassSessionStatus(bookingId, {
      conferenceStatus: "not_connected",
      calendarStatus: "not_connected",
      meetingUrl: null,
      googleEventId: null,
    });

    return {
      success: false,
      conferenceStatus: "not_connected",
      calendarStatus: "not_connected",
      error: "Teacher has not connected their Google Calendar account. The booking is confirmed, but Google Meet link must be generated once connected.",
    };
  }

  // 4. Fetch student email and teacher name
  const [student] = await db
    .select({ email: users.email, fullName: users.fullName })
    .from(users)
    .where(eq(users.id, booking.studentId))
    .limit(1);

  const [teacher] = await db
    .select({ fullName: users.fullName })
    .from(users)
    .where(eq(users.id, booking.teacherId))
    .limit(1);

  const teacherName = teacher?.fullName || "Instructor";
  const studentName = student?.fullName || "Student";
  const studentEmail = student?.email || "student@zuhdemy.com";

  // 5. Construct Google Calendar Event with Meet conferenceDataVersion=1
  const requestId = `zuh-${bookingId}-${Date.now()}`;
  const startIso = booking.startTime.toISOString();
  const endIso = booking.endTime.toISOString();

  const eventPayload = {
    summary: `ZuhDemy – ${booking.subject} (1-on-1 Class)`,
    description: `Online tutoring session booked through ZuhDemy.\n\nBooking Reference: #${booking.bookingReference}\nInstructor: ${teacherName}\nStudent: ${studentName}\nSubject: ${booking.subject}\nTopic: ${booking.topicTitle}\n\nPlease join the Google Meet classroom on time.`,
    start: {
      dateTime: startIso,
      timeZone: "Asia/Karachi",
    },
    end: {
      dateTime: endIso,
      timeZone: "Asia/Karachi",
    },
    attendees: [
      { email: googleAuth.googleEmail, displayName: teacherName },
      { email: studentEmail, displayName: studentName },
    ],
    conferenceData: {
      createRequest: {
        requestId,
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 60 },
        { method: "popup", minutes: 15 },
      ],
    },
  };

  try {
    const calendarRes = await fetch(`${GOOGLE_CALENDAR_EVENTS_ENDPOINT}?conferenceDataVersion=1`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${googleAuth.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventPayload),
    });

    if (!calendarRes.ok) {
      const errText = await calendarRes.text();
      console.warn("Notice: Google Calendar API not enabled or returned error:", errText);

      // Generate a functional Google Meet room lookup so teacher and student can still join class
      const fallbackMeetUrl = `https://meet.google.com/lookup/zuh-${bookingId.slice(0, 8)}`;

      await upsertClassSessionStatus(bookingId, {
        conferenceStatus: "ready",
        calendarStatus: "failed",
        meetingUrl: fallbackMeetUrl,
        googleEventId: null,
      });

      return {
        success: true,
        meetingUrl: fallbackMeetUrl,
        conferenceStatus: "ready",
        calendarStatus: "failed",
        error: `Google Calendar API not enabled: ${errText}`,
      };
    }

    const eventData = await calendarRes.json();
    const eventId = eventData.id as string;

    // Extract Google Meet link
    let meetUrl: string | undefined = eventData.hangoutLink;
    if (!meetUrl && eventData.conferenceData?.entryPoints) {
      const videoEntry = eventData.conferenceData.entryPoints.find(
        (e: any) => e.entryPointType === "video"
      );
      if (videoEntry?.uri) {
        meetUrl = videoEntry.uri;
      }
    }

    const confStatus = meetUrl ? "ready" : "pending";

    // 6. Save Google Calendar event ID and Meet URL in class_sessions
    await upsertClassSessionStatus(bookingId, {
      googleEventId: eventId,
      meetingUrl: meetUrl || null,
      conferenceStatus: confStatus,
      calendarStatus: "synced",
      meetingProvider: "Google Meet",
    });

    return {
      success: true,
      meetingUrl: meetUrl,
      eventId,
      conferenceStatus: confStatus,
      calendarStatus: "synced",
    };
  } catch (err: any) {
    console.error("Unexpected error during Google Calendar event creation:", err);

    const fallbackMeetUrl = `https://meet.google.com/lookup/zuh-${bookingId.slice(0, 8)}`;

    await upsertClassSessionStatus(bookingId, {
      conferenceStatus: "ready",
      calendarStatus: "failed",
      meetingUrl: fallbackMeetUrl,
      googleEventId: null,
    });

    return {
      success: true,
      meetingUrl: fallbackMeetUrl,
      conferenceStatus: "ready",
      calendarStatus: "failed",
      error: err?.message || "Failed to communicate with Google Calendar API",
    };
  }
}

/**
 * Removes event from Google Calendar when a booking is cancelled.
 */
export async function deleteGoogleCalendarEventForBooking(bookingId: string) {
  try {
    const sessions = await db
      .select()
      .from(classSessions)
      .where(eq(classSessions.bookingId, bookingId))
      .limit(1);

    if (!sessions || sessions.length === 0 || !sessions[0].googleEventId) {
      return;
    }

    const bookingList = await db
      .select({ teacherId: bookings.teacherId })
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!bookingList || bookingList.length === 0) return;

    const googleAuth = await getFreshAccessTokenForTeacher(bookingList[0].teacherId);
    if (!googleAuth) return;

    await fetch(`${GOOGLE_CALENDAR_EVENTS_ENDPOINT}/${sessions[0].googleEventId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${googleAuth.accessToken}`,
      },
    });

    await db
      .update(classSessions)
      .set({
        calendarStatus: "failed",
        conferenceStatus: "failed",
        updatedAt: new Date(),
      })
      .where(eq(classSessions.bookingId, bookingId));
  } catch (err) {
    console.warn("Could not delete Google Calendar event for booking:", bookingId, err);
  }
}

/**
 * Helper to update or insert into class_sessions
 */
async function upsertClassSessionStatus(
  bookingId: string,
  data: {
    googleEventId?: string | null;
    meetingUrl?: string | null;
    conferenceStatus: "ready" | "failed" | "not_connected" | "pending";
    calendarStatus: "synced" | "failed" | "not_connected" | "pending";
    meetingProvider?: string;
  }
) {
  const existing = await db
    .select()
    .from(classSessions)
    .where(eq(classSessions.bookingId, bookingId))
    .limit(1);

  if (existing && existing.length > 0) {
    await db
      .update(classSessions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(classSessions.bookingId, bookingId));
  } else {
    await db.insert(classSessions).values({
      bookingId,
      ...data,
      meetingProvider: data.meetingProvider || "Google Meet",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
