"use client";

import { useState } from "react";
import { Status, Priority, Task } from "@/lib/types";

export default function AddTaskModal({
  defaultStatus,
  onSave,
  onClose,
}: {
  defaultStatus: Status;
  onSave: (data: Omit<Task, "id">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    tag: "",
    priority: "Medium" as Priority,
    dueDate: "",
    assignee: "",
    status: defaultStatus,
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave({ ...form, title: form.title.trim(), assignee: form.assignee.trim() || "?" });
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h2 className="modal-title">New task</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="form-group">
          <label className="label">Title *</label>
          <input className="input" placeholder="e.g. Design login page" value={form.title} onChange={(e) => set("title", e.target.value)} />
        </div>

        <div className="form-group">
          <label className="label">Tag</label>
          <input className="input" placeholder="e.g. Design, Backend, QA..." value={form.tag} onChange={(e) => set("tag", e.target.value)} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="label">Priority</label>
            <select className="select" value={form.priority} onChange={(e) => set("priority", e.target.value as Priority)}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Due date</label>
            <input className="input" type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="label">Assignee</label>
            <input className="input" placeholder="Initials, e.g. AK" value={form.assignee} onChange={(e) => set("assignee", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Status</label>
            <select className="select" value={form.status} onChange={(e) => set("status", e.target.value as Status)}>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!form.title.trim()}>Save task</button>
        </div>
      </div>
    </div>
  );
}
