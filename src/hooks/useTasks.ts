import { useState, useCallback } from "react";
import { Task, Status } from "@/lib/types";

const INITIAL_TASKS: Task[] = [
  { id: "1", title: "Dashboard Design", tag: "UI", priority: "High", dueDate: "2026-04-10", assignee: "AK", status: "todo", createdAt: "2026-04-01", fileCount: 0 },
  { id: "2", title: "Shelby Integration", tag: "Dev", priority: "High", dueDate: "2026-04-12", assignee: "BR", status: "in-progress", createdAt: "2026-04-02", fileCount: 0 },
];

let seq = 3;

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const addTask = useCallback((data: Omit<Task, "id">) => {
    setTasks((prev) => [...prev, { ...data, id: String(seq++) }]);
  }, []);

  const moveTask = useCallback((id: string) => {
    const next: Record<Status, Status> = {
      todo: "in-progress",
      "in-progress": "done",
      done: "todo",
    };
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: next[t.status] } : t))
    );
  }, []);

  const byStatus = useCallback((status: Status) => tasks.filter((t) => t.status === status), [tasks]);

  return { tasks, addTask, moveTask, byStatus };
}