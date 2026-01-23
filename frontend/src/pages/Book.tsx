import { useEffect, useState } from "react";
import { api } from "../api/client";

type Barber = {
  id: number;
  name: string;
};

type Service = {
  id: number;
  name: string;
  duration_minutes: number;
};

export default function Book() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedBarber, setSelectedBarber] = useState<number | "">("");
  const [selectedService, setSelectedService] = useState<number | "">("");

  useEffect(() => {
    async function load() {
      try {
        const [barbersData, servicesData] = await Promise.all([
          api<Barber[]>("/api/barbers/"),
          api<Service[]>("/api/services/"),
        ]);

        setBarbers(barbersData);
        setServices(servicesData);
      } catch (err: any) {
        setError(err.message ?? "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-semibold">Book an Appointment</h1>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium">Barber</label>
        <select
          className="w-full rounded border p-2"
          value={selectedBarber}
          onChange={(e) => setSelectedBarber(Number(e.target.value))}
        >
          <option value="">Select a barber</option>
          {barbers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium">Service</label>
        <select
          className="w-full rounded border p-2"
          value={selectedService}
          onChange={(e) => setSelectedService(Number(e.target.value))}
        >
          <option value="">Select a service</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.duration_minutes} min)
            </option>
          ))}
        </select>
      </div>

      <pre className="mt-6 rounded bg-gray-100 p-3 text-sm">
        {JSON.stringify({ selectedBarber, selectedService }, null, 2)}
      </pre>
    </div>
  );
}
