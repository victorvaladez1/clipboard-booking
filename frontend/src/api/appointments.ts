import { api } from "./client";

export type Appointment = {
    id: number;
    barber: number;
    service: number;
    customer: number;
    start_time: string;
    end_time: string;
    status: string;
}

export function listAppointmentsForDay(barberId: number, dateYYYYMMDD: string) {
    const q = new URLSearchParams({
        barber_id: String(barberId),
        date: dateYYYYMMDD,
    });

    return api<Appointment[]>(`/api/appointments/?${q.toString()}`);
}