/**
 * Controlled Platform Catalogs & Standard Taxonomy for ZuhDemy
 * Pure data constants safe for import by client components, server actions, and services.
 */

export const AVAILABLE_SUBJECTS = [
  "Computer Science",
  "Python Programming",
  "Data Structures",
  "Algorithms",
  "Mathematics",
  "Calculus",
  "Linear Algebra",
  "Physics",
  "Mechanics & Electromagnetism",
  "Chemistry",
  "Biology",
  "English Literature",
  "Statistics & Probability",
  "Web Development",
  "Machine Learning",
];

export const AVAILABLE_STUDENT_LEVELS = [
  "Middle School (Grade 6-8)",
  "O-Levels / IGCSE",
  "A-Levels / FSc",
  "Undergraduate (University)",
  "Adult Professional & Career Transition",
];

export const AVAILABLE_LANGUAGES = [
  "English",
  "Urdu",
  "Arabic",
  "Punjabi",
  "French",
  "Spanish",
  "German",
  "Mandarin",
];

export const AVAILABLE_TIMEZONES = [
  { value: "Asia/Karachi", label: "Asia/Karachi (PKT, UTC+5)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST, UTC+4)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST, UTC+0/+1)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT, UTC-5/-4)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST/PDT, UTC-8/-7)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT, UTC+8)" },
  { value: "Asia/Riyadh", label: "Asia/Riyadh (AST, UTC+3)" },
];
