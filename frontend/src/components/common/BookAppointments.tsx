import { useEffect, useState } from "react";
import { notification } from "antd";
import { useNavigate } from "react-router-dom";
import _env from "../../utils/_env";
import { useAuth } from "../../providers/AuthContext";

type Doctor = {
  _id: string;
  fullName: string;
  email: string;
};

type Slot = {
  time: string;
  booked: number;
  available: boolean;
};

const BookAppointments = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!token) return;

      try {
        const res = await fetch(`${_env.SERVER_URL}/user/doctors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to load doctors");

        setDoctors(data);
        if (data[0]?._id) setDoctorId(data[0]._id);
      } catch (err) {
        notification.error({
          message: err instanceof Error ? err.message : "Failed to load doctors",
        });
      }
    };

    fetchDoctors();
  }, [token]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!token || !doctorId || !date) {
        setSlots([]);
        return;
      }

      try {
        const params = new URLSearchParams({ doctorId, date });
        const res = await fetch(`${_env.SERVER_URL}/appointments/slots?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to load slots");

        setSlots(data);
      } catch (err) {
        notification.error({
          message: err instanceof Error ? err.message : "Failed to load slots",
        });
      }
    };

    fetchSlots();
  }, [date, doctorId, token]);

  const handleBook = async () => {
    if (!token || !user) return;
    if (!doctorId || !date || !selectedTime || !reason.trim()) {
      return notification.error({ message: "Select doctor, date, slot and reason" });
    }

    setLoading(true);

    try {
      const res = await fetch(`${_env.SERVER_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ doctorId, date, time: selectedTime, reason }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Booking failed");

      notification.success({ message: "Appointment booked successfully" });
      navigate(`/${user.role}/appointments`);
    } catch (err) {
      notification.error({
        message: err instanceof Error ? err.message : "Booking failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Book Appointment</h2>
        <p className="text-sm text-gray-500">Choose a doctor, date, and available slot.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium">
          Doctor
          <select
            className="rounded border border-gray-300 p-2"
            value={doctorId}
            onChange={(e) => {
              setDoctorId(e.target.value);
              setSelectedTime("");
            }}
          >
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.fullName}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          Date
          <input
            type="date"
            className="rounded border border-gray-300 p-2"
            min={new Date().toISOString().split("T")[0]}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSelectedTime("");
            }}
          />
        </label>
      </div>

      {date && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {slots.map((slot) => (
            <button
              key={slot.time}
              disabled={!slot.available}
              onClick={() => setSelectedTime(slot.time)}
              className={`rounded border p-3 text-sm ${
                selectedTime === slot.time
                  ? "bg-blue-600 text-white"
                  : slot.available
                    ? "bg-green-50 text-green-700"
                    : "cursor-not-allowed bg-gray-200 text-gray-500"
              }`}
            >
              {slot.time}
              <span className="block text-xs">{slot.booked}/2 booked</span>
            </button>
          ))}
        </div>
      )}

      <textarea
        placeholder="Reason for visit"
        className="mt-6 w-full rounded border border-gray-300 p-3"
        rows={4}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      <button
        onClick={handleBook}
        className="mt-3 rounded bg-blue-600 px-5 py-2 text-white disabled:opacity-60"
        disabled={loading || !selectedTime}
      >
        {loading ? "Booking..." : "Book Appointment"}
      </button>
    </div>
  );
};

export default BookAppointments;
