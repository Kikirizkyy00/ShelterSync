export type Priority = "High" | "Medium" | "Low";
export type Status = "todo" | "in-progress" | "done";

export type Task = {
  id: number;
  title: string;
  tag: string;
  priority: Priority;
  dueDate: string;
  assignee: string;
  status: Status;
  fileCount?: number;
};

export type ShelbyFile = {
  id: string;
  name: string;
  size: number;
  taskId: number;
  taskTitle: string;
  blobId: string;
  uploadedAt: string;
  downloadUrl: string;
};

export type UploadProgress = {
  step: number;
  label: string;
};
