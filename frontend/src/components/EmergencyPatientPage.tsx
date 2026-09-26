import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  ClipboardList,
  Droplet,
  FileText,
  HeartPulse,
  Paperclip,
  Phone,
  ShieldCheck,
  ShieldPlus,
  UserRound,
} from "lucide-react";
import _env from "../utils/_env";
import { useAuth } from "../providers/AuthContext";
import { getUserImage } from "../hooks/image";

type EmergencyData = {
  qrCodeId: string;
  accessLevel: "public" | "doctor";
  patient: {
    _id?: string;
    fullName: string;
    profile_image?: string;
    email?: string;
    gender?: string;
    age?: number;
    phone?: string;
    dateOfBirth?: string;
    patientId?: string;
    address?: {
      city?: string;
      state?: string;
      country?: string;
    };
  };
  emergency: {
    bloodGroup: string;
    allergies: string[];
    diseases: string[];
    emergencyContact?: {
      name?: string;
      phone?: string;
      relation?: string;
    } | null;
    emergencyNotes?: string;
  };
  clinical?: {
    healthRecord?: {
      weight?: number;
      height?: number;
      bmi?: number;
      bloodPressure?: {
        systolic?: number;
        diastolic?: number;
      };
    } | null;
    fullMedicalRecord?: {
      doctorNotes?: string;
      allergies?: string[];
      diseases?: string[];
      bloodGroup?: string;
      emergencyContact?: {
        name?: string;
        phone?: string;
        relation?: string;
      };
      dietPlan?: {
        morning?: string;
        afternoon?: string;
        evening?: string;
        notes?: string;
      };
      medications?: {
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
      }[];
    } | null;
    dietPlan?: {
      morning?: string;
      afternoon?: string;
      evening?: string;
      notes?: string;
    } | null;
    medications: {
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
    }[];
    doctorNotes?: string;
    reports: {
      fileUrl: string;
      type: string;
      date?: string;
    }[];
    uploadedRecords: {
      _id: string;
      title: string;
      description?: string;
      recordType?: string;
      issuedDate?: string;
      issuedByName?: string;
      fileUrl?: string;
      attachments?: {
        name?: string;
        url?: string;
      }[];
      doctorId?: {
        fullName?: string;
      };
      issuedByDoctorId?: {
        fullName?: string;
      };
      createdAt: string;
    }[];
    appointments: {
      _id: string;
      date: string;
      time: string;
      reason: string;
      status: "pending" | "confirmed" | "completed" | "cancelled";
      doctorId?: {
        _id?: string;
        fullName?: string;
        email?: string;
        profile_image?: string;
      };
    }[];
  } | null;
};

const Empty = ({ text }: { text: string }) => (
  <p className="text-sm text-gray-500">No {text} recorded.</p>
);

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : "N.A";

const formatRecordType = (value?: string) => {
  if (!value) return "Other";
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const EmergencyPatientPage = () => {
  const { qrCodeId } = useParams();
  const { token, user } = useAuth();
  const [data, setData] = useState<EmergencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const location = useMemo(() => {
    const address = data?.patient.address;
    return [address?.city, address?.state, address?.country]
      .filter(Boolean)
      .join(", ");
  }, [data?.patient.address]);

  useEffect(() => {
    const fetchEmergencyPatient = async () => {
      if (!qrCodeId) return;

      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${_env.SERVER_URL}/emergency/${qrCodeId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || "Unable to load emergency profile");
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchEmergencyPatient();
  }, [qrCodeId, token]);

  if (loading) {
    return (
      <main className="min-h-screen bg-red-50 px-4 py-16">
        <div className="mx-auto max-w-5xl text-center text-gray-700">
          Loading emergency profile...
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-red-50 px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-lg border border-red-200 bg-white p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-600" size={44} />
          <h1 className="text-2xl font-bold text-gray-900">QR not available</h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <Link className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-2 text-white" to="/scan">
            Scan again
          </Link>
        </div>
      </main>
    );
  }

  const isDoctorView = data.accessLevel === "doctor";
  const dietPlan = data.clinical?.dietPlan || data.clinical?.fullMedicalRecord?.dietPlan;
  const doctorNotes = data.clinical?.doctorNotes || data.clinical?.fullMedicalRecord?.doctorNotes;

  return (
    <main className="min-h-screen bg-red-50 text-gray-900">
      <section className="bg-red-700 px-4 py-8 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={getUserImage(data.patient.profile_image)}
              alt={data.patient.fullName}
              className="h-20 w-20 rounded-full border-4 border-white/30 object-cover shadow-lg"
            />
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-red-100">
                <ShieldCheck size={18} />
                Emergency Patient Profile
              </p>
              <h1 className="mt-2 text-3xl font-bold">{data.patient.fullName}</h1>
              <p className="mt-1 text-red-100">
                {data.patient.patientId || data.qrCodeId}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-white px-4 py-3 text-red-700">
            {isDoctorView
              ? "Doctor/admin access: full patient record"
              : "Public access: critical basics only"}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-8 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-lg font-bold">
            <UserRound className="text-blue-700" />
            Patient
          </div>
          <div className="space-y-2 text-sm">
            <p><strong>Age:</strong> {data.patient.age || "N.A"}</p>
            <p><strong>Gender:</strong> {data.patient.gender || "N.A"}</p>
            <p><strong>Date of birth:</strong> {formatDate(data.patient.dateOfBirth)}</p>
            <p><strong>Location:</strong> {location || "N.A"}</p>
            {isDoctorView && <p><strong>Phone:</strong> {data.patient.phone || "N.A"}</p>}
            {isDoctorView && <p><strong>Email:</strong> {data.patient.email || "N.A"}</p>}
          </div>
        </div>

        <div className="rounded-lg bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Droplet className="text-red-700" />
            Critical Details
          </div>
          <div className="space-y-2 text-sm">
            <p><strong>Blood group:</strong> {data.emergency.bloodGroup}</p>
            <p>
              <strong>Allergies:</strong>{" "}
              {data.emergency.allergies.length ? data.emergency.allergies.join(", ") : "N.A"}
            </p>
            <p>
              <strong>Diseases:</strong>{" "}
              {data.emergency.diseases.length ? data.emergency.diseases.join(", ") : "N.A"}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Phone className="text-green-700" />
            Emergency Contact
          </div>
          {data.emergency.emergencyContact ? (
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {data.emergency.emergencyContact.name || "N.A"}</p>
              <p><strong>Phone:</strong> {data.emergency.emergencyContact.phone || "N.A"}</p>
              <p><strong>Relation:</strong> {data.emergency.emergencyContact.relation || "N.A"}</p>
            </div>
          ) : (
            <Empty text="emergency contact" />
          )}
        </div>
      </section>

      {data.emergency.emergencyNotes && (
        <section className="mx-auto max-w-6xl px-4 pb-6">
          <div className="rounded-lg border border-red-200 bg-white p-5">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-bold">
              <AlertTriangle className="text-red-700" />
              Emergency Notes
            </h2>
            <p className="text-gray-700">{data.emergency.emergencyNotes}</p>
          </div>
        </section>
      )}

      {isDoctorView ? (
        <section className="mx-auto grid max-w-6xl gap-5 px-4 pb-10 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Activity className="text-blue-700" />
              Health Record
            </h2>
            {data.clinical?.healthRecord ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <p><strong>BMI:</strong> {data.clinical.healthRecord.bmi || "N.A"}</p>
                <p><strong>Weight:</strong> {data.clinical.healthRecord.weight || "N.A"} kg</p>
                <p><strong>Height:</strong> {data.clinical.healthRecord.height || "N.A"} cm</p>
                <p>
                  <strong>BP:</strong>{" "}
                  {data.clinical.healthRecord.bloodPressure
                    ? `${data.clinical.healthRecord.bloodPressure.systolic}/${data.clinical.healthRecord.bloodPressure.diastolic}`
                    : "N.A"}
                </p>
              </div>
            ) : (
              <Empty text="health record" />
            )}
          </div>

          <div className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <ShieldPlus className="text-red-700" />
              Full Clinical Record
            </h2>
            <div className="space-y-2 text-sm">
              <p><strong>Blood group:</strong> {data.clinical?.fullMedicalRecord?.bloodGroup || "N.A"}</p>
              <p><strong>Allergies:</strong> {data.clinical?.fullMedicalRecord?.allergies?.length ? data.clinical.fullMedicalRecord.allergies.join(", ") : "N.A"}</p>
              <p><strong>Diseases:</strong> {data.clinical?.fullMedicalRecord?.diseases?.length ? data.clinical.fullMedicalRecord.diseases.join(", ") : "N.A"}</p>
              <p><strong>Doctor notes:</strong> {doctorNotes || "N.A"}</p>
            </div>
          </div>

          <div className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <HeartPulse className="text-red-700" />
              Medications
            </h2>
            {data.clinical?.medications.length ? (
              <div className="space-y-3">
                {data.clinical.medications.map((medication) => (
                  <div className="rounded-lg border border-gray-200 p-3" key={`${medication.name}-${medication.dosage}`}>
                    <p className="font-semibold">{medication.name}</p>
                    <p className="text-sm text-gray-600">
                      {medication.dosage} | {medication.frequency} | {medication.duration}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="medications" />
            )}
          </div>

          <div className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <ClipboardList className="text-green-700" />
              Diet Plan
            </h2>
            <div className="space-y-2 text-sm">
              <p><strong>Morning:</strong> {dietPlan?.morning || "N.A"}</p>
              <p><strong>Afternoon:</strong> {dietPlan?.afternoon || "N.A"}</p>
              <p><strong>Evening:</strong> {dietPlan?.evening || "N.A"}</p>
              <p><strong>Notes:</strong> {dietPlan?.notes || "N.A"}</p>
            </div>
          </div>

          <div className="rounded-lg bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <FileText className="text-blue-700" />
              Clinical Reports
            </h2>
            {data.clinical?.reports.length ? (
              <div className="space-y-2">
                {data.clinical.reports.map((report) => (
                  <a
                    className="block rounded-lg border border-gray-200 p-3 text-sm text-blue-700"
                    href={report.fileUrl}
                    key={`${report.fileUrl}-${report.type}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {report.type || "Report"} - {formatDate(report.date)}
                  </a>
                ))}
              </div>
            ) : (
              <Empty text="reports" />
            )}
          </div>

          <div className="rounded-lg bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Paperclip className="text-blue-700" />
              Uploaded Medical Records
            </h2>
            {data.clinical?.uploadedRecords?.length ? (
              <div className="space-y-4">
                {data.clinical.uploadedRecords.map((record) => (
                  <div className="rounded-lg border border-gray-200 p-4" key={record._id}>
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-semibold">{record.title}</p>
                        <p className="text-sm text-gray-600">{formatRecordType(record.recordType)}</p>
                        <p className="mt-2 text-sm text-gray-700">{record.description || "No description"}</p>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p><strong>Issued by:</strong> {record.issuedByDoctorId?.fullName || record.issuedByName || record.doctorId?.fullName || "Patient / External Source"}</p>
                          <p><strong>Issued date:</strong> {formatDate(record.issuedDate)}</p>
                          <p><strong>Added on:</strong> {formatDate(record.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Attachments: {record.attachments?.length || (record.fileUrl ? 1 : 0)}
                      </div>
                    </div>

                    {!!(record.attachments?.length || record.fileUrl) && (
                      <div className="mt-3 flex flex-wrap gap-3">
                        {(record.attachments?.length
                          ? record.attachments
                          : record.fileUrl
                            ? [{ name: "Attachment", url: record.fileUrl }]
                            : []
                        ).map((attachment, index) => (
                          attachment.url ? (
                            <a
                              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-blue-700"
                              href={attachment.url}
                              key={`${attachment.url}-${index}`}
                              rel="noreferrer"
                              target="_blank"
                            >
                              {attachment.name || `Attachment ${index + 1}`}
                            </a>
                          ) : null
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="uploaded records" />
            )}
          </div>

          <div className="rounded-lg bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <CalendarDays className="text-green-700" />
              Appointments History
            </h2>
            {data.clinical?.appointments?.length ? (
              <div className="space-y-3">
                {data.clinical.appointments.map((appointment) => (
                  <div className="rounded-lg border border-gray-200 p-4" key={appointment._id}>
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start gap-3">
                        <img
                          src={getUserImage(appointment.doctorId?.profile_image)}
                          alt={appointment.doctorId?.fullName || "Doctor"}
                          className="h-12 w-12 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-semibold">{appointment.doctorId?.fullName || "Doctor N.A"}</p>
                          <p className="text-sm text-gray-600">{appointment.doctorId?.email || ""}</p>
                          <p className="mt-2 text-sm text-gray-700">{appointment.reason}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p><strong>Status:</strong> {appointment.status}</p>
                        <p><strong>Date:</strong> {formatDate(appointment.date)}</p>
                        <p><strong>Time:</strong> {appointment.time || "N.A"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="appointments" />
            )}
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-6xl px-4 pb-10">
          <div className="rounded-lg border border-blue-200 bg-white p-5 text-sm text-gray-700">
            Doctors and admins can log in before opening this QR to view the full patient record, all uploaded records, appointments, reports, health details, and notes.
          </div>
        </section>
      )}

      {!user && (
        <div className="mx-auto max-w-6xl px-4 pb-10">
          <Link className="inline-block rounded-lg bg-blue-700 px-5 py-2 text-white" to="/login">
            Doctor login
          </Link>
        </div>
      )}
    </main>
  );
};

export default EmergencyPatientPage;
