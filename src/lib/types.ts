export type Status = "todo" | "in-progress" | "done";

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: Status;
  createdAt: string;
  priority: "High" | "Medium" | "Low";
  assignee: string;
  tag?: string;
  fileCount: number;
  dueDate?: string;
}