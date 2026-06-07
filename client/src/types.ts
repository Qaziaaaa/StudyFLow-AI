// Types shared between client and server
// This file is a copy of shared/types.ts inlined for the client build.

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
  tasks: Task[];
  schedule: ScheduleEntry[];
}

export interface GeneratePlanRequest {
  title: string;
  description: string;
  dueDate: string;
}

export interface GeneratePlanResponse {
  studyPlan: StudyPlan;
}

export interface ErrorResponse {
  error: string;
  fields?: string[];
}
