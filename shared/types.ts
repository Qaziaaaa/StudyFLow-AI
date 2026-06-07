// Shared types used by both the client and server

export type Priority = "High" | "Medium" | "Low";

export interface AssignmentInput {
  title: string;       // max 255 chars
  description: string; // max 2000 chars
  dueDate: string;     // ISO 8601 date string (YYYY-MM-DD)
}

export interface Task {
  name: string;
  estimatedHours: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface ScheduleEntry {
  day: string;      // "Day 1", "Day 2", ...
  activity: string; // task name(s) or empty string
}

export interface StudyPlan {
  summary: string;
  difficulty: "Easy" | "Medium" | "Hard";
  priority: Priority;
  tasks: Task[];          // at least 1 element
  schedule: ScheduleEntry[]; // at least 1 element
}

export interface GeneratePlanRequest {
  title: string;
  description: string;
  dueDate: string; // ISO 8601 date string
}

export interface GeneratePlanResponse {
  studyPlan: StudyPlan;
}

export interface ErrorResponse {
  error: string;
  fields?: string[]; // populated for 400 validation errors
}
