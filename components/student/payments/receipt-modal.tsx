"use client";

import React from "react";
import {
  Printer,
  Download,
  X,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PaymentTransaction } from "@/types/payment";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: PaymentTransaction | null;
}

export function ReceiptModal({
  isOpen,
  onClose,
  transaction,
}: ReceiptModalProps) {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[95vh] overflow-y-auto p-6 sm:p-8 rounded-2xl border-slate-200">
        <DialogHeader className="sr-only">
          <DialogTitle>Tuition Payment Receipt</DialogTitle>
        </DialogHeader>

        {/* Printable Receipt Container with print stylesheet isolation */}
        <div id="printable-receipt" className="space-y-6 text-slate-900 bg-white">
          {/* 1. Header with Logo & Brand */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="size-8 rounded-xl bg-orange-500 text-white font-black text-lg flex items-center justify-center">
                  Z
                </span>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  ZuhDemy
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Official Tuition & Escrow Payment Receipt
              </p>
              <p className="text-[11px] text-slate-400">support@zuhdemy.com • Islamabad, Pakistan</p>
            </div>

            <div className="text-right space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Receipt Number
              </span>
              <p className="font-mono font-bold text-sm text-slate-900">
                {transaction.receiptNumber}
              </p>
              <p className="text-[11px] text-slate-500">
                Date: {transaction.date}
              </p>
            </div>
          </div>

          {/* 2. Transaction & Student Meta Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Billed To (Student)
              </span>
              <p className="font-bold text-slate-900 mt-0.5">
                {transaction.student.name}
              </p>
              <p className="text-slate-500">{transaction.student.email}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Transaction References
              </span>
              <p className="font-mono text-slate-900 mt-0.5">
                <strong>ID:</strong> {transaction.id}
              </p>
              <p className="font-mono text-slate-500">
                <strong>Booking Ref:</strong> {transaction.bookingRef}
              </p>
            </div>
          </div>

          {/* 3. Itemized Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-2.5 px-3.5">Description</th>
                  <th className="py-2.5 px-3 text-center">Instructor</th>
                  <th className="py-2.5 px-3.5 text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-3 px-3.5">
                    <p className="font-bold text-slate-900">{transaction.classTitle}</p>
                    <p className="text-[11px] text-slate-500">
                      Subject: {transaction.subject} • 1-on-1 Live Class
                    </p>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-700">
                    {transaction.teacher.name}
                  </td>
                  <td className="py-3 px-3.5 text-right font-bold text-slate-900">
                    PKR {transaction.baseFeePKR.toLocaleString()}
                  </td>
                </tr>

                <tr>
                  <td colSpan={2} className="py-2 px-3.5 text-slate-600 text-[11px]">
                    ZuhDemy Escrow Buyer Protection & Platform Fee (5%)
                  </td>
                  <td className="py-2 px-3.5 text-right font-medium text-slate-900 text-[11px]">
                    PKR {transaction.platformFeePKR.toLocaleString()}
                  </td>
                </tr>

                {transaction.discountPKR > 0 && (
                  <tr>
                    <td colSpan={2} className="py-2 px-3.5 text-emerald-600 text-[11px] font-semibold">
                      Promotional Discount Voucher
                    </td>
                    <td className="py-2 px-3.5 text-right font-bold text-emerald-600 text-[11px]">
                      -PKR {transaction.discountPKR.toLocaleString()}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                <tr>
                  <td colSpan={2} className="py-3 px-3.5 text-sm font-extrabold text-slate-900">
                    Total Paid
                  </td>
                  <td className="py-3 px-3.5 text-right text-sm font-extrabold text-orange-600">
                    PKR {transaction.amountPKR.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 4. Payment Method & Status Stamp */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Payment Method
              </span>
              <p className="font-medium text-slate-800">
                {transaction.paymentMethod?.label || "Direct Payment"}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-lg border-2 border-emerald-600 text-emerald-700 font-mono font-black text-xs uppercase tracking-wider">
                {transaction.status === "successful" ? "PAID IN ESCROW" : transaction.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* 5. Footer Notice */}
          <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-400 text-center space-y-0.5">
            <p>
              This is a computer-generated receipt for learning services provided via ZuhDemy.
            </p>
            <p>
              Protected by ZuhDemy Escrow Guarantee. All disputes are handled in accordance with the Student Terms of Service.
            </p>
          </div>
        </div>

        {/* Modal Controls (excluded when printing via CSS) */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Close
          </Button>

          <Button
            type="button"
            onClick={handlePrint}
            className="h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="size-3.5" />
            <span>Print / Save PDF</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
