import React from "react";
import { Metadata } from "next";
import { StudentSettingsView } from "@/components/student/settings/settings-view";

export const metadata: Metadata = {
  title: "Settings | ZuhDemy Student Studio",
  description:
    "Manage your student account credentials, class reminder alerts, privacy, security, and payment settings.",
};

export default function StudentSettingsPage() {
  return <StudentSettingsView />;
}
