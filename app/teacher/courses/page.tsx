import React from "react";
import { Metadata } from "next";
import { BookOpen, Plus, Sparkles, Clock, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Courses | ZuhDemy Teacher Studio",
  description: "Create and manage your structured curriculums, courses, and materials.",
};

export default function TeacherCoursesPage() {
  const dummyCourses = [
    {
      id: "crs-1",
      title: "Advanced Data Structures & Algorithms",
      level: "Undergraduate",
      studentsCount: 42,
      lessonsCount: 16,
      status: "Published",
      category: "Computer Science",
    },
    {
      id: "crs-2",
      title: "Calculus & Linear Algebra Foundations",
      level: "A-Levels / FSc",
      studentsCount: 28,
      lessonsCount: 12,
      status: "Published",
      category: "Mathematics",
    },
    {
      id: "crs-3",
      title: "Python for Data Analysis & AI",
      level: "Adult Professional",
      studentsCount: 19,
      lessonsCount: 10,
      status: "Draft",
      category: "Programming",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Courses</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, publish, and manage your structured courses, lesson plans, and learning materials.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto">
          <Plus className="size-4" />
          <span>Create New Course</span>
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {dummyCourses.map((course) => (
          <div
            key={course.id}
            className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-orange-200 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                  {course.category}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                    course.status === "Published"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {course.status}
                </span>
              </div>
              <h3 className="font-semibold text-base text-slate-900 mb-1">{course.title}</h3>
              <p className="text-xs text-slate-500 mb-4">{course.level}</p>

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <Users className="size-3.5 text-slate-400" />
                  {course.studentsCount} Students
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="size-3.5 text-slate-400" />
                  {course.lessonsCount} Lessons
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Curriculum v1.2</span>
              <button className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer">
                Manage
                <ArrowRight className="size-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
