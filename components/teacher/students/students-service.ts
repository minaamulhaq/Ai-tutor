import { ClassSession } from "@/components/teacher/classes/types";
import { StudentProfile, StudentLearningNote } from "./types";
import {
  getTeacherStudentsDirectoryAction,
  getTeacherStudentDetailAction,
  getTeacherStudentClassesAction,
  getTeacherStudentNotesAction,
  addTeacherStudentNoteAction,
  deleteTeacherStudentNoteAction,
} from "@/app/actions/teacherStudents";

// ============================================================================
// BACKEND REALTIME API SERVICE LAYER
// Loads live student records directly from PostgreSQL / Supabase
// ============================================================================

/**
 * Fetch all students associated with the authenticated teacher directly from database bookings.
 * Returns empty array if no students have booked classes yet. Zero dummy data.
 */
export async function apiFetchStudents(): Promise<{
  students: StudentProfile[];
  teacherId?: string;
}> {
  try {
    const res = await getTeacherStudentsDirectoryAction();
    if (res.success && res.data) {
      return { students: res.data, teacherId: res.teacherId };
    }
    if (res.error) {
      console.warn("apiFetchStudents server notice:", res.error);
    }
  } catch (err) {
    console.error("apiFetchStudents error:", err);
  }
  return { students: [] };
}

/**
 * Fetch a single student by unique student ID from real database records.
 */
export async function apiFetchStudentById(studentId: string): Promise<StudentProfile | null> {
  try {
    const res = await getTeacherStudentDetailAction(studentId);
    if (res.success && res.data) {
      return res.data;
    }
  } catch (err) {
    console.error(`apiFetchStudentById error for ${studentId}:`, err);
  }
  return null;
}

/**
 * Fetch all real class sessions for a specific student with this teacher.
 */
export async function apiFetchStudentClasses(studentId: string): Promise<ClassSession[]> {
  try {
    const res = await getTeacherStudentClassesAction(studentId);
    if (res.success && res.data) {
      return res.data;
    }
  } catch (err) {
    console.error(`apiFetchStudentClasses error for ${studentId}:`, err);
  }
  return [];
}

/**
 * Fetch persistent private learning notes for a student from database.
 */
export async function apiFetchStudentNotes(studentId: string): Promise<StudentLearningNote[]> {
  try {
    const res = await getTeacherStudentNotesAction(studentId);
    if (res.success && res.data) {
      return res.data;
    }
  } catch (err) {
    console.error(`apiFetchStudentNotes error for ${studentId}:`, err);
  }
  return [];
}

/**
 * Add a new private learning note for a student saved in PostgreSQL.
 */
export async function apiAddStudentNote(
  studentId: string,
  content: string
): Promise<StudentLearningNote> {
  const res = await addTeacherStudentNoteAction(studentId, content);
  if (!res.success || !res.data) {
    throw new Error(res.error || "Failed to save note to server database");
  }
  return res.data;
}

/**
 * Delete a private learning note from PostgreSQL.
 */
export async function apiDeleteStudentNote(
  studentId: string,
  noteId: string
): Promise<boolean> {
  const res = await deleteTeacherStudentNoteAction(noteId);
  if (!res.success) {
    throw new Error(res.error || "Failed to delete note from server database");
  }
  return true;
}
