import React from "react";
import { Metadata } from "next";
import { StudentHelpView } from "@/components/student/help/help-view";

export const metadata: Metadata = {
  title: "Help & Support | ZuhDemy Student Studio",
  description:
    "Get assistance with your online classes, tutor schedules, refunds, and technical support on ZuhDemy.",
};

export default function StudentHelpPage() {
  return <StudentHelpView />;
}
