import React from "react";
import { Metadata } from "next";
import { TeacherSidebar } from "@/components/teacher/teacher-sidebar";
import { TeacherHeader } from "@/components/teacher/teacher-header";

export const metadata: Metadata = {
  title: "ZuhDemy Teacher Studio",
  description: "Manage your classes, schedule, earnings, and students on ZuhDemy",
};

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-row antialiased">
      {/* Teacher Dedicated Sidebar */}
      <TeacherSidebar />

      {/* Right Column: Teacher Dedicated Header + Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TeacherHeader />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 overflow-y-auto bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
