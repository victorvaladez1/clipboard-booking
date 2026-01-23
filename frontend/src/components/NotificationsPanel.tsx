import { useEffect, useState } from "react";
import {
    listNotifications,
    markNotificationRead,
    type Notification,
} from "../api/notifications";

type Props = {
    customerId: number | null;
}


export default function NotificationsPanel({ customerId }: Props) {
    const [items, setItems] = useState<Notification[]>([]);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    async function refresh() {
        if (!customerId) return;
        try {
            setErr("");
            setLoading(true);
            const data = await listNotifications(customerId, true); // unread only
            setItems(data);
        } catch (e: any) {
            setErr(e?.message || "Failed to load notifications");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refresh();
        if (!customerId) return;
        
        const t = setInterval(refresh, 10_000); // poll every 10s
        return () => clearInterval(t);
    }, [customerId]);

    async function onMarkRead(id: number) {
        try {
            await markNotificationRead(id);
            setItems((prev) => prev.filter((n) => n.id !== id));
        } catch (e: any) {
            setErr(e?.message || "Failed to mark as read");
        }
    }
    
    return (
        <div className="rounded border p-3">
            <div className="mb-2 flex items-center justify-between">
                <div className="font-medium">
                    Notifications{" "}
                    <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-sm">
                        {items.length}
                    </span>
                </div>
                <button
                    className="text-sm underline disabled:opacity-50"
                    onClick={refresh}
                    disabled={!customerId || loading}
                >
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>
            {!customerId ? (
                <div className="text-sm text-gray-600">Book once to get a customer id.</div>
            ) : err ? (
                <div className="text-sm text-red-600">{err}</div>
            ) : items.length === 0 ? (
                <div className="text-sm text-gray-600">No unread notifications.</div>
            ) : (
                <ul className="space-y-2">
                    {items.map((n) => (
                        <li key={n.id} className="rounded bg-gray-50 p-2">
                            <div className="text-sm">{n.message}</div>
                            <div className="mt-1 flex items-center justify-between">
                                <div className="text-xs text-gray-500">
                                    {new Date(n.created_at).toLocaleString()}
                                </div>
                                <button
                                    className="text-xs underline"
                                    onClick={() => onMarkRead(n.id)}
                                >
                                    Mark read
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}