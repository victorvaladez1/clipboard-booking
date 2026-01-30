import { api } from "./client";

export type Appointment = {
    id: number;
    barber: number;
    service: number;
    customer: number;
    start_time: string;
    end_time: string;
    status: string;
    notes?: string;
    created_at?: string;
};

export function listCustomerAppointments(customerId: number) {
    const q = new URLSearchParams({ customer_id: String(customerId) });
    return api<Appointment[]>(`/api/appointments/customer/?${q.toString()}`);
}

export function cancelAppointment(id: number) {
    return api<{ok: boolean}>(`/api/appointments/${id}/cancel/`, { method: "POST"});
}