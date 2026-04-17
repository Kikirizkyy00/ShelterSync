import { useState, useCallback } from "react";
import { Task, Status } from "@/lib/types";

const INITIAL_TASKS: Task[] = [
  { id: 1, title: "Design dashboard layout", tag: "UI/UX", priority: "High", dueDate: "2026-04-10", assignee: "AK", status: "todo" },
  { id: 2, title: "Integrate Shelby SDK", tag: "Backend", priority: "High", dueDate: "2026-04-12", assignee: "BR", status: "in-progress" },
  { id: 3, title: "Build notification system", tag: "Backend", priority: "Medium", dueDate: "2026-04-15", assignee: "CS", status: "in-progress" },
  { id: 4, title: "Write login tests", tag: "QA", priority: "Medium", dueDate: "2026-04-08", assignee: "DM", status: "done" },
  { id: 5, title: "Write API documentation", tag: "Docs", priority: "Low", dueDate: "2026-04-20", assignee: "AK", status: "todo" },
  { id: 6, title: "Setup CI/CD pipeline", tag: "DevOps", priority: "Medium", dueDate: "2026-04-18", assignee: "BR", status: "todo" },
];

let seq = 7;

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const addTask = useCallback((data: Omit<Task, "id">) => {
    setTasks((prev) => [...prev, { ...data, id: seq++ }]);
  }, []);

  const moveTask = useCallback((id: number) => {
    const next: Record<Status, Status> = {
      todo: "in-progress",
      "in-progress": "done",
      done: "todo",
    };
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: next[t.status] } : t))
    );
  }, []);

  const byStatus = useCallback(
    (status: Status) => tasks.filter((t) => t.status === status),
    [tasks]
  );

  return { tasks, addTask, moveTask, byStatus };
}
