import React from "react";
import { Metadata } from "next";
import { TeacherStudentsView } from "@/components/teacher/students/students-view";

export const metadata: Metadata = {
  title: "Students | ZuhDemy Teacher Studio",
  description: "View and manage all your students in one place.",
};

export default function TeacherStudentsPage() {
  return <TeacherStudentsView />;
}
