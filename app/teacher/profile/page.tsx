import React from "react";
import { Metadata } from "next";
import { TeacherProfileView } from "@/components/teacher/profile/profile-view";

export const metadata: Metadata = {
  title: "My Profile | ZuhDemy Teacher Studio",
  description:
    "Manage your personal information, professional details, academic credentials, and teaching preferences on ZuhDemy.",
};

export default function TeacherProfilePage() {
  return <TeacherProfileView />;
}
