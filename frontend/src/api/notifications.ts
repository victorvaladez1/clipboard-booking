import { api } from "./client"

export type Notification = {
    id: number;
    customer: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export function listNotifications(customerId: number, unreadOnly = false) {
    const q = new URLSearchParams({ customer_id: String(customerId) });
    if (unreadOnly) q.set("unread", "true");
    return api<Notification[]>(`/api/notifications/?${q.toString()}`);
}

export function markNotificationRead(id: number) {
    return api<{ ok: boolean }>(`/api/notifications/${id}/read/`, { method: "POST"});
}