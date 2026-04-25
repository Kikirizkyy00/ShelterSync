"use client";

import { useState } from "react";
import { Status, Task } from "@/lib/types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (data: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now(),
      title: data.title || "Untitled Task",
      description: data.description || "",
      status: data.status || "todo",
      // Adding defaults for the TaskCard UI
      priority: data.priority || "Medium",
      assignee: data.assignee || "User",
      tag: data.tag || "General",
      fileCount: data.fileCount || 0,
      dueDate: data.dueDate || new Date().toISOString().split('T')[0], 
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const moveTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          let nextStatus: Status = "todo";
          if (task.status === "todo") nextStatus = "in-progress";
          else if (task.status === "in-progress") nextStatus = "done";
          else if (task.status === "done") nextStatus = "todo";

          return { ...task, status: nextStatus };
        }
        return task;
      })
    );
  };

  const byStatus = (status: Status) => {
    return (tasks || []).filter((t) => t && t.status === status);
  };

  return {
    tasks,
    addTask,
    moveTask,
    byStatus,
  };
}