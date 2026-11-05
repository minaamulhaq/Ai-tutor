import { TimeSlot, ValidationResult, GeneratedSlot } from "./types";

/**
 * Converts "HH:MM" (24-hour) string to minutes from midnight.
 */
export function timeToMinutes(time: string): number {
  if (!time) return 0;
  const trimmed = String(time).trim();
  const isPM = /PM/i.test(trimmed);
  const isAM = /AM/i.test(trimmed);
  const clean = trimmed.replace(/[^\d:]/g, "");
  const parts = clean.split(":");
  let hours = parseInt(parts[0] || "0", 10);
  let minutes = parseInt(parts[1] || "0", 10);
  if (isNaN(hours)) hours = 0;
  if (isNaN(minutes)) minutes = 0;
  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

/**
 * Converts minutes from midnight to "HH:MM" (24-hour) string.
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Formats "HH:MM" (24-hour) into human-friendly 12-hour format e.g. "4:00 PM".
 */
export function format12Hour(time24: string): string {
  if (!time24) return "";
  const trimmed = String(time24).trim();
  if (/AM|PM/i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.includes("T")) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Karachi",
      }).format(d);
    }
  }
  const [hStr, mStr] = trimmed.split(":");
  let hours = parseInt(hStr, 10);
  let minutes = parseInt(mStr || "0", 10);
  if (isNaN(hours)) hours = 0;
  if (isNaN(minutes)) minutes = 0;
  const period = hours >= 12 ? "PM" : "AM";

  if (hours === 0) {
    hours = 12;
  } else if (hours > 12) {
    hours -= 12;
  }

  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${minStr} ${period}`;
}

/**
 * Calculates a friendly human duration between two 24h times.
 * e.g. ("16:00", "20:00") => "4 hrs", ("14:00", "15:30") => "1 hr 30 mins"
 */
export function calculateDuration(startTime: string, endTime: string): string {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const diff = endMin - startMin;

  if (diff <= 0) return "0 mins";

  const hours = Math.floor(diff / 60);
  const mins = diff % 60;

  if (hours > 0 && mins > 0) {
    return `${hours} hr${hours > 1 ? "s" : ""} ${mins} min${mins > 1 ? "s" : ""}`;
  } else if (hours > 0) {
    return `${hours} hr${hours > 1 ? "s" : ""}`;
  } else {
    return `${mins} min${mins > 1 ? "s" : ""}`;
  }
}

/**
 * Calculates total hours worked for an array of time slots.
 */
export function calculateTotalHours(slots: TimeSlot[]): number {
  const totalMins = slots.reduce((acc, slot) => {
    const start = timeToMinutes(slot.startTime);
    const end = timeToMinutes(slot.endTime);
    return acc + Math.max(0, end - start);
  }, 0);

  return Math.round((totalMins / 60) * 10) / 10;
}

/**
 * Validates whether a new or edited slot overlaps with existing slots for that day.
 * Also checks for zero/negative length.
 */
export function validateSlot(
  newSlot: { startTime: string; endTime: string; id?: string },
  existingSlots: TimeSlot[]
): ValidationResult {
  const newStart = timeToMinutes(newSlot.startTime);
  const newEnd = timeToMinutes(newSlot.endTime);

  // 1. Duration check
  if (newEnd <= newStart) {
    return {
      isValid: false,
      error: "End time must be later than start time. Zero or negative duration is not allowed.",
    };
  }

  // 2. Minimum duration check (classes must be at least 1 hour / 60 minutes)
  if (newEnd - newStart < 60) {
    return {
      isValid: false,
      error: "Classes must be at least 1 hour long. 30-minute sessions are not allowed.",
    };
  }

  // 3. Overlap check against existing slots on the same day (excluding itself if editing)
  for (const slot of existingSlots) {
    if (newSlot.id && slot.id === newSlot.id) continue;

    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);

    // Two slots overlap if newStart < slotEnd and newEnd > slotStart
    const hasOverlap = newStart < slotEnd && newEnd > slotStart;

    if (hasOverlap) {
      return {
        isValid: false,
        conflictingSlot: slot,
        error: `Conflicts with existing slot ${format12Hour(slot.startTime)}–${format12Hour(
          slot.endTime
        )}. Please adjust your time or choose a different window.`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Generates options for 12-hour time pickers in 1-hour intervals (06:00 AM to 11:00 PM).
 */
export function generateTimeOptions(stepMinutes = 60): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let minutes = 360; minutes <= 1380; minutes += stepMinutes) {
    // 06:00 AM (360) to 11:00 PM (1380) in 1-hour steps
    const time24 = minutesToTime(minutes);
    options.push({
      value: time24,
      label: format12Hour(time24),
    });
  }
  return options;
}

/**
 * Splits a slot into 1-hour session intervals.
 * e.g. 16:00 to 19:00 -> [{ startTime: "16:00", endTime: "17:00" }, { startTime: "17:00", endTime: "18:00" }, { startTime: "18:00", endTime: "19:00" }]
 */
export function breakdownSlotIntoHourlyIntervals(slot: {
  startTime: string;
  endTime: string;
}): { startTime: string; endTime: string }[] {
  const start = timeToMinutes(slot.startTime);
  const end = timeToMinutes(slot.endTime);
  const intervals: { startTime: string; endTime: string }[] = [];

  for (let curr = start; curr + 60 <= end; curr += 60) {
    intervals.push({
      startTime: minutesToTime(curr),
      endTime: minutesToTime(curr + 60),
    });
  }

  return intervals;
}

/**
 * Generates one-hour booking slots with IDs from a time range.
 * e.g. "09:00" to "13:00" ->
 * [
 *   { id: "slot-0900-1000", startTime: "09:00", endTime: "10:00", durationMinutes: 60 },
 *   { id: "slot-1000-1100", startTime: "10:00", endTime: "11:00", durationMinutes: 60 },
 *   { id: "slot-1100-1200", startTime: "11:00", endTime: "12:00", durationMinutes: 60 },
 *   { id: "slot-1200-1300", startTime: "12:00", endTime: "13:00", durationMinutes: 60 },
 * ]
 */
export function generateOneHourSlots(
  startTime: string,
  endTime: string,
  prefix = "slot"
): GeneratedSlot[] {
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

