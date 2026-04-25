"use client";

import { Task } from "@/lib/types";

const PRIO_CLASS: Record<string, string> = {
  High: "prio-high",
  Medium: "prio-med",
  Low: "prio-low",
};

const MOVE_LABEL: Record<string, string> = {
  todo: "→ Start",
  "in-progress": "→ Done",
  done: "↩ Reopen",
};

export default function TaskCard({
  task,
  onMove,
  onUpload,
}: {
  task: Task;
  onMove: () => void;
  onUpload: () => void;
}) {
  // Enhanced Date Formatter with safety
  const fmt = (d: string) => {
    if (!d || !d.includes("-")) return d || "";
    const parts = d.split("-");
    if (parts.length < 3) return d;
    const [, m, day] = parts;
    return `${day}/${m}`;
  };

  return (
    <div className="task-card">
      <div className="task-top">
        <span className="task-title">{task.title}</span>
        {/* Added fallback for priority class */}
        <span className={`prio ${PRIO_CLASS[task.priority] || "prio-low"}`}>
          {task.priority || "Low"}
        </span>
      </div>

      <div className="task-meta">
        {task.tag && <span className="tag">{task.tag}</span>}
        
        {/* This was your fix - perfect! */}
        <span className="avatar">
          {task.assignee ? task.assignee.slice(0, 2).toUpperCase() : "??"}
        </span>

        {task.fileCount ? (
          <span className="file-pill">
            {task.fileCount} file{task.fileCount !== 1 ? "s" : ""}
          </span>
        ) : null}

        {task.dueDate && <span className="due">{fmt(task.dueDate)}</span>}
      </div>

      <div className="task-actions">
        <button className="btn-move" onClick={onMove}>
          {MOVE_LABEL[task.status] || "Move"}
        </button>
        <button className="btn-attach" onClick={onUpload}>
          + Attach to Shelby
        </button>
      </div>
    </div>
  );
}