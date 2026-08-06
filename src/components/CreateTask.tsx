import React, { useState } from "react";
import { Task } from "@/lib/types";

interface CreateTaskProps {
  onAddTask: (task: Omit<Task, "id" | "createdAt">) => void;
}

export const CreateTask: React.FC<CreateTaskProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title,
      description,
      dueDate,
      status: "TODO",
    });

    setTitle("");
    setDescription("");
    setDueDate("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card">
      <input
        type="text"
        placeholder="Judul Tugas"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <textarea
        placeholder="Deskripsi"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:opacity-90">
        Tambah Tugas
      </button>
    </form>
  );
};
