"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  GraduationCap,
  Calendar,
  AlertCircle,
  Users,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentProfile, StudentLearningNote } from "./types";
import { ClassSession } from "@/components/teacher/classes/types";
import {
  apiFetchStudentById,
  apiFetchStudentClasses,
  apiFetchStudentNotes,
} from "./students-service";
import { createClient } from "@/utils/supabase/client";
import { StudentOverviewTab } from "./student-overview-tab";
import { StudentClassesTab } from "./student-classes-tab";
import { StudentNotesTab } from "./student-notes-tab";

interface StudentProfileViewProps {
  studentId: string;
}

export function StudentProfileView({ studentId }: StudentProfileViewProps) {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [notes, setNotes] = useState<StudentLearningNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imgError, setImgError] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setNotFound(false);
    try {
      const studentData = await apiFetchStudentById(studentId);
      if (!studentData) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setStudent(studentData);

      // Concurrently load classes and notes for this student
      const [classesData, notesData] = await Promise.all([
        apiFetchStudentClasses(studentId),
        apiFetchStudentNotes(studentId),
      ]);

      setClasses(classesData);
      setNotes(notesData);
    } catch (err) {
      console.error("Error loading student profile:", err);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime subscription for student bookings and teacher notes updates
  useEffect(() => {
    let channel: any = null;
    try {
      const supabase = createClient();
      const channelName = `student-profile-sync:${studentId}`;
      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookings",
            filter: `student_id=eq.${studentId}`,
          },
          () => {
            loadData();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "teacher_student_notes",
            filter: `student_id=eq.${studentId}`,
          },
          () => {
            loadData();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn("Realtime error in student profile view:", err);
    }

    return () => {
      if (channel) {
        try {
          const supabase = createClient();
          supabase.removeChannel(channel);
        } catch {}
      }
    };
  }, [studentId, loadData]);

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Back Link Skeleton */}
        <Skeleton className="h-5 w-36 rounded-md bg-slate-200" />

        {/* Profile Header Skeleton */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <Skeleton className="size-24 rounded-2xl bg-slate-200 shrink-0" />
          <div className="space-y-2.5 flex-1 w-full text-center sm:text-left">
            <Skeleton className="h-7 w-48 rounded-md bg-slate-200 mx-auto sm:mx-0" />
            <Skeleton className="h-4 w-64 rounded-md bg-slate-200 mx-auto sm:mx-0" />
            <div className="flex gap-2 justify-center sm:justify-start pt-2">
              <Skeleton className="h-6 w-20 rounded-full bg-slate-200" />
              <Skeleton className="h-6 w-24 rounded-full bg-slate-200" />
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-80 rounded-xl bg-slate-200" />
          <Skeleton className="h-64 w-full rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  // Not Found State
  if (notFound || !student) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="size-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto shadow-2xs">
          <AlertCircle className="size-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-900">Student Not Found</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            We couldn&apos;t find an enrolled student record with ID &quot;{studentId}&quot; in your teacher studio.
          </p>
        </div>
        <Link
          href="/teacher/students"
          className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-9.5 px-4 text-xs sm:text-sm font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4 mr-1.5" />
          <span>Return to Students Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Back Navigation Link */}
      <div>
        <Link
          href="/teacher/students"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-orange-600 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Students</span>
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Avatar Portrait */}
        <div className="size-24 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-xs shrink-0 ring-4 ring-orange-500/10 bg-slate-100 flex items-center justify-center">
          {student.avatarUrl && !imgError ? (
            <img
              src={student.avatarUrl}
              alt={student.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-orange-600 bg-orange-50 text-2xl select-none">
              {student.initials}
            </div>
          )}
        </div>

        {/* Info Header Block */}
        <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {student.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {student.gradeLevel || "Student Learner"} · {student.email}
              </p>
            </div>

            {/* Relationship & Attended Badges + Message Button */}
            <div className="flex flex-wrap items-center gap-2 self-center sm:self-start">
              {student.completedClassesCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  <span>{student.completedClassesCount} Attended Classes</span>
                </span>
              )}

              {student.status === "active" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                  <span className="size-2 rounded-full bg-orange-500" />
                  Active Student
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  <span className="size-2 rounded-full bg-slate-400" />
                  Past Student
                </span>
              )}

              <Link
                href="/teacher/messages"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-2xs transition-colors cursor-pointer"
              >
                <MessageSquare className="size-3.5" />
                <span>Message</span>
              </Link>
            </div>
          </div>

          {/* Subjects Pills */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
            <span className="text-xs text-slate-400 font-medium mr-1">
              Subjects:
            </span>
            {student.subjects.map((subj) => (
              <Badge
                key={subj}
                variant="outline"
                className="bg-slate-50 text-slate-700 border-slate-200 text-[11px] font-medium"
              >
                {subj}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Overview, Classes, Learning Notes) */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-100/90 p-1 rounded-xl h-auto flex flex-wrap border border-slate-200/80">
          <TabsTrigger
            value="overview"
            className="rounded-lg text-xs sm:text-sm font-semibold px-4 py-2 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-xs"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="classes"
            className="rounded-lg text-xs sm:text-sm font-semibold px-4 py-2 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-xs"
          >
            Classes ({classes.length})
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="rounded-lg text-xs sm:text-sm font-semibold px-4 py-2 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-xs"
          >
            Learning Notes ({notes.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="mt-0 outline-none">
          <StudentOverviewTab student={student} classes={classes} />
        </TabsContent>

        {/* Tab 2: Classes */}
        <TabsContent value="classes" className="mt-0 outline-none">
          <StudentClassesTab classes={classes} />
        </TabsContent>

        {/* Tab 3: Learning Notes */}
        <TabsContent value="notes" className="mt-0 outline-none">
          <StudentNotesTab
            studentId={student.id}
            studentName={student.name}
            initialNotes={notes}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
