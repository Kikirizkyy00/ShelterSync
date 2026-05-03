"use client";

import { useState, useEffect, useRef } from "react";

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
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open && unreadCount > 0) markAllAsRead();
        }}
        aria-label={`${unreadCount} notifikasi belum dibaca`}
        className="relative text-xl p-1"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white
                           text-xs w-4 h-4 flex items-center justify-center rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 bg-white shadow-lg rounded w-72
                        z-50 max-h-80 overflow-y-auto">
          <div className="px-3 py-2 border-b font-semibold text-sm text-gray-600">
            Notifikasi
          </div>
          {notifications.length === 0 && (
            <p className="text-sm text-gray-400 p-3">Tidak ada notifikasi.</p>
          )}
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`px-3 py-2 border-b text-sm ${
                n.read ? "text-gray-500" : "font-medium bg-blue-50 text-gray-900"
              }`}
            >
              <p>{n.title}</p>
              <p className="text-xs text-gray-400">{n.message}</p>
              <p className="text-xs text-gray-300 mt-0.5">
                {new Date(n.created_at).toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}