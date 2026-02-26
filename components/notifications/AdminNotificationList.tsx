import { useEffect, useState } from "react";
import { adminNotificationApi } from "./adminNotification.api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime); // ✅ REQUIRED

type Notification = {
  id: number;
  title: string;
  message: string;
  type: string;
  data: any;
  isRead: boolean;
  createdAt: string;
};

export default function AdminNotificationList({
  onRead,
}: {
  onRead: () => void;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    const res = await adminNotificationApi.getAll(20);
    setNotifications(res.data);
    setLoading(false);
  };

  const markAsRead = async (id: number) => {
    await adminNotificationApi.markAsRead(id);
    fetchNotifications();
    onRead();
  };

  const markAllRead = async () => {
    await adminNotificationApi.markAllAsRead();
    fetchNotifications();
    onRead();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="max-h-[450px] overflow-y-auto">
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <span className="font-semibold">Notifications</span>
        <button
          onClick={markAllRead}
          className="text-sm text-blue-600 hover:underline"
        >
          Mark all read
        </button>
      </div>

      {loading && (
        <div className="p-4 text-sm text-gray-500">Loading...</div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="p-4 text-sm text-gray-500">
          No notifications
        </div>
      )}

      {notifications.map((n) => (
        <div
          key={n.id}
          onClick={() => {
            markAsRead(n.id);
            if (n.data?.orderId) {
              window.location.href = `/orders/${n.data.orderId}`;
            }
          }}
          className={`px-4 py-3 cursor-pointer border-b hover:bg-gray-50 ${
            !n.isRead ? "bg-blue-50" : ""
          }`}
        >
          <div className="font-medium text-sm">{n.title}</div>
          <div className="text-sm text-gray-600">{n.message}</div>
          <div className="text-xs text-gray-400 mt-1">
            {dayjs(n.createdAt).fromNow()}
          </div>
        </div>
      ))}
    </div>
  );
}