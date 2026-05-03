import { useState } from "react";
import { sendNotification } from "../services/notification";

async function createTaskWithNotification({ title, assignee }) {
  // Replace with your actual DB call
  // await db.tasks.create({ title, assignee });

  await sendNotification({
    userId: assignee,
    title: "New Task Assigned",
    message: `Task: ${title}`,
  });
}

export default function CreateTask() {
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [status, setStatus] = useState(null); // 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    // Validate
    if (!title.trim() || !assignee.trim()) {
      setErrorMsg("Title and Assignee are required.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      await createTaskWithNotification({ title, assignee });
      setTitle("");
      setAssignee("");
      setStatus("success");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to create task. Please try again.");
      setStatus("error");
    }
  }

  const isLoading = status === "loading";

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4">
      <input
        className="border p-2 w-full"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isLoading}
      />
      <input
        className="border p-2 w-full"
        placeholder="Assignee User ID"
        value={assignee}
        onChange={(e) => setAssignee(e.target.value)}
        disabled={isLoading}
      />

      {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
      {status === "success" && (
        <p className="text-green-600 text-sm">Task created & notification sent!</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isLoading ? "Creating..." : "Create Task"}
      </button>
    </form>
  );
}