import React from "react";
import { Metadata } from "next";
import { TeacherSettingsView } from "@/components/teacher/settings/settings-view";

export const metadata: Metadata = {
  title: "Settings | ZuhDemy Teacher Studio",
  description: "Manage your account, preferences, and security.",
};

export default function TeacherSettingsPage() {
  return <TeacherSettingsView />;
}
