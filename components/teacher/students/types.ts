import { Student, ClassSession } from "@/components/teacher/classes/types";

export type StudentStatus = "active" | "inactive";

export interface StudentProfile extends Student {
  status: StudentStatus;
  subjects: string[];
  totalClassesCount: number;
  completedClassesCount: number;
  upcomingClassesCount: number;
  lastClassDate?: string;
  nextClassDate?: string;
  enrolledSince: string;
}

export interface StudentLearningNote {
  id: string;
  studentId: string;
  teacherId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StudentFiltersState {
  searchQuery: string;
  subject: string;
  status: string; // "all" | "active" | "inactive"
}
