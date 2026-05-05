"use client";

import { useState, useEffect, useRef } from "react";
import { useTasks } from "../hooks/useTasks"; // Connect to your task state

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { tasks } = useTasks(); // Monitor tasks for changes

  // Sync notifications with significant task changes (Example logic)
  useEffect(() => {
    const completedTasks = tasks.filter(t => t.status === "done");
    if (completedTasks.length > 0) {
      const newNotification: Notification = {
        id: `task-${Date.now()}`,
        title: "Tasks Completed",
        message: `${completedTasks.length} tasks have been moved to Done.`,
        read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications(prev => [newNotification, ...prev].slice(0, 5));
    }
  }, [tasks]); // Re-run whenever the task list updates

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open && unreadCount > 0) markAllAsRead();
        }}
        aria-label={`${unreadCount} unread notifications`}
        className="relative text-xl p-1 transition-transform active:scale-90"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white
                           text-[10px] font-bold w-4 h-4 flex items-center 
                           justify-center rounded-full shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 bg-white shadow-xl rounded-lg w-80
                        z-50 border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
            <span className="font-bold text-sm text-gray-700">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                NEW
              </span>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-10 px-4 text-center">
                <span className="text-2xl mb-2">✨</span>
                <p className="text-sm text-gray-400 font-medium">Your inbox is empty</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b transition-colors hover:bg-gray-50 text-sm ${
                    n.read ? "bg-white" : "bg-blue-50/50"
                  }`}
                >
                  <p className={`text-gray-900 ${!n.read ? "font-semibold" : "font-normal"}`}>
                    {n.title}
                  </p>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wider">
                    {new Intl.DateTimeFormat('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      month: 'short',
                      day: 'numeric' 
                    }).format(new Date(n.created_at))}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}