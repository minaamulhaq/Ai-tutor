import { db } from "@/db";
import { teacherAvailabilities, bookings, users, teacherProfiles } from "@/db/schema";
import { eq, and, sql, or } from "drizzle-orm";
import { ensureBookingSystemSchema } from "@/lib/db/init";

export interface AvailableSlotResult {
  id: string;
  startTime: string; // "14:00" in 24h
  endTime: string;   // "15:00" in 24h
  displayTime: string; // "02:00 PM – 03:00 PM"
  startIso: string;
  endIso: string;
  durationMinutes: number;
  isAvailable: boolean;
  status: "available" | "reserved_pending" | "booked_confirmed" | "past";
}

const DAY_OF_WEEK_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

/**
 * Automatically cleans up stale pending requests older than 24 hours
 * so abandoned student requests don't lock slots permanently.
 */
export async function expireStalePendingRequests() {
  await ensureBookingSystemSchema();
  try {
    await db.execute(sql`
      UPDATE bookings
      SET status = 'cancelled',
          cancellation_reason = 'Request automatically expired after 24 hours without teacher response.',
          cancelled_at = now(),
          updated_at = now()
      WHERE status = 'pending'
        AND created_at < (now() - INTERVAL '24 hours');
    `);
  } catch (err) {
    console.warn("Notice: expireStalePendingRequests warning:", err);
  }
}

/**
 * Formats 24h string "14:00" to "02:00 PM"
 */
export function format24To12Hour(time24: string): string {
  if (!time24) return "";
  const trimmed = String(time24).trim();
  if (/AM|PM/i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.includes("T")) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Karachi",
      }).format(d);
    }
  }
  const parts = trimmed.split(":");
  let h = parseInt(parts[0], 10);
  let m = parseInt(parts[1] || "0", 10);
  if (isNaN(h)) h = 0;
  if (isNaN(m)) m = 0;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  const minStr = m < 10 ? `0${m}` : `${m}`;
  const hourStr = h12 < 10 ? `0${h12}` : `${h12}`;
  return `${hourStr}:${minStr} ${period}`;
}

/**
 * Gets all generated 1-hour slots for a specific date, checked against teacher availability
 * and filtered against existing confirmed bookings and active pending requests.
 */
export async function getTeacherAvailabilityForDate(
  teacherId: string,
  dateStr: string // "YYYY-MM-DD"
): Promise<{
  date: string;
  dayOfWeek: string;
  timezone: string;
  slots: AvailableSlotResult[];
  hourlyRatePkr: number;
}> {
  await ensureBookingSystemSchema();
  await expireStalePendingRequests();

  // 1. Fetch teacher profile for pricing
  const [profile] = await db
    .select({ hourlyRatePkr: teacherProfiles.hourlyRatePkr })
    .from(teacherProfiles)
    .where(eq(teacherProfiles.userId, teacherId))
    .limit(1);

  const hourlyRatePkr = profile?.hourlyRatePkr || 2500;

  // 2. Parse target date and day of week
  const [yearStr, monthStr, dayNumStr] = dateStr.split("-");
  const targetDate = new Date(Date.UTC(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayNumStr, 10)));
  const dayIndex = targetDate.getUTCDay();
  const dayOfWeek = DAY_OF_WEEK_NAMES[dayIndex];

  // 3. Query teacher availability for this day of week
  const availabilities = await db
    .select()
    .from(teacherAvailabilities)
    .where(
      and(
        eq(teacherAvailabilities.teacherId, teacherId),
        eq(teacherAvailabilities.dayOfWeek, dayOfWeek),
        eq(teacherAvailabilities.isActive, true)
      )
    );

  // 4. Query existing bookings for this teacher overlapping this date
  // Start of day and end of day in PKT (UTC+5)
  const dayStartIso = `${dateStr}T00:00:00+05:00`;
  const dayEndIso = `${dateStr}T23:59:59+05:00`;

  const existingBookings = await db
    .select({
      id: bookings.id,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      status: bookings.status,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.teacherId, teacherId),
        or(eq(bookings.status, "pending"), eq(bookings.status, "confirmed")),
        sql`(${bookings.startTime} < ${dayEndIso}::timestamptz AND ${bookings.endTime} > ${dayStartIso}::timestamptz)`
      )
    );

  const results: AvailableSlotResult[] = [];
  const now = new Date();

  // If teacher has explicitly set generated slots in teacherAvailabilities:
  for (const avail of availabilities) {
    let rawSlots = avail.slots;

    // If slots array is empty or not generated yet, generate 1-hour slots from startTime to endTime
    if (!rawSlots || rawSlots.length === 0) {
      const [startH] = avail.startTime.split(":").map(Number);
      const [endH] = avail.endTime.split(":").map(Number);
      rawSlots = [];
      for (let h = startH; h < endH; h++) {
        const sTime = `${h < 10 ? `0${h}` : h}:00`;
        const eTime = `${h + 1 < 10 ? `0${h + 1}` : h + 1}:00`;
        rawSlots.push({
          id: `slot-${h}`,
          startTime: sTime,
          endTime: eTime,
          durationMinutes: 60,
        });
      }
    }

    for (const slot of rawSlots) {
      // Build ISO strings in Asia/Karachi (UTC+5)
      const slotStartIso = `${dateStr}T${slot.startTime}:00+05:00`;
      const slotEndIso = `${dateStr}T${slot.endTime}:00+05:00`;
      const slotStartDate = new Date(slotStartIso);
      const slotEndDate = new Date(slotEndIso);

      // Check if past
      const isPast = slotStartDate.getTime() <= now.getTime();

      // Check conflict with existing active bookings
      let conflictStatus: "available" | "reserved_pending" | "booked_confirmed" | "past" = "available";

      if (isPast) {
        conflictStatus = "past";
      } else {
        const conflict = existingBookings.find((b) => {
          const bStart = new Date(b.startTime).getTime();
          const bEnd = new Date(b.endTime).getTime();
          const sStart = slotStartDate.getTime();
          const sEnd = slotEndDate.getTime();
          // Overlap condition: bStart < sEnd && bEnd > sStart
          return bStart < sEnd && bEnd > sStart;
        });

        if (conflict) {
          conflictStatus = conflict.status === "confirmed" ? "booked_confirmed" : "reserved_pending";
        }
      }

      const displayTime = `${format24To12Hour(slot.startTime)} – ${format24To12Hour(slot.endTime)}`;

      results.push({
        id: `${dateStr}_${slot.startTime}`,
        startTime: slot.startTime,
        endTime: slot.endTime,
        displayTime,
        startIso: slotStartIso,
        endIso: slotEndIso,
        durationMinutes: slot.durationMinutes || 60,
        isAvailable: conflictStatus === "available",
        status: conflictStatus,
      });
    }
  }

  // Fallback defaults if teacher has no availability records created yet
  if (results.length === 0) {
    const defaultHours = [14, 15, 16, 17, 18, 19, 20];
    for (const h of defaultHours) {
      const sTime = `${h}:00`;
      const eTime = `${h + 1}:00`;
      const slotStartIso = `${dateStr}T${sTime}:00+05:00`;
      const slotEndIso = `${dateStr}T${eTime}:00+05:00`;
      const slotStartDate = new Date(slotStartIso);
      const slotEndDate = new Date(slotEndIso);
      const isPast = slotStartDate.getTime() <= now.getTime();

      let conflictStatus: "available" | "reserved_pending" | "booked_confirmed" | "past" = isPast ? "past" : "available";

      if (!isPast) {
        const conflict = existingBookings.find((b) => {
          const bStart = new Date(b.startTime).getTime();
          const bEnd = new Date(b.endTime).getTime();
          return bStart < slotEndDate.getTime() && bEnd > slotStartDate.getTime();
        });
        if (conflict) {
          conflictStatus = conflict.status === "confirmed" ? "booked_confirmed" : "reserved_pending";
        }
      }

      results.push({
        id: `${dateStr}_${sTime}`,
        startTime: sTime,
        endTime: eTime,
        displayTime: `${format24To12Hour(sTime)} – ${format24To12Hour(eTime)}`,
        startIso: slotStartIso,
        endIso: slotEndIso,
        durationMinutes: 60,
        isAvailable: conflictStatus === "available",
        status: conflictStatus,
      });
    }
  }

  // Sort slots by time
  results.sort((a, b) => a.startTime.localeCompare(b.startTime));

  return {
    date: dateStr,
    dayOfWeek,
    timezone: "Asia/Karachi",
    slots: results,
    hourlyRatePkr,
  };
}

/**
 * Concurrency protection: verifies that a requested time slot is not already
 * reserved by an active pending or confirmed booking for this teacher.
 * Executed immediately before creating or approving a booking.
 */
export async function assertNoBookingConflict(
  teacherId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
): Promise<{ hasConflict: boolean; message?: string }> {
  await ensureBookingSystemSchema();

  const startIso = startTime.toISOString();
  const endIso = endTime.toISOString();

  const conditions = [
    eq(bookings.teacherId, teacherId),
    or(eq(bookings.status, "pending"), eq(bookings.status, "confirmed")),
    sql`(${bookings.startTime} < ${endIso}::timestamptz AND ${bookings.endTime} > ${startIso}::timestamptz)`,
  ];

  if (excludeBookingId) {
    conditions.push(sql`${bookings.id} != ${excludeBookingId}::uuid`);
  }

  const conflicting = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      reference: bookings.bookingReference,
    })
    .from(bookings)
    .where(and(...conditions))
    .limit(1);

  if (conflicting && conflicting.length > 0) {
    const isConfirmed = conflicting[0].status === "confirmed";
    return {
      hasConflict: true,
      message: isConfirmed
        ? "This time slot has already been confirmed with another student."
        : "Another student has an active pending request for this time slot. Please choose another slot.",
    };
  }

  return { hasConflict: false };
}
