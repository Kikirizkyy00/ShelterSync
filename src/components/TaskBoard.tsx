"use client";

import React from "react";
import type { Task } from "../app/types";
interface TaskBoardProps {
  tasks: Task[];
  onAttachClick: (task: Task) => void;
}

export default function TaskBoard({ tasks, onAttachClick }: TaskBoardProps) {
  const columns = [
    { id: "Todo", title: "To Do", dotColor: "var(--amber-600)" },
    { id: "InProgress", title: "In Progress", dotColor: "var(--purple-400)" },
    { id: "Done", title: "Done", dotColor: "var(--green-600)" },
  ];

  const getColTasks = (colId: string) => tasks.filter((t) => t.status === colId);

  return (
    <main className="board wrapper">
      {columns.map((col) => {
        const colTasks = getColTasks(col.id);
        return (
          <div className="col" key={col.id}>
            <div className="col-head">
              <h3 className="col-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: col.dotColor }} />
                {col.title}
              </h3>
              <span className="col-count">{colTasks.length}</span>
            </div>

            <div className="task-list">
              {colTasks.length === 0 ? (
                <div className="empty" style={{ padding: "1.5rem 0", fontSize: "12px" }}>
                  No tasks here
                </div>
              ) : (
                colTasks.map((task) => (
                  <div className="task-card" key={task.id}>
                    <div className="task-top">
                      <h4 className="task-title">{task.title}</h4>
                      <span className="prio prio-high">High</span>
                    </div>

                    <div className="task-meta">
                      <span className="avatar">UI</span>
                      <span className="avatar" style={{ background: "var(--teal-100)", color: "var(--teal-600)" }}>AK</span>
                      {task.cid && <span className="file-pill">🔗 Shelby</span>}
                      <span className="due">10/04</span>
                    </div>

                    <div className="task-actions">
                      <button className="btn-move" style={{ flex: 1 }}>
                        {col.id === "Todo" ? "⚡ Start" : col.id === "InProgress" ? "✓ Done" : "Reset"}
                      </button>
                      <button 
                        className="btn-attach" 
                        style={{ flex: 1 }}
                        onClick={() => onAttachClick(task)}
                      >
                        + Attach to Shelby
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button className="col-add">+ Add task</button>
          </div>
        );
      })}
    </main>
  );
}