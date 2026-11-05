import React from "react";
import { Metadata } from "next";
import { TeacherSupportView } from "@/components/teacher/support/teacher-support-view";

export const metadata: Metadata = {
  title: "Support Desk | ZuhDemy Teacher Studio",
  description: "Get dedicated assistance, report student issues, and track faculty inquiries on ZuhDemy.",
};

export default function TeacherSupportPage() {
  return <TeacherSupportView />;
}
