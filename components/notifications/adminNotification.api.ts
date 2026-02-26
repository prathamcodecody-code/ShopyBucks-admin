import {api} from "@/lib/api"; // your existing axios instance

export const adminNotificationApi = {
  getAll: (limit = 20) =>
    api.get(`/notifications?limit=${limit}`),

  getUnreadCount: () =>
    api.get(`/notifications/unread-count`),

  markAsRead: (id: number) =>
    api.patch(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.patch(`/notifications/read-all`),
};