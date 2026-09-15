import type { Audience, Format, SessionStatus, Topic } from "./types";

export const STATUS_STYLES: Record<SessionStatus, string> = {
  contacted: "bg-slate-100 text-slate-700 border-slate-200",
  confirmed: "bg-sky-100 text-sky-800 border-sky-200",
  scheduled: "bg-indigo-100 text-indigo-800 border-indigo-200",
  in_progress: "bg-amber-100 text-amber-800 border-amber-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-rose-100 text-rose-700 border-rose-200",
};

export const TOPIC_STYLES: Record<Topic, string> = {
  genai_partyrock: "bg-orange-100 text-orange-700",
  genai_kiro: "bg-violet-100 text-violet-700",
  cloud_foundations: "bg-blue-100 text-blue-700",
  other: "bg-slate-100 text-slate-600",
};

export const FORMAT_STYLES: Record<Format, string> = {
  onsite: "bg-emerald-50 text-emerald-700 border-emerald-200",
  online: "bg-sky-50 text-sky-700 border-sky-200",
  hybrid: "bg-purple-50 text-purple-700 border-purple-200",
};

export const AUDIENCE_STYLES: Record<Audience, string> = {
  students: "bg-teal-100 text-teal-700",
  lecturers: "bg-amber-100 text-amber-700",
  both: "bg-indigo-100 text-indigo-700",
};
