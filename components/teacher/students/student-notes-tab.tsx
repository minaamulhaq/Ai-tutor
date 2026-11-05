"use client";

import React, { useState } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Clock,
  ShieldAlert,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StudentLearningNote } from "./types";
import {
  apiAddStudentNote,
  apiDeleteStudentNote,
} from "./students-service";

interface StudentNotesTabProps {
  studentId: string;
  studentName: string;
  initialNotes: StudentLearningNote[];
}

export function StudentNotesTab({
  studentId,
  studentName,
  initialNotes,
}: StudentNotesTabProps) {
  const [notes, setNotes] = useState<StudentLearningNote[]>(initialNotes);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newNoteContent.trim();
    if (!trimmed) {
      setErrorMessage("Please enter some text before saving the note.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Backend API Integration hook
      const createdNote = await apiAddStudentNote(studentId, trimmed);

      setNotes((prev) => [createdNote, ...prev]);
      setNewNoteContent("");
      setSuccessMessage("Private note saved successfully.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to save note:", err);
      // NOTE: Unsaved draft in newNoteContent is explicitly PRESERVED so teacher doesn't lose text!
      setErrorMessage("Failed to save note to server. Your draft has been kept.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    setDeletingId(noteId);
    try {
      await apiDeleteStudentNote(studentId, noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      setSuccessMessage("Note deleted.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to delete note:", err);
      setErrorMessage("Failed to delete note. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
        <ShieldAlert className="size-4.5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block">Private Teacher Observations</span>
          <p className="text-amber-800 leading-relaxed">
            These learning notes are strictly confidential and visible only to you.
            They are not shared with {studentName} or other instructors on ZuhDemy.
          </p>
        </div>
      </div>

      {/* Add New Note Card Form */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="size-4.5 text-orange-500" />
          <h3 className="font-bold text-base text-slate-900">
            Add Private Learning Note
          </h3>
        </div>

        <form onSubmit={handleAddNote} className="space-y-3">
          <Textarea
            value={newNoteContent}
            onChange={(e) => {
              setNewNoteContent(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder={`Log observations regarding ${studentName}'s understanding, weaknesses, recommended exercises, or milestones...`}
            className="text-xs sm:text-sm min-h-[105px] resize-y bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl"
            disabled={isSaving}
          />

          {errorMessage && (
            <div className="text-xs text-rose-600 flex items-center gap-1.5 font-medium">
              <AlertCircle className="size-3.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="text-xs text-emerald-600 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="size-3.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              {newNoteContent.length} characters
            </span>

            <Button
              type="submit"
              disabled={isSaving || !newNoteContent.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs sm:text-sm h-9 px-4 rounded-xl gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="size-3.5" />
                  <span>Save Note</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Previously Saved Notes List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h4 className="font-bold text-sm text-slate-900">
            Previous Notes ({notes.length})
          </h4>
        </div>

        {notes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-10 text-center space-y-2">
            <FileText className="size-8 text-slate-300 mx-auto" />
            <h5 className="font-bold text-slate-800 text-sm">
              No private notes yet
            </h5>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your first note above to track student progress, curriculum pacing, or homework feedback.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-2.5 relative group hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Clock className="size-3.5 text-slate-400" />
                    <span>{note.createdAt}</span>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={deletingId === note.id}
                    onClick={() => handleDeleteNote(note.id)}
                    className="size-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title="Delete Note"
                  >
                    {deletingId === note.id ? (
                      <Loader2 className="size-3.5 animate-spin text-rose-500" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </Button>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
