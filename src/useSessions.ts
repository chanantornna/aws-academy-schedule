import { useCallback, useEffect, useRef, useState } from "react";
import type { SessionInput, TrainingSession } from "./types";

const STORAGE_KEY = "aws-academy-schedule.sessions";

/** Fill in defaults for any fields missing on older stored records. */
function normalize(raw: Partial<TrainingSession>): TrainingSession {
  return {
    id: raw.id ?? "",
    university: raw.university ?? "",
    faculty: raw.faculty ?? "",
    topic: raw.topic ?? "other",
    customTopic: raw.customTopic ?? "",
    audience: raw.audience ?? "students",
    trainer: raw.trainer ?? "",
    coordinator: raw.coordinator ?? "",
    coordinatorContact: raw.coordinatorContact ?? "",
    date: raw.date ?? "",
    startTime: raw.startTime ?? "",
    endTime: raw.endTime ?? "",
    format: raw.format ?? "onsite",
    location: raw.location ?? "",
    meetingUrl: raw.meetingUrl ?? "",
    expectedAttendees: raw.expectedAttendees ?? 0,
    registeredAttendees: raw.registeredAttendees ?? 0,
    status: raw.status ?? "contacted",
    notes: raw.notes ?? "",
    createdAt: raw.createdAt ?? Date.now(),
  };
}

function load(): TrainingSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalize);
  } catch {
    return [];
  }
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useSessions() {
  const [sessions, setSessions] = useState<TrainingSession[]>(load);
  const [storageError, setStorageError] = useState(false);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [sessions]);

  const addSession = useCallback((input: SessionInput) => {
    const session: TrainingSession = {
      ...input,
      id: makeId(),
      createdAt: Date.now(),
    };
    setSessions((prev) => [session, ...prev]);
  }, []);

  const updateSession = useCallback((id: string, input: SessionInput) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...input } : s))
    );
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { sessions, addSession, updateSession, deleteSession, storageError };
}
