import { useEffect, useState } from "react";
import { useLanguage } from "./LanguageContext";
import {
  AUDIENCES,
  CHECKLIST_ITEMS,
  FORMATS,
  STATUSES,
  TOPICS,
  type ChecklistKey,
  type SessionInput,
  type TrainingSession,
} from "./types";
import { checklistProgress } from "./utils";

interface Props {
  initial: TrainingSession | null;
  onSubmit: (input: SessionInput) => void;
  onCancel: () => void;
}

function emptyInput(): SessionInput {
  return {
    university: "",
    faculty: "",
    topic: "genai_partyrock",
    customTopic: "",
    audience: "students",
    trainer: "",
    coordinator: "",
    coordinatorContact: "",
    date: "",
    startTime: "",
    endTime: "",
    format: "onsite",
    location: "",
    meetingUrl: "",
    expectedAttendees: 0,
    registeredAttendees: 0,
    status: "contacted",
    checklist: {},
    remark: "",
    notes: "",
  };
}

export default function SessionForm({ initial, onSubmit, onCancel }: Props) {
  const { t } = useLanguage();
  const [form, setForm] = useState<SessionInput>(emptyInput);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (initial) {
      const { id: _id, createdAt: _createdAt, ...rest } = initial;
      void _id;
      void _createdAt;
      setForm(rest);
    } else {
      setForm(emptyInput());
    }
    setError(false);
  }, [initial]);

  const set = <K extends keyof SessionInput>(key: K, value: SessionInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleCheck = (key: ChecklistKey) =>
    setForm((f) => ({
      ...f,
      checklist: { ...f.checklist, [key]: !f.checklist[key] },
    }));

  const progress = checklistProgress(form.checklist);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.university.trim()) {
      setError(true);
      return;
    }
    onSubmit({
      ...form,
      university: form.university.trim(),
      faculty: form.faculty.trim(),
      customTopic: form.customTopic.trim(),
      trainer: form.trainer.trim(),
      coordinator: form.coordinator.trim(),
      coordinatorContact: form.coordinatorContact.trim(),
      location: form.location.trim(),
      meetingUrl: form.meetingUrl.trim(),
      remark: form.remark.trim(),
      notes: form.notes.trim(),
      expectedAttendees: Math.max(0, Number(form.expectedAttendees) || 0),
      registeredAttendees: Math.max(0, Number(form.registeredAttendees) || 0),
    });
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="mb-4 text-lg font-bold text-slate-800">
          {initial ? t("editSession") : t("addSession")}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* University */}
          <div className="sm:col-span-2">
            <label className={labelClass}>
              {t("university")} <span className="text-red-500">*</span>
            </label>
            <input
              className={inputClass}
              value={form.university}
              onChange={(e) => set("university", e.target.value)}
              placeholder="เช่น มหาวิทยาลัยเชียงใหม่"
            />
            {error && (
              <p className="mt-1 text-xs text-red-500">{t("required")}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>{t("faculty")}</label>
            <input
              className={inputClass}
              value={form.faculty}
              onChange={(e) => set("faculty", e.target.value)}
            />
          </div>

          {/* Topic */}
          <div>
            <label className={labelClass}>{t("topic")}</label>
            <select
              className={inputClass}
              value={form.topic}
              onChange={(e) =>
                set("topic", e.target.value as SessionInput["topic"])
              }
            >
              {TOPICS.map((tp) => (
                <option key={tp} value={tp}>
                  {t(`topic_${tp}` as const)}
                </option>
              ))}
            </select>
          </div>

          {form.topic === "other" && (
            <div className="sm:col-span-2">
              <label className={labelClass}>{t("customTopic")}</label>
              <input
                className={inputClass}
                value={form.customTopic}
                onChange={(e) => set("customTopic", e.target.value)}
              />
            </div>
          )}

          {/* Audience */}
          <div>
            <label className={labelClass}>{t("audience")}</label>
            <select
              className={inputClass}
              value={form.audience}
              onChange={(e) =>
                set("audience", e.target.value as SessionInput["audience"])
              }
            >
              {AUDIENCES.map((a) => (
                <option key={a} value={a}>
                  {t(`audience_${a}` as const)}
                </option>
              ))}
            </select>
          </div>

          {/* Trainer */}
          <div>
            <label className={labelClass}>{t("trainer")}</label>
            <input
              className={inputClass}
              value={form.trainer}
              onChange={(e) => set("trainer", e.target.value)}
            />
          </div>

          {/* Date */}
          <div>
            <label className={labelClass}>{t("date")}</label>
            <input
              type="date"
              className={inputClass}
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </div>

          {/* Times */}
          <div>
            <label className={labelClass}>{t("startTime")}</label>
            <input
              type="time"
              className={inputClass}
              value={form.startTime}
              onChange={(e) => set("startTime", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>{t("endTime")}</label>
            <input
              type="time"
              className={inputClass}
              value={form.endTime}
              onChange={(e) => set("endTime", e.target.value)}
            />
          </div>

          {/* Format */}
          <div>
            <label className={labelClass}>{t("format")}</label>
            <select
              className={inputClass}
              value={form.format}
              onChange={(e) =>
                set("format", e.target.value as SessionInput["format"])
              }
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {t(`format_${f}` as const)}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className={labelClass}>{t("location")}</label>
            <input
              className={inputClass}
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </div>

          {/* Meeting URL */}
          <div className="sm:col-span-2">
            <label className={labelClass}>{t("meetingUrl")}</label>
            <input
              type="url"
              className={inputClass}
              value={form.meetingUrl}
              onChange={(e) => set("meetingUrl", e.target.value)}
              placeholder={t("meetingUrlPlaceholder")}
            />
          </div>

          {/* Attendees */}
          <div>
            <label className={labelClass}>{t("expectedAttendees")}</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={form.expectedAttendees || ""}
              onChange={(e) =>
                set("expectedAttendees", Number(e.target.value) || 0)
              }
            />
          </div>
          <div>
            <label className={labelClass}>{t("registeredAttendees")}</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={form.registeredAttendees || ""}
              onChange={(e) =>
                set("registeredAttendees", Number(e.target.value) || 0)
              }
            />
          </div>

          {/* Coordinator */}
          <div>
            <label className={labelClass}>{t("coordinator")}</label>
            <input
              className={inputClass}
              value={form.coordinator}
              onChange={(e) => set("coordinator", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>{t("coordinatorContact")}</label>
            <input
              className={inputClass}
              value={form.coordinatorContact}
              onChange={(e) => set("coordinatorContact", e.target.value)}
              placeholder={t("coordinatorContactPlaceholder")}
            />
          </div>

          {/* Status */}
          <div className="sm:col-span-2">
            <label className={labelClass}>{t("status")}</label>
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) =>
                set("status", e.target.value as SessionInput["status"])
              }
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`status_${s}` as const)}
                </option>
              ))}
            </select>
          </div>

          {/* Checklist */}
          <div className="sm:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <label className={`${labelClass} mb-0`}>{t("checklist")}</label>
              <span className="text-xs font-medium text-slate-500">
                {progress.done}/{progress.total}
              </span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${(progress.done / progress.total) * 100}%`,
                  }}
                />
              </div>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {CHECKLIST_ITEMS.map((key) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-start gap-2 rounded px-1.5 py-1 text-sm hover:bg-white"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={!!form.checklist[key]}
                      onChange={() => toggleCheck(key)}
                    />
                    <span
                      className={
                        form.checklist[key]
                          ? "text-slate-400 line-through"
                          : "text-slate-700"
                      }
                    >
                      {t(`check_${key}` as const)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Remark */}
          <div className="sm:col-span-2">
            <label className={labelClass}>{t("remark")}</label>
            <input
              className={inputClass}
              value={form.remark}
              onChange={(e) => set("remark", e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="sm:col-span-2">
            <label className={labelClass}>{t("notes")}</label>
            <textarea
              className={`${inputClass} min-h-[72px] resize-y`}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            {t("save")}
          </button>
        </div>
      </form>
    </div>
  );
}
