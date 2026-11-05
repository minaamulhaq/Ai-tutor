"use client";

import React from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  MinusCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from "@/types/payment";
import { cn } from "@/lib/utils";

interface TransactionStatusBadgeProps {
  status: PaymentStatus;
  size?: "sm" | "default";
  className?: string;
}

export function TransactionStatusBadge({
  status,
  size = "default",
  className,
}: TransactionStatusBadgeProps) {
  const configs: Record<
    PaymentStatus,
    {
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badgeClass: string;
      dotClass?: string;
    }
  > = {
    successful: {
      label: "Successful",
      icon: CheckCircle2,
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dotClass: "bg-emerald-500",
    },
    pending: {
      label: "Pending",
      icon: Clock,
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      dotClass: "bg-amber-500 animate-pulse",
    },
    failed: {
      label: "Failed",
      icon: AlertCircle,
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      dotClass: "bg-rose-500",
    },
    refunded: {
      label: "Refunded",
      icon: RotateCcw,
      badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
      dotClass: "bg-sky-500",
    },
    partially_refunded: {
      label: "Partially Refunded",
      icon: RotateCcw,
      badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
      dotClass: "bg-indigo-500",
    },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold flex items-center gap-1.5 transition-all shadow-2xs whitespace-nowrap",
        size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-0.5",
        config.badgeClass,
        className
      )}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} />
      <span>{config.label}</span>
    </Badge>
  );
}
