import React from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowLeft,
  Receipt,
  AlertOctagon,
  BookOpen,
  Landmark,
} from "lucide-react";

export const metadata = {
  title: "Financial Management & Escrow Tracking | ZuhDemy Admin",
  description:
    "Authoritative double-entry ledger, funds-held visibility, dispute resolution, and provider reconciliation dashboard for ZuhDemy tutoring marketplace.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="size-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <Landmark className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-white leading-none">
                  Zuh<span className="text-orange-500">Demy</span>
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Financial Portal
                </span>
              </div>
            </Link>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <ShieldCheck className="size-3.5" />
              Admin Mode · Double-Entry Ledger
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Currency: <strong className="text-slate-200">PKR (Rs.)</strong></span>
              <span className="text-slate-600">|</span>
              <span>Timezone: <strong className="text-slate-200">Asia/Karachi (UTC+5)</strong></span>
            </div>

            <Link
              href="/teacher/classes"
              className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors"
            >
              Teacher Studio
            </Link>

            <Link
              href="/student/teachers"
              className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors"
            >
              Student Discovery
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer Notice */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>
          ZuhDemy Authoritative Financial Management System. All money tracked in minor currency units (paisas) via balanced nominal ledger accounts.
        </p>
        <p className="mt-1 text-[11px] text-slate-600">
          Strict Compliance Notice: Funds are tracked as internal liabilities (Funds Held / Teacher Payables). Teacher payout execution is managed separately.
        </p>
      </footer>
    </div>
  );
}
