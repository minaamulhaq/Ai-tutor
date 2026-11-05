import React from "react";
import { Metadata } from "next";
import { TeacherClassesView } from "@/components/teacher/classes/classes-view";

import { apiFetchClasses } from "@/components/teacher/classes/classes-service";

export const metadata: Metadata = {
  title: "My Classes | ZuhDemy Teacher Studio",
  description: "Manage upcoming sessions, pending booking requests, classroom links, and class notes.",
};

export default async function TeacherClassesPage() {
  const initialData = await apiFetchClasses();
  return <TeacherClassesView initialData={initialData} />;
}
