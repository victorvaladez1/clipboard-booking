import { useEffect, useState, useCallback } from "react";
import { cancelAppointment, listCustomerAppointments, type Appointment } from "../api/myAppointments";

type Props = { customerId: number | null };

export default function MyAppointments({ customerId }: Props) {

    const [items, setItems] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const refresh = useCallback(async () => {
        if (!customerId) return;
        try {
            setErr("");
            setLoading(true);
            const data = await listCustomerAppointments(customerId);
            setItems(data);
        } catch (e: unknown) {
            if (e instanceof Error) {
                setErr(e.message);
            } else {
                setErr("Failed to load appointments");
            }
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    async function onCancel(id: number) {
        try {
            await cancelAppointment(id);
            await refresh();
        } catch (e: unknown) {
            if (e instanceof Error) {
                setErr(e.message);
            } else {
                setErr("Cancel failed");
            }
        }
    }

    return (
        <div className="mt-6 rounded border p-3">
            <div className="mb-2 flex items-center justify-between">
                <div className="font-medium">My appointments</div>
                <button className="text-sm underline disabled:opacity-50" onClick={refresh} disabled={!customerId || loading}>
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {!customerId ? (
                <div className="text-sm text-gray-600">Book once to see your appointments.</div>
            ) : err ? (
                <div className="text-sm text-red-600">{err}</div>
            ) : items.length === 0 ? (
                <div className="text-sm text-gray-600">No applications yet.</div>
            ) : (
                <ul className="space-y-2">
                    {items.map((a) => {
                        const start = new Date(a.start_time);
                        const end = new Date(a.end_time);
                        const canCancel = a.status === "BOOKED";
                        return (
                            <li key={a.id}>
                                <div className="text-sm font-medium">
                                    {start.toLocaleString()} - {end.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit" })}
                                </div>
                                <div className="text-xs text-gray-600">Status: {a.status}</div>
                                {canCancel ? (
                                    <button className="mt-2 text-xs underline" onClick={() => onCancel(a.id)}>
                                        Cancel
                                    </button>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}