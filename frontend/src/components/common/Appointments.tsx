import { useEffect, useMemo, useState } from "react";
import { Modal, Button, Avatar, notification } from "antd";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  User,
  Stethoscope,
  FileText,
  ArrowUpDown,
  CalendarPlus,
} from "lucide-react";
import { useAuth } from "../../providers/AuthContext";
import _env from "../../utils/_env";
import { getUserImage } from "../../hooks/image";

type Person = {
  _id: string;
  fullName: string;
  email?: string;
  profile_image?: string;
};

type Appointment = {
  _id: string;
  patientId: Person;
  doctorId: Person;
  date: string;
  time: string;
  reason: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "confirmed":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "completed":
      return "bg-green-50 text-green-700 border-green-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
};

const Appointments = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"latest" | "earliest">("latest");
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${_env.SERVER_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load appointments");

      setAppointments(data);
    } catch (err) {
      notification.error({
        message: err instanceof Error ? err.message : "Failed to load appointments",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  const updateStatus = async (status: Appointment["status"]) => {
    if (!token || !selected) return;

    try {
      const res = await fetch(`${_env.SERVER_URL}/appointments/${selected._id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to update appointment");

      notification.success({ message: "Appointment updated" });
      setOpen(false);
      fetchAppointments();
    } catch (err) {
      notification.error({
        message: err instanceof Error ? err.message : "Failed to update appointment",
      });
    }
  };

  const filteredAppointments = useMemo(
    () =>
      appointments
        .filter((appt) => statusFilter === "all" || appt.status === statusFilter)
        .sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`).getTime();
          const dateB = new Date(`${b.date} ${b.time}`).getTime();
          return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
        }),
    [appointments, sortOrder, statusFilter],
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Appointments</h2>
        <p className="text-sm text-gray-500">Manage and view your appointments</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                statusFilter === status
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortOrder((prev) => (prev === "latest" ? "earliest" : "latest"))}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <ArrowUpDown size={16} />
            {sortOrder === "latest" ? "Latest" : "Earliest"}
          </button>
          {user?.role === "patient" && (
            <button
              onClick={() => navigate("./book")}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              <CalendarPlus size={16} /> Book an Appointment
            </button>
          )}
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <p className="text-lg">{loading ? "Loading appointments..." : "No appointments found"}</p>
          <p className="text-sm">Try changing filters</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAppointments.map((appt) => {
            const otherPerson = user?.role === "doctor" ? appt.patientId : appt.doctorId;

            return (
              <button
                key={appt._id}
                onClick={() => {
                  setSelected(appt);
                  setOpen(true);
                }}
                className="flex cursor-pointer flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex justify-between gap-3">
                  <p className="font-semibold">{appt.reason}</p>
                  <span className={`rounded-full border px-3 py-1 text-xs ${getStatusStyle(appt.status)}`}>
                    {appt.status}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Avatar src={getUserImage(otherPerson?.profile_image)}>
                    {otherPerson?.fullName?.[0]}
                  </Avatar>
                  <p className="text-sm text-gray-500">{otherPerson?.fullName || "N.A"}</p>
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <CalendarDays size={14} />
                    {new Date(appt.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {appt.time}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Modal open={open} onCancel={() => setOpen(false)} footer={null} centered>
        {selected && (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Appointment Details</h3>
            <div className="flex items-center gap-2"><FileText size={18} />{selected.reason}</div>
            <div className="flex items-center gap-3">
              <Avatar
                src={getUserImage(
                  user?.role === "doctor" ? selected.patientId.profile_image : selected.doctorId.profile_image,
                )}
              >
                {(user?.role === "doctor" ? selected.patientId.fullName : selected.doctorId.fullName)?.[0]}
              </Avatar>
              <div className="flex items-center gap-2">
                {user?.role === "doctor" ? <User size={18} /> : <Stethoscope size={18} />}
                {user?.role === "doctor" ? selected.patientId.fullName : selected.doctorId.fullName}
              </div>
            </div>
            <div className="flex items-center gap-2"><CalendarDays size={18} />{new Date(selected.date).toLocaleDateString()}</div>
            <div className="flex items-center gap-2"><Clock size={18} />{selected.time}</div>
            <span className={`w-fit rounded-full border px-3 py-1 text-xs ${getStatusStyle(selected.status)}`}>{selected.status}</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {user?.role === "doctor" && <Button type="primary" onClick={() => updateStatus("confirmed")}>Confirm</Button>}
              {user?.role === "doctor" && <Button onClick={() => updateStatus("completed")}>Complete</Button>}
              {selected.status !== "cancelled" && <Button danger onClick={() => updateStatus("cancelled")}>Cancel</Button>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Appointments;
