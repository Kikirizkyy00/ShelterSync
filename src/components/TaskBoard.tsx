"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { Status, Task } from "@/lib/types";
import TaskCard from "./TaskCard";
import AddTaskModal from "./AddTaskModal";
import UploadModal from "./UploadModal";

const COLUMNS: { id: Status; label: string }[] = [
  { id: "todo", label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "done", label: "Done" },
];

export default function TaskBoard() {
  // Added moveTask back to the hook destructuring
  const { tasks, addTask, moveTask, byStatus } = useTasks();
  const [addModal, setAddModal] = useState<Status | null>(null);
  const [uploadTarget, setUploadTarget] = useState<{ id: number; name: string } | null>(null);

  return (
    <div>
      <div className="stats">
        <StatCard label="Total tasks" value={tasks.length} />
        <StatCard label="To Do" value={byStatus("todo").length} />
        <StatCard label="In Progress" value={byStatus("in-progress").length} />
        <StatCard label="Done" value={byStatus("done").length} />
      </div>

      <div className="board">
        {COLUMNS.map((col) => (
          <div key={col.id} className="col">
            <div className="col-head">
              <span className="col-title">{col.label}</span>
              <span className="col-count">{byStatus(col.id).length}</span>
            </div>
            <div className="task-list">
              {byStatus(col.id).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  // Connected the moveTask function here
                  onMove={() => moveTask(task.id)}
                  onUpload={() => setUploadTarget({ id: task.id, name: task.title })}
                />
              ))}
            </div>
            <button className="col-add" onClick={() => setAddModal(col.id)}>
              + Add task
            </button>
          </div>
        ))}
      </div>

      {addModal && (
        <AddTaskModal
          defaultStatus={addModal}
          onSave={(data) => {
            addTask(data);
            setAddModal(null);
          }}
          onClose={() => setAddModal(null)}
        />
      )}

      {uploadTarget && (
        <UploadModal
          id={uploadTarget.id}
          name={uploadTarget.name}
          onClose={() => setUploadTarget(null)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}