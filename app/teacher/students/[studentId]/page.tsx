import React from "react";
import { Metadata } from "next";
import { StudentProfileView } from "@/components/teacher/students/student-profile-view";

interface StudentDetailPageProps {
  params: Promise<{
    studentId: string;
  }>;
}

export async function generateMetadata({
  params,
}: StudentDetailPageProps): Promise<Metadata> {
  const { studentId } = await params;
  return {
    title: `Student Profile (${studentId}) | ZuhDemy Teacher Studio`,
    description: "View student details, class history, and manage private learning notes.",
  };
}

export default async function StudentDetailPage({
  params,
}: StudentDetailPageProps) {
  const { studentId } = await params;
  return <StudentProfileView studentId={studentId} />;
}
