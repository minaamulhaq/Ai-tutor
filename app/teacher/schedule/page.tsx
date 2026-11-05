import React from "react";
import { Metadata } from "next";
import { TeacherAvailabilityDashboard } from "@/components/teacher/schedule/availability-dashboard";

export const metadata: Metadata = {
  title: "My Availability | ZuhDemy Teacher Studio",
  description:
    "Configure your weekly teaching hours, 1-hour slots, and availability for private classes on ZuhDemy.",
};

export default function TeacherSchedulePage() {
  return <TeacherAvailabilityDashboard />;
}

