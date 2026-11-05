import React from "react";
import { Metadata } from "next";
import { StudentSidebar } from "@/components/student/student-sidebar";
import { StudentHeader } from "@/components/student/student-header";

export const metadata: Metadata = {
  title: "ZuhDemy Student Portal",
  description: "Browse top tutors, manage lessons, and learn online with ZuhDemy",
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-row antialiased">
      {/* Student Sidebar */}
      <StudentSidebar />

      {/* Right Column: Student Header + Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <StudentHeader />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 overflow-y-auto bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
