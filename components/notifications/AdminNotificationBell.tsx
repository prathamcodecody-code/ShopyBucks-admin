import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { adminNotificationApi } from "./adminNotification.api";
import AdminNotificationList from "./AdminNotificationList";

export default function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const fetchUnread = async () => {
    const res = await adminNotificationApi.getUnreadCount();
    setUnread(res.data.count);
  };

  useEffect(() => {
    fetchUnread();

    const interval = setInterval(fetchUnread, 15000); // polling
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded hover:bg-gray-100"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-lg z-50">
          <AdminNotificationList onRead={fetchUnread} />
        </div>
      )}
    </div>
  );
}