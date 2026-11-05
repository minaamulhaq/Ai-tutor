import React from "react";
import { Metadata } from "next";
import { StudentProfileView } from "@/components/student/profile/profile-view";

export const metadata: Metadata = {
  title: "My Profile | ZuhDemy Student Studio",
  description:
    "Manage your academic curriculum, study subjects, learning goals, guardian information, and session preferences on ZuhDemy.",
};

export default function StudentProfilePage() {
  return <StudentProfileView />;
}
