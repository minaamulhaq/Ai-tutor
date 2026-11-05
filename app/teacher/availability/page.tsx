import React from "react";
import { Metadata } from "next";
import { TeacherAvailabilityDashboard } from "@/components/teacher/schedule/availability-dashboard";

export const metadata: Metadata = {
  title: "My Availability | ZuhDemy Teacher Studio",
  description:
    "Manage your weekly teaching availability and 1-hour slots so students can book private classes on ZuhDemy.",
};

export default function TeacherAvailabilityPage() {
  return <TeacherAvailabilityDashboard />;
}
