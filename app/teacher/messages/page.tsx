import React from "react";
import { Metadata } from "next";
import { TeacherMessagesView } from "@/components/teacher/messages/messages-view";

export const metadata: Metadata = {
  title: "Messages | ZuhDemy Teacher Studio",
  description:
    "Communicate directly with your enrolled students, share class updates, answer homework questions, and coordinate schedules.",
};

export default function TeacherMessagesPage() {
  return <TeacherMessagesView />;
}
