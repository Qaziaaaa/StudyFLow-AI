// Types shared between client and server (local copy for Vercel build)

export type Priority = "High" | "Medium" | "Low";

export interface AssignmentInput {
  title: string;
  description: string;
  dueDate: string;
  subject?: string;
  wordCount?: number;
  assignmentType?: string;
}

export interface Task {
  name: string;
  estimatedHours: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface ScheduleEntry {
  day: string;
  /** List of task names assigned to this day (empty array = buffer/rest day) */
  tasks: string[];
  estimatedHours: number;
  /** Optional label override for special days like "Final review" */
  label?: string;
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
  subject?: string;
  wordCount?: number;
  assignmentType?: string;
}

export interface GeneratePlanResponse {
  studyPlan: StudyPlan;
}

export interface ErrorResponse {
  error: string;
  fields?: string[];
  code?: "junk_input" | "validation_failed" | "upstream_error" | "server_error";
}
