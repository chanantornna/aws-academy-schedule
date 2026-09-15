import type { TrainingSession } from "./types";
import type { Lang } from "./i18n";
import { translations } from "./i18n";
import { checklistProgress } from "./utils";

function escapeCsv(value: string | number): string {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

type Dict = (typeof translations)[Lang];

/** Human-readable topic label, honouring the custom "other" topic. */
function topicLabel(s: TrainingSession, t: Dict): string {
  if (s.topic === "other" && s.customTopic) return s.customTopic;
  return t[`topic_${s.topic}` as const];
}

export function exportSessionsToCsv(
  sessions: TrainingSession[],
  lang: Lang
): void {
  const t = translations[lang];

  const headers = [
    t.university,
    t.faculty,
    t.topic,
    t.audience,
    t.trainer,
    t.date,
    t.startTime,
    t.endTime,
    t.format,
    t.location,
    t.meetingUrl,
    t.expectedAttendees,
    t.registeredAttendees,
    t.coordinator,
    t.coordinatorContact,
    t.status,
    t.checklistProgress,
    t.remark,
    t.notes,
  ];

  const rows = sessions.map((s) => {
    const prog = checklistProgress(s.checklist);
    return [
    s.university,
    s.faculty,
    topicLabel(s, t),
    t[`audience_${s.audience}` as const],
    s.trainer,
    s.date,
    s.startTime,
    s.endTime,
    t[`format_${s.format}` as const],
    s.location,
    s.meetingUrl,
    s.expectedAttendees || "",
    s.registeredAttendees || "",
      s.coordinator,
      s.coordinatorContact,
      t[`status_${s.status}` as const],
      `${prog.done}/${prog.total}`,
      s.remark,
      s.notes,
    ];
  });

  const lines = [headers, ...rows]
    .map((cols) => cols.map(escapeCsv).join(","))
    .join("\r\n");

  // Prepend BOM so Excel opens Thai/UTF-8 correctly.
  const blob = new Blob(["\uFEFF" + lines], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `aws-academy-schedule-${stamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
