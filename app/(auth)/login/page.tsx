import React, { Suspense } from "react";
import { Metadata } from "next";
import { LoginView } from "@/components/auth/login-view";

export const metadata: Metadata = {
  title: "Login | ZuhDemy Learning Studio",
  description:
    "Log in to your ZuhDemy account to access interactive classes, verified tutors, and study materials.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginView />
    </Suspense>
  );
}