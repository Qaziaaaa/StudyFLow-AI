// Types shared between client and server

export type Priority = "High" | "Medium" | "Low";

export interface AssignmentInput {
  title: string;
  description: string;
  dueDate: string;
  // Optional extra context
  subject?: string;         // e.g. "History", "Maths", "Computer Science"
  wordCount?: number;       // expected word count if it's a writing task
  assignmentType?: string;  // e.g. "Essay", "Report", "Presentation", "Coding project"
}

export interface Task {
  name: string;
  estimatedHours: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface ScheduleEntry {
  day: string;
  activity: string;
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
