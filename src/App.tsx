import { useMemo, useState } from "react";
import { LanguageProvider, useLanguage } from "./LanguageContext";
import { useSessions } from "./useSessions";
import SessionForm from "./SessionForm";
import CalendarView from "./CalendarView";
import { exportSessionsToCsv } from "./exportCsv";
import {
  AUDIENCE_STYLES,
  FORMAT_STYLES,
  STATUS_STYLES,
  TOPIC_STYLES,
} from "./constants";
import {
  STATUSES,
  TOPICS,
  FORMATS,
  type SessionInput,
  type SessionStatus,
  type Topic,
  type Format,
  type TrainingSession,
} from "./types";
import { daysUntil, formatDate, formatTimeRange } from "./utils";

type SortKey = "created" | "date" | "university";
type ViewMode = "table" | "calendar";

function DateBadge({ iso }: { iso: string }) {
  const { t, lang } = useLanguage();
  if (!iso) return <span className="text-slate-400">{t("noDate")}</span>;
  const days = daysUntil(iso);
  let cls = "text-slate-600";
  let tag: string | null = null;
  if (days !== null) {
    if (days < 0) {
      cls = "text-slate-400";
      tag = t("overdue");
    } else if (days <= 7) {
      cls = "text-amber-600 font-medium";
      tag = t("dueSoon");
    }
  }
  return (
    <span className={cls}>
      {formatDate(iso, lang)}
      {tag && (
        <span className="ml-1 inline-block rounded bg-current/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
          {tag}
        </span>
      )}
    </span>
  );
}

function AppInner() {
  const { t, lang, toggleLang } = useLanguage();
  const { sessions, addSession, updateSession, deleteSession, storageError } =
    useSessions();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TrainingSession | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SessionStatus | "all">(
    "all"
  );
  const [topicFilter, setTopicFilter] = useState<Topic | "all">("all");
  const [formatFilter, setFormatFilter] = useState<Format | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [view, setView] = useState<ViewMode>("table");

  const topicText = (s: TrainingSession) =>
    s.topic === "other" && s.customTopic
      ? s.customTopic
      : t(`topic_${s.topic}` as const);

  const summary = useMemo(() => {
    const universities = new Set(
      sessions.map((s) => s.university.trim().toLowerCase()).filter(Boolean)
    );
    let totalAttendees = 0;
    let completed = 0;
    let upcoming = 0;
    for (const s of sessions) {
      totalAttendees += s.expectedAttendees || 0;
      if (s.status === "completed") completed += 1;
      const d = daysUntil(s.date);
      if (
        d !== null &&
        d >= 0 &&
        s.status !== "completed" &&
        s.status !== "cancelled"
      ) {
        upcoming += 1;
      }
    }
    return {
      totalSessions: sessions.length,
      totalUniversities: universities.size,
      totalAttendees,
      completed,
      upcoming,
    };
  }, [sessions]);

  const visibleSessions = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = sessions.filter((s) => {
      const matchesSearch =
        !q ||
        s.university.toLowerCase().includes(q) ||
        s.faculty.toLowerCase().includes(q) ||
        s.trainer.toLowerCase().includes(q) ||
        s.coordinator.toLowerCase().includes(q) ||
        s.notes.toLowerCase().includes(q) ||
        s.customTopic.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || s.status === statusFilter;
      const matchesTopic = topicFilter === "all" || s.topic === topicFilter;
      const matchesFormat =
        formatFilter === "all" || s.format === formatFilter;
      return matchesSearch && matchesStatus && matchesTopic && matchesFormat;
    });

    list = [...list].sort((a, b) => {
      switch (sortKey) {
        case "university":
          return a.university.localeCompare(b.university);
        case "date":
          return (a.date || "9999").localeCompare(b.date || "9999");
        case "created":
        default:
          return b.createdAt - a.createdAt;
      }
    });
    return list;
  }, [sessions, search, statusFilter, topicFilter, formatFilter, sortKey]);

  const openAdd = () => {
    setEditing(null);
    setShowForm(true);
  };
  const openEdit = (session: TrainingSession) => {
    setEditing(session);
    setShowForm(true);
  };
  const handleSubmit = (input: SessionInput) => {
    if (editing) updateSession(editing.id, input);
    else addSession(input);
    setShowForm(false);
    setEditing(null);
  };
  const handleDelete = (session: TrainingSession) => {
    if (window.confirm(t("confirmDelete"))) deleteSession(session.id);
  };

  const selectClass =
    "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none";

  return (
    <div className="min-h-screen font-sans">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-lg font-bold text-white">
              A
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                {t("appTitle")}
              </h1>
              <p className="text-sm text-slate-500">{t("appSubtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLang}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              title="TH / EN"
            >
              {lang === "th" ? "🇹🇭 ไทย" : "🇬🇧 EN"}
            </button>
            <button
              onClick={() => exportSessionsToCsv(visibleSessions, lang)}
              disabled={visibleSessions.length === 0}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ⬇ {t("exportCsv")}
            </button>
            <button
              onClick={openAdd}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              + {t("addSession")}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {storageError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {t("storageFull")}
          </div>
        )}

        {/* Summary */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <SummaryCard
            label={t("totalSessions")}
            value={String(summary.totalSessions)}
          />
          <SummaryCard
            label={t("totalUniversities")}
            value={String(summary.totalUniversities)}
            accent="text-blue-600"
          />
          <SummaryCard
            label={t("totalAttendees")}
            value={summary.totalAttendees.toLocaleString()}
            accent="text-teal-600"
          />
          <SummaryCard
            label={t("upcoming")}
            value={String(summary.upcoming)}
            accent="text-amber-600"
          />
          <SummaryCard
            label={t("completedCount")}
            value={String(summary.completed)}
            accent="text-emerald-600"
          />
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            className={`${selectClass} min-w-[200px] flex-1`}
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className={selectClass}
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as SessionStatus | "all")
            }
          >
            <option value="all">{t("filterStatus")}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`status_${s}` as const)}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value as Topic | "all")}
          >
            <option value="all">{t("filterTopic")}</option>
            {TOPICS.map((tp) => (
              <option key={tp} value={tp}>
                {t(`topic_${tp}` as const)}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value as Format | "all")}
          >
            <option value="all">{t("filterFormat")}</option>
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {t(`format_${f}` as const)}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="date">{t("sortDate")}</option>
            <option value="university">{t("sortUniversity")}</option>
            <option value="created">{t("sortCreated")}</option>
          </select>

          <div className="ml-auto inline-flex rounded-lg border border-slate-300 bg-white p-0.5">
            <button
              onClick={() => setView("table")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                view === "table"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              ▤ {t("tableView")}
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                view === "calendar"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              ▦ {t("calendarView")}
            </button>
          </div>
        </div>

        {/* Calendar view */}
        {view === "calendar" && (
          <CalendarView sessions={visibleSessions} onSelect={openEdit} />
        )}

        {/* Table / empty state */}
        {view === "table" &&
          (visibleSessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <p className="text-lg font-semibold text-slate-700">
                {t("emptyTitle")}
              </p>
              <p className="mt-1 text-sm text-slate-500">{t("emptyDesc")}</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">{t("university")}</th>
                      <th className="px-4 py-3">{t("topic")}</th>
                      <th className="px-4 py-3">{t("audience")}</th>
                      <th className="px-4 py-3">{t("date")}</th>
                      <th className="px-4 py-3">{t("time")}</th>
                      <th className="px-4 py-3">{t("format")}</th>
                      <th className="px-4 py-3 text-right">{t("attendees")}</th>
                      <th className="px-4 py-3">{t("status")}</th>
                      <th className="px-4 py-3">{t("meetingUrl")}</th>
                      <th className="px-4 py-3 text-right">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleSessions.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">
                            {s.university}
                          </div>
                          {s.faculty && (
                            <div className="text-slate-500">{s.faculty}</div>
                          )}
                          {s.trainer && (
                            <div className="mt-0.5 text-xs text-slate-400">
                              {t("trainer")}: {s.trainer}
                            </div>
                          )}
                          {s.notes && (
                            <div className="mt-0.5 text-xs text-slate-400">
                              {s.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              TOPIC_STYLES[s.topic]
                            }`}
                          >
                            {topicText(s)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              AUDIENCE_STYLES[s.audience]
                            }`}
                          >
                            {t(`audience_${s.audience}` as const)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <DateBadge iso={s.date} />
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatTimeRange(s.startTime, s.endTime) || (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium ${
                              FORMAT_STYLES[s.format]
                            }`}
                          >
                            {t(`format_${s.format}` as const)}
                          </span>
                          {s.location && (
                            <div className="mt-0.5 text-xs text-slate-400">
                              {s.location}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700">
                          {s.registeredAttendees || s.expectedAttendees ? (
                            <span>
                              <span className="font-medium">
                                {s.registeredAttendees}
                              </span>
                              <span className="text-slate-400">
                                {" "}
                                / {s.expectedAttendees}
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                              STATUS_STYLES[s.status]
                            }`}
                          >
                            {t(`status_${s.status}` as const)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {s.meetingUrl ? (
                            <a
                              href={s.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                              title={s.meetingUrl}
                            >
                              🔗 {t("openLink")}
                            </a>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEdit(s)}
                              className="rounded-md px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                            >
                              {t("edit")}
                            </button>
                            <button
                              onClick={() => handleDelete(s)}
                              className="rounded-md px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              {t("delete")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
      </main>

      {showForm && (
        <SessionForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent = "text-slate-800",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
