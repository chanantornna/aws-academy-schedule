// Training topics offered under AWS Academy & Tech Alliance.
export type Topic =
  | "genai_partyrock"
  | "genai_kiro"
  | "cloud_foundations"
  | "other";

// Who the session is aimed at.
export type Audience = "students" | "lecturers" | "both";

// Delivery format.
export type Format = "onsite" | "online" | "hybrid";

// Lifecycle of a training engagement, from first contact to completion.
export type SessionStatus =
  | "contacted"
  | "confirmed"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface TrainingSession {
  id: string;
  university: string; // host university
  faculty: string; // faculty / department (optional)
  topic: Topic;
  customTopic: string; // used when topic === "other"
  audience: Audience;
  trainer: string; // ERT trainer name(s)
  coordinator: string; // university-side contact person
  coordinatorContact: string; // email / phone / line
  date: string; // ISO date (yyyy-mm-dd) or ""
  startTime: string; // "HH:mm" or ""
  endTime: string; // "HH:mm" or ""
  format: Format;
  location: string; // building / room, or platform name
  meetingUrl: string; // online meeting / material link
  expectedAttendees: number;
  registeredAttendees: number;
  status: SessionStatus;
  notes: string;
  createdAt: number;
}

export type SessionInput = Omit<TrainingSession, "id" | "createdAt">;

export const TOPICS: Topic[] = [
  "genai_partyrock",
  "genai_kiro",
  "cloud_foundations",
  "other",
];

export const AUDIENCES: Audience[] = ["students", "lecturers", "both"];

export const FORMATS: Format[] = ["onsite", "online", "hybrid"];

export const STATUSES: SessionStatus[] = [
  "contacted",
  "confirmed",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
];
