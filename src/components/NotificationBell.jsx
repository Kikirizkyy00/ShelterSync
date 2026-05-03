import { useState, useEffect, useRef } from "react";

// Shape notifikasi yang diharapkan dari API:
// { id: string, message: string, read: boolean, createdAt: string }

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const ref = useRef(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifikasi saat dropdown dibuka
  useEffect(() => {
    if (!open || !userId) return;

    async function fetchNotifications() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/notifications?userId=${userId}`);
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        setError("Gagal memuat notifikasi.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [open, userId]);

  // Tandai semua sebagai sudah dibaca saat dropdown dibuka
  async function markAllAsRead() {
    try {
      await fetch(`/api/notifications/read-all`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Gagal mark as read:", err);
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  function handleOpen() {
    setOpen((prev) => {
      if (!prev && unreadCount > 0) markAllAsRead();
      return !prev;
    });
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell button dengan badge */}
      <button
        onClick={handleOpen}
        className="relative text-xl p-1"
        aria-label={`Notifikasi, ${unreadCount} belum dibaca`}
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs
                           w-4 h-4 flex items-center justify-center rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 bg-white shadow-lg rounded w-72 z-50
                        max-h-80 overflow-y-auto">
          <div className="px-3 py-2 border-b font-semibold text-sm text-gray-600">
            Notifikasi
          </div>

          {loading && (
            <p className="text-sm text-gray-400 p-3">Memuat...</p>
          )}

          {error && (
            <p className="text-sm text-red-500 p-3">{error}</p>
          )}

          {!loading && !error && notifications.length === 0 && (
            <p className="text-sm text-gray-400 p-3">Tidak ada notifikasi.</p>
          )}

          {!loading && !error && notifications.map((item) => (
            <div
              key={item.id}
              className={`px-3 py-2 border-b text-sm ${
                item.read ? "text-gray-500" : "text-gray-900 font-medium bg-blue-50"
              }`}
            >
              <p>{item.message}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(item.createdAt).toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}