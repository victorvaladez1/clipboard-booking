import { useEffect, useMemo, useState } from "react";
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

type Customer = {
  id: number;
  name: string;
  phone: string;
}

type Appointment = {
  id: number;
  barber: number;
  service: number;
  customer: number;
  start_time: string;
  end_time: string;
  status: string;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

// Convert "YYYY-MM-DDTHH:mm" (local) -> ISO string (UTC) expected by backend
function localInputToUtcIso(localValue: string) {
  const d = new Date(localValue);
  return d.toISOString();
}

export default function Book() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedBarber, setSelectedBarber] = useState<number | "">("");
  const [selectedService, setSelectedService] = useState<number | "">("");

  // booking inputs
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [startLocal, setStartLocal] = useState(""); // datetime-local value

  //UX state
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState("");
 
  useEffect(() => {
    async function load() {
      try {
        const [barbersData, servicesData] = await Promise.all([
          api<Barber[]>("/api/barbers/"),
          api<Service[]>("/api/services/"),
        ]);

        setBarbers(barbersData);
        setServices(servicesData);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load data");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const selectedServiceObj = useMemo(() => {
    if (!selectedService) return null;
    return services.find((s) => s.id === selectedService) ?? null;
  }, [selectedService, services]);

  const computedEndLocal = useMemo(() => {
    if (!startLocal || !selectedServiceObj) return "";
    const start = new Date(startLocal);
    const end = addMinutes(start, selectedServiceObj.duration_minutes);

    // convert back to "YYYY-MM-DDTTHH:mm" for display
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = end.getFullYear();
    const mm = pad(end.getMonth() + 1);
    const dd = pad(end.getDate());
    const hh = pad(end.getHours());
    const mi = pad(end.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }, [startLocal, selectedServiceObj]);

  async function handleBook() {
    setError("");
    setResultMsg("");

    if (!selectedBarber) return setError("Select a barber.");
    if (!selectedService) return setError("Select a service.");
    if (!customerName.trim()) return setError("Enter your name.");
    if (!startLocal) return setError("Pick a start time.");
    if (!selectedServiceObj) return setError("Invalid service selection.");

    setSubmitting(true);
    try {
      // 1) create customer
      const customer = await api<Customer>("/api/customers/", {
        method: "POST",
        body: JSON.stringify({
          name: customerName.trim(),
          phone: customerPhone.trim(),
        }),
      });

      // 2) create appointment
      const startUtc = localInputToUtcIso(startLocal);
      const endUtc = addMinutes(new Date(startLocal), selectedServiceObj.duration_minutes).toISOString();

      const appt = await api<Appointment>("/api/appointments/", {
        method: "POST",
        body: JSON.stringify({
          barber: selectedBarber,
          service: selectedService,
          customer: customer.id,
          start_time: startUtc,
          end_time: endUtc,
          notes: "",
        }),
      });

      setResultMsg(`Booked! Appointment #${appt.id}`);
    } catch (err: any) {
      const msg = err?.message || "Booking failed";

      if (msg.includes("overlaps") || msg.includes("409")) {
        setError("That time is already taken. Try a different time.");
      } else {
        setError(msg);
      } 
    } finally {
        setSubmitting(false);
    }
  }


  if (loading) return <div className="p-6">Loading...</div>;
  if (error && !barbers.length && !services.length) return <div className="p-6 text-red-600">{error}</div>;

  const canSubmit = 
    !submitting &&
    !!selectedBarber &&
    !!selectedService &&
    customerName.trim().length > 0 &&
    startLocal.length > 0;

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-semibold">Book an Appointment</h1>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium">Barber</label>
        <select
          className="w-full rounded border p-2"
          value={selectedBarber}
          onChange={(e) => setSelectedBarber(e.target.value ? Number(e.target.value) : "")}
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
          onChange={(e) => setSelectedService(e.target.value ? Number(e.target.value) : "")}
        >
          <option value="">Select a service</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.duration_minutes} min)
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">Your name</label>
          <input
            className="w-full rounded border p-2"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Name"
          />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium">Phone (optional)</label>
        <input
          className="w-full rounded border p-2"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="832-555-1212"
        />
      </div>

      <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">Start time</label>
          <input
            type="datetime-local"
            className="w-full rounded border p-2"
            onChange={(e) => setStartLocal(e.target.value)}
          />
      </div>

      <div className="mb-4 text-sm text-gray-700">
          <div>
            <span className="font-medium">End time:</span>{" "}
            {computedEndLocal ? computedEndLocal.replace("T", " ") : "-"}
          </div>
      </div>

      <button
        className="w-full rounded bg-black p-2 text-white disabled:opacity-50"
        disabled={!canSubmit}
        onClick={handleBook}
      >
        {submitting ? "Booking..." : "Book appointment"}
      </button>

      {error ? <div className="mt-4 text-red-600">{error}</div> : null}
      {resultMsg ? <div className="mt-4 text-green-700">{resultMsg}</div> : null}

      <pre className="mt-6 rounded bg-gray-100 p-3 text-sm">
        {JSON.stringify(
          { 
            selectedBarber, 
            selectedService,
            customerName,
            customerPhone,
            startLocal,
            computedEndLocal,
          }, 
          null, 
          2
        )}
      </pre>
    </div>
  );
}
