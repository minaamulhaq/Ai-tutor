"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MessagingWorkspace } from "@/components/messaging/messaging-workspace";
import { Skeleton } from "@/components/ui/skeleton";

function TeacherMessagesContent() {
  const searchParams = useSearchParams();
  const initialStudentId = searchParams.get("student");

  return (
    <MessagingWorkspace
      currentRole="teacher"
      initialPartnerId={initialStudentId}
    />
  );
}

export function TeacherMessagesView() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-6.5rem)] rounded-2xl bg-white border border-slate-200 p-6 flex gap-4 animate-pulse">
          <Skeleton className="w-80 h-full rounded-xl" />
          <Skeleton className="flex-1 h-full rounded-xl" />
        </div>
      }
    >
      <TeacherMessagesContent />
    </Suspense>
  );
}
