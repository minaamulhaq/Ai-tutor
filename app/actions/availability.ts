"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { teacherAvailabilities, GeneratedSlot, DayOfWeek, bookings, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Helper time functions for 24h calculations
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function generateHourlySlots(startTime: string, endTime: string, prefix = "slot"): GeneratedSlot[] {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const slots: GeneratedSlot[] = [];

  for (let curr = start; curr + 60 <= end; curr += 60) {
    const s = minutesToTime(curr);
    const e = minutesToTime(curr + 60);
    slots.push({
      id: `${prefix}-${s.replace(":", "")}-${e.replace(":", "")}`,
      startTime: s,
      endTime: e,
      durationMinutes: 60,
    });
  }

  return slots;
}

const ALL_DAYS: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

/**
 * Ensures table existence in Postgres safely
 */
async function ensureAvailabilityTablesExist() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS teacher_availabilities (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        teacher_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        day_of_week text NOT NULL,
        start_time text NOT NULL,
        end_time text NOT NULL,
        timezone text DEFAULT 'Asia/Karachi' NOT NULL,
        is_active boolean DEFAULT true NOT NULL,
        slots jsonb DEFAULT '[]'::jsonb NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );

      CREATE INDEX IF NOT EXISTS teacher_availabilities_teacher_day_idx 
        ON teacher_availabilities(teacher_id, day_of_week);

      CREATE TABLE IF NOT EXISTS teacher_blocked_dates (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        teacher_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        date text NOT NULL,
        reason text,
        all_day boolean DEFAULT true NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );

      CREATE INDEX IF NOT EXISTS teacher_blocked_dates_teacher_idx 
        ON teacher_blocked_dates(teacher_id, date);
    `);
  } catch (err) {
    console.warn("Table verification notice in availability.ts:", err);
  }
}

export interface DayScheduleData {
  day: DayOfWeek;
  label: string;
  isEnabled: boolean;
  slots: {
    id: string;
    startTime: string;
    endTime: string;
    generatedSlots: GeneratedSlot[];
  }[];
}

export interface BookedClassItem {
  id: string;
  studentName: string;
  studentAvatar: string;
  subject: string;
  dateStr: string; // "YYYY-MM-DD"
  startTime: string;
  endTime: string;
  status: "confirmed" | "completed";
}

export interface BlockedDateItem {
  id: string;
  date: string;
  reason: string;
  allDay: boolean;
}

export interface AvailabilityDashboardData {
  schedule: DayScheduleData[];
  timezone: string;
  stats: {
    activeDaysCount: number;
    totalWeeklyHours: number;
    totalSlotsCount: number;
    upcomingBookedClassesCount: number;
    nextBookedClass?: {
      studentName: string;
      topic: string;
      date: string;
      startTime: string;
      endTime: string;
    };
  };
  blockedDates: BlockedDateItem[];
  bookedClasses: BookedClassItem[];
}

/**
 * Resolves the authenticated teacher's user ID, falling back to default teacher
 */
export async function getEffectiveTeacherId(): Promise<string> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.id) {
      return user.id;
    }
  } catch {}
  return "00000000-0000-0000-0000-000000000002";
}

/**
 * Fetch Current Teacher Availability Schedule & Overview Stats
 */
export async function getTeacherAvailabilityAction(): Promise<{
  success: boolean;
  data?: AvailabilityDashboardData;
  error?: string;
}> {
  try {
    const teacherId = await getEffectiveTeacherId();

    await ensureAvailabilityTablesExist();

    // Query teacher's availability windows
    let dbRows: any[] = [];
    try {
      dbRows = await db
        .select()
        .from(teacherAvailabilities)
        .where(eq(teacherAvailabilities.teacherId, teacherId));
    } catch (queryErr) {
      console.warn("Notice: teacher_availabilities query warning:", queryErr);
    }

    // Default sample fallback if teacher has no windows configured yet
    const hasExistingData = dbRows.length > 0;

    let schedule: DayScheduleData[] = [];

    if (hasExistingData) {
      schedule = ALL_DAYS.map((day) => {
        const dayRows = dbRows.filter((r) => r.dayOfWeek === day);
        const isEnabled = dayRows.length > 0 && dayRows.some((r) => r.isActive);

        const windows = dayRows.map((r) => {
          const slots =
            Array.isArray(r.slots) && r.slots.length > 0
              ? r.slots
              : generateHourlySlots(r.startTime, r.endTime, `slot-${day}`);

          return {
            id: r.id,
            startTime: r.startTime,
            endTime: r.endTime,
            generatedSlots: slots,
          };
        });

        // Sort windows chronologically
        windows.sort((a, b) => a.startTime.localeCompare(b.startTime));

        return {
          day,
          label: DAY_LABELS[day],
          isEnabled,
          slots: windows,
        };
      });
    } else {
      // Sensible initial starting availability (Pakistan Standard Time, 4 active days)
      const defaultPresets: Partial<Record<DayOfWeek, { start: string; end: string }[]>> = {
        monday: [{ start: "16:00", end: "20:00" }],
        tuesday: [{ start: "16:00", end: "19:00" }],
        thursday: [{ start: "16:00", end: "20:00" }],
        friday: [{ start: "14:00", end: "18:00" }],
      };

      schedule = ALL_DAYS.map((day) => {
        const presets = defaultPresets[day] || [];
        const isEnabled = presets.length > 0;

        const windows = presets.map((p, idx) => ({
          id: `default-${day}-${idx}`,
          startTime: p.start,
          endTime: p.end,
          generatedSlots: generateHourlySlots(p.start, p.end, `slot-${day}`),
        }));

        return {
          day,
          label: DAY_LABELS[day],
          isEnabled,
          slots: windows,
        };
      });
    }

    // 1. Fetch real blocked dates from PostgreSQL
    let blockedDates: BlockedDateItem[] = [];
    try {
      const bRes = await db.execute(sql`
        SELECT id, date, COALESCE(reason, 'Unavailable') as reason, all_day as "allDay"
        FROM teacher_blocked_dates
        WHERE teacher_id = ${teacherId}
        ORDER BY date ASC
      `);
      blockedDates = (bRes.rows || []).map((r: any) => ({
        id: String(r.id),
        date: String(r.date),
        reason: String(r.reason || "Time Off"),
        allDay: Boolean(r.allDay),
      }));
    } catch (bErr) {
      console.warn("Blocked dates query notice:", bErr);
    }

    // 2. Fetch real upcoming bookings for this teacher from PostgreSQL
    let bookedClasses: BookedClassItem[] = [];
    let nextBookedClass = undefined;
    try {
      const realBookings = await db
        .select({
          id: bookings.id,
          startTime: bookings.startTime,
          endTime: bookings.endTime,
          subject: bookings.subject,
          topicTitle: bookings.topicTitle,
          status: bookings.status,
          studentName: users.fullName,
          studentAvatar: users.avatarUrl,
        })
        .from(bookings)
        .innerJoin(users, eq(users.id, bookings.studentId))
        .where(
          and(
            eq(bookings.teacherId, teacherId),
            sql`${bookings.status} IN ('confirmed', 'pending')`
          )
        )
        .orderBy(bookings.startTime);

      bookedClasses = realBookings.map((b) => {
        const start = new Date(b.startTime);
        const end = new Date(b.endTime);
        const dateStr = start.toISOString().split("T")[0];
        const startH = String(start.getHours()).padStart(2, "0") + ":" + String(start.getMinutes()).padStart(2, "0");
        const endH = String(end.getHours()).padStart(2, "0") + ":" + String(end.getMinutes()).padStart(2, "0");
        return {
          id: b.id,
          studentName: b.studentName || "Student",
          studentAvatar: b.studentAvatar || "",
          subject: b.topicTitle || b.subject || "1-on-1 Class",
          dateStr,
          startTime: startH,
          endTime: endH,
          status: b.status as "confirmed" | "completed",
        };
      });

      if (realBookings.length > 0) {
        const first = realBookings[0];
        const fStart = new Date(first.startTime);
        const fEnd = new Date(first.endTime);
        nextBookedClass = {
          studentName: first.studentName || "Student",
          topic: first.topicTitle || first.subject || "1-on-1 Class",
          date: fStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          startTime: String(fStart.getHours()).padStart(2, "0") + ":" + String(fStart.getMinutes()).padStart(2, "0"),
          endTime: String(fEnd.getHours()).padStart(2, "0") + ":" + String(fEnd.getMinutes()).padStart(2, "0"),
        };
      }
    } catch (bkErr) {
      console.warn("Real bookings query notice in availability:", bkErr);
    }

    // Compute weekly hours & slots
    let totalWeeklyHours = 0;
    let totalSlotsCount = 0;
    let activeDaysCount = 0;

    schedule.forEach((dayItem) => {
      if (dayItem.isEnabled && dayItem.slots.length > 0) {
        activeDaysCount += 1;
        dayItem.slots.forEach((window) => {
          const sMin = timeToMinutes(window.startTime);
          const eMin = timeToMinutes(window.endTime);
          const hrs = Math.max(0, (eMin - sMin) / 60);
          totalWeeklyHours += hrs;
          totalSlotsCount += window.generatedSlots.length;
        });
      }
    });

    const teacherTimezone = dbRows[0]?.timezone || user.user_metadata?.timezone || "Asia/Karachi";

    const stats = {
      activeDaysCount,
      totalWeeklyHours: Math.round(totalWeeklyHours * 10) / 10,
      totalSlotsCount,
      upcomingBookedClassesCount: bookedClasses.length,
      nextBookedClass,
    };

    return {
      success: true,
      data: {
        schedule,
        timezone: teacherTimezone,
        stats,
        blockedDates,
        bookedClasses,
      },
    };
  } catch (err) {
    console.error("Error fetching teacher availability:", err);
    return {
      success: false,
      error: "Unable to load availability schedule.",
    };
  }
}

export interface AddAvailabilityInput {
  days: DayOfWeek[];
  startTime: string; // 24h e.g. "09:00"
  endTime: string;   // 24h e.g. "13:00"
  timezone?: string;
}

/**
 * Add Availability Window for One or Multiple Days
 * Generates 1-hour booking slots and prevents overlapping entries.
 */
export async function addAvailabilityWindowAction(
  input: AddAvailabilityInput
): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const teacherId = await getEffectiveTeacherId();

    const { days, startTime, endTime, timezone = "Asia/Karachi" } = input;

    // 1. Basic validation
    if (!days || days.length === 0) {
      return { success: false, error: "Please select at least one day of the week." };
    }

    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);

    if (isNaN(startMin) || isNaN(endMin)) {
      return { success: false, error: "Invalid time format. Please provide valid 24-hour times." };
    }

    if (endMin <= startMin) {
      return { success: false, error: "End time must be later than start time." };
    }

    if (endMin - startMin < 60) {
      return {
        success: false,
        error: "Availability window must be at least 1 hour (60 minutes).",
      };
    }

    await ensureAvailabilityTablesExist();

    // 2. Fetch existing availability for this teacher on the selected days
    const existing = await db
      .select()
      .from(teacherAvailabilities)
      .where(eq(teacherAvailabilities.teacherId, teacherId));

    // 3. Overlap Check for each selected day
    for (const day of days) {
      const dayWindows = existing.filter((w) => w.dayOfWeek === day && w.isActive);

      for (const window of dayWindows) {
        const wStart = timeToMinutes(window.startTime);
        const wEnd = timeToMinutes(window.endTime);

        // Overlap condition: startMin < wEnd && endMin > wStart
        if (startMin < wEnd && endMin > wStart) {
          return {
            success: false,
            error: `Conflict on ${DAY_LABELS[day]}: Time ${startTime}–${endTime} overlaps with existing window (${window.startTime}–${window.endTime}). Multiple non-overlapping windows are allowed.`,
          };
        }
      }
    }

    // 4. Generate 1-hour booking slots
    const generatedSlots = generateHourlySlots(startTime, endTime);

    // 5. Insert records for each selected day
    for (const day of days) {
      await db.insert(teacherAvailabilities).values({
        teacherId,
        dayOfWeek: day,
        startTime,
        endTime,
        timezone,
        isActive: true,
        slots: generatedSlots,
      });
    }

    revalidatePath("/teacher/availability");
    revalidatePath("/teacher/schedule");

    return {
      success: true,
      message: `Availability added for ${days.map((d) => DAY_LABELS[d]).join(", ")} (${generatedSlots.length} one-hour slots per day).`,
    };
  } catch (err) {
    console.error("Error adding availability window:", err);
    return {
      success: false,
      error: "Failed to add availability. Please try again.",
    };
  }
}

export interface UpdateAvailabilityInput {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

/**
 * Update an existing availability window
 */
export async function updateAvailabilityWindowAction(
  input: UpdateAvailabilityInput
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const teacherId = await getEffectiveTeacherId();

    const { id, dayOfWeek, startTime, endTime } = input;
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);

    if (endMin <= startMin) {
      return { success: false, error: "End time must be later than start time." };
    }

    if (endMin - startMin < 60) {
      return { success: false, error: "Window must be at least 1 hour." };
    }

    await ensureAvailabilityTablesExist();

    // Check overlap with other windows on the same day (excluding this id)
    const existing = await db
      .select()
      .from(teacherAvailabilities)
      .where(
        and(
          eq(teacherAvailabilities.teacherId, teacherId),
          eq(teacherAvailabilities.dayOfWeek, dayOfWeek)
        )
      );

    for (const w of existing) {
      if (w.id === id) continue;
      if (!w.isActive) continue;

      const wStart = timeToMinutes(w.startTime);
      const wEnd = timeToMinutes(w.endTime);

      if (startMin < wEnd && endMin > wStart) {
        return {
          success: false,
          error: `Conflicts with existing window (${w.startTime}–${w.endTime}) on ${DAY_LABELS[dayOfWeek]}.`,
        };
      }
    }

    const generatedSlots = generateHourlySlots(startTime, endTime);

    // If it was a mock/default id, insert fresh row; else update
    if (id.startsWith("default-")) {
      await db.insert(teacherAvailabilities).values({
        teacherId,
        dayOfWeek,
        startTime,
        endTime,
        isActive: true,
        slots: generatedSlots,
      });
    } else {
      await db
        .update(teacherAvailabilities)
        .set({
          startTime,
          endTime,
          slots: generatedSlots,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(teacherAvailabilities.id, id),
            eq(teacherAvailabilities.teacherId, teacherId)
          )
        );
    }

    revalidatePath("/teacher/availability");
    revalidatePath("/teacher/schedule");

    return { success: true };
  } catch (err) {
    console.error("Error updating availability window:", err);
    return { success: false, error: "Failed to update availability window." };
  }
}

/**
 * Delete an availability window
 */
export async function deleteAvailabilityWindowAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const teacherId = await getEffectiveTeacherId();

    await ensureAvailabilityTablesExist();

    if (!id.startsWith("default-")) {
      await db
        .delete(teacherAvailabilities)
        .where(
          and(
            eq(teacherAvailabilities.id, id),
            eq(teacherAvailabilities.teacherId, teacherId)
          )
        );
    }

    revalidatePath("/teacher/availability");
    revalidatePath("/teacher/schedule");

    return { success: true };
  } catch (err) {
    console.error("Error deleting availability window:", err);
    return { success: false, error: "Failed to delete availability window." };
  }
}

/**
 * Toggle all availability windows on a day between active and inactive
 */
export async function toggleDayAvailabilityAction(
  dayOfWeek: DayOfWeek,
  isEnabled: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const teacherId = await getEffectiveTeacherId();

    await ensureAvailabilityTablesExist();

    await db
      .update(teacherAvailabilities)
      .set({
        isActive: isEnabled,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(teacherAvailabilities.teacherId, teacherId),
          eq(teacherAvailabilities.dayOfWeek, dayOfWeek)
        )
      );

    return { success: true };
  } catch (err) {
    console.error("Error toggling day availability:", err);
    return { success: false, error: "Failed to update day availability status." };
  }
}

/**
 * Add a Blocked Date / Vacation Day
 */
export async function addBlockedDateAction(input: {
  date: string;
  reason?: string;
  allDay?: boolean;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const teacherId = await getEffectiveTeacherId();

    await ensureAvailabilityTablesExist();

    const result = await db.execute(sql`
      INSERT INTO teacher_blocked_dates (teacher_id, date, reason, all_day)
      VALUES (${teacherId}, ${input.date}, ${input.reason || "Time Off"}, ${input.allDay ?? true})
      RETURNING id
    `);

    const insertedId = (result.rows?.[0] as any)?.id;

    revalidatePath("/teacher/availability");
    revalidatePath("/teacher/schedule");

    return { success: true, id: String(insertedId) };
  } catch (err: any) {
    console.error("Error adding blocked date:", err);
    return { success: false, error: err?.message || "Failed to block date." };
  }
}

/**
 * Remove a Blocked Date
 */
export async function removeBlockedDateAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const teacherId = await getEffectiveTeacherId();

    await ensureAvailabilityTablesExist();

    await db.execute(sql`
      DELETE FROM teacher_blocked_dates
      WHERE id = ${id} AND teacher_id = ${teacherId}
    `);

    revalidatePath("/teacher/availability");
    revalidatePath("/teacher/schedule");

    return { success: true };
  } catch (err: any) {
    console.error("Error removing blocked date:", err);
    return { success: false, error: err?.message || "Failed to unblock date." };
  }
}

/**
 * Update Teacher Timezone
 */
export async function updateTeacherTimezoneAction(timezone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const teacherId = await getEffectiveTeacherId();

    await ensureAvailabilityTablesExist();

    // 1. Update in teacher_availabilities table
    await db
      .update(teacherAvailabilities)
      .set({
        timezone,
        updatedAt: new Date(),
      })
      .where(eq(teacherAvailabilities.teacherId, teacherId));

    try {
      const supabase = await createClient();
      await supabase.auth.updateUser({
        data: { timezone },
      });
    } catch {}

    revalidatePath("/teacher/availability");
    revalidatePath("/teacher/schedule");

    return { success: true };
  } catch (err: any) {
    console.error("Error updating timezone:", err);
    return { success: false, error: err?.message || "Failed to update timezone." };
  }
}

