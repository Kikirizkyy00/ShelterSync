"use client";

import React, { useState } from "react";
import StatusBar from "./StatusBar";
import TaskBoard from "./TaskBoard";
import StoragePanel from "./StoragePanel";
import UploadModal from "./UploadModal";
import type { Task } from "../app/types";
export default function TaskApp() {
  const [view, setView] = useState<"board" | "storage">("board");
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  // Production-ready initial task matrices mapped to your user profile state
  const [tasks] = useState<Task[]>([
    {
      id: "1",
      title: "Dashboard Design",
      description: "Polishing UI specs",
      assignedTo: "Kikirizkyy00",
      status: "Todo",
      cid: "",
      createdAt: Date.now(),
    },
    {
      id: "2",
      title: "Shelby Integration",
      description: "Connecting Multipart streams to Move contracts",
      assignedTo: "Kikirizkyy00",
      status: "InProgress",
      cid: "QmXxx...",
      createdAt: Date.now(),
    }
  ]);

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Top Navigation & Web3 Network State Banner */}
      <StatusBar currentView={view} setView={setView} />
      
      {/* Primary Dashboard Dynamic View Render */}
      {view === "board" ? (
        <TaskBoard 
          tasks={tasks} 
          onAttachClick={(task) => setActiveTask(task)} 
        />
      ) : (
        <div className="wrapper">
          <StoragePanel />
        </div>
      )}

      {/* Cryptographic File Upload Gateway overlay */}
      {activeTask && (
        <UploadModal 
          task={activeTask} 
          onClose={() => setActiveTask(null)} 
        />
      )}
    </div>
  );
}