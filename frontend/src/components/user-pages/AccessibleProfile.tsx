import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Avatar,
  Card,
  Col,
  Descriptions,
  Empty,
  Row,
  Spin,
  Statistic,
  Tag,
  Typography,
  notification,
} from "antd";
import { CalendarDays, FileText, HeartPulse, Paperclip, Phone, Pill, ShieldPlus, UserRound } from "lucide-react";
import _env from "../../utils/_env";
import { useAuth } from "../../providers/AuthContext";
import { getUserImage } from "../../hooks/image";

const { Title, Text, Paragraph } = Typography;

type ProfileUser = {
  _id: string;
  fullName: string;
  email: string;
  role: "admin" | "doctor" | "patient";
  patientId?: string;
  gender?: string;
  age?: number;
  phone?: string;
  dateOfBirth?: string;
  profile_image?: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
};

type HealthRecord = {
  bmi?: number;
  weight?: number;
  height?: number;
  bloodPressure?: {
    systolic?: number;
    diastolic?: number;
  };
};

type ClinicalMedicalRecord = {
  bloodGroup?: string;
  allergies?: string[];
  diseases?: string[];
  doctorNotes?: string;
  isEmergencyAccessible?: boolean;
  doctorId?: {
    _id?: string;
    fullName?: string;
    email?: string;
    profile_image?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  medications?: Array<{
    name?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
  }>;
  dietPlan?: {
    morning?: string;
    afternoon?: string;
    evening?: string;
    notes?: string;
  };
  reports?: Array<{
    fileUrl?: string;
    type?: string;
    date?: string;
  }>;
  updatedAt?: string;
};

type UploadedRecord = {
  _id: string;
  title: string;
  description?: string;
  recordType?: string;
  issuedDate?: string;
  issuedByName?: string;
  fileUrl?: string;
  attachments?: Array<{
    name?: string;
    url?: string;
  }>;
  createdAt: string;
  doctorId?: {
    _id?: string;
    fullName?: string;
    profile_image?: string;
  };
  issuedByDoctorId?: {
    _id?: string;
    fullName?: string;
    email?: string;
    profile_image?: string;
  };
};

type Appointment = {
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
};

type EmergencyAccessSummary = {
  qrCodeId?: string;
  emergencyNotes?: string;
  active?: boolean;
};

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : "N.A";

const formatRecordType = (value?: string) => {
  if (!value) return "Other";

  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const DetailTags = ({ items }: { items?: string[] }) => {
  if (!items?.length) return <Text type="secondary">N.A</Text>;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Tag key={item}>{item}</Tag>
      ))}
    </div>
  );
};

const AccessibleProfile = () => {
  const { userId } = useParams();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    user: ProfileUser;
    healthRecord: HealthRecord | null;
    medicalRecord: ClinicalMedicalRecord | null;
    emergencyAccess: EmergencyAccessSummary | null;
    records: UploadedRecord[];
    appointments: Appointment[];
  } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || !userId) return;

      try {
        setLoading(true);
        const res = await fetch(`${_env.SERVER_URL}/user/profiles/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await res.json();

        if (!res.ok) throw new Error(result.message || "Failed to load profile");

        setData(result);
      } catch (err) {
        notification.error({
          message: err instanceof Error ? err.message : "Failed to load profile",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, userId]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return <Empty description="Profile not found" />;
  }

  const { user, healthRecord, medicalRecord, emergencyAccess, records, appointments } = data;

  return (
    <div className="p-6 space-y-6">
      <Card style={{ borderRadius: 8 }}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Avatar src={getUserImage(user.profile_image)} size={88}>
            {user.fullName?.[0]}
          </Avatar>

          <div className="flex-1">
            <Title level={3} style={{ marginBottom: 4 }}>{user.fullName}</Title>
            <div className="flex flex-wrap gap-2 items-center">
              <Tag color={user.role === "admin" ? "red" : user.role === "doctor" ? "blue" : "green"}>
                {user.role.toUpperCase()}
              </Tag>
              {user.patientId && <Tag>{user.patientId}</Tag>}
              {medicalRecord?.bloodGroup && <Tag color="volcano">Blood: {medicalRecord.bloodGroup}</Tag>}
              {medicalRecord?.isEmergencyAccessible !== undefined && (
                <Tag color={medicalRecord.isEmergencyAccessible ? "green" : "default"}>
                  Emergency QR {medicalRecord.isEmergencyAccessible ? "Enabled" : "Disabled"}
                </Tag>
              )}
            </div>
            <Text type="secondary">{user.email}</Text>
          </div>
        </div>

        <Descriptions className="mt-6" bordered size="small" column={1}>
          <Descriptions.Item label="Gender">{user.gender || "N.A"}</Descriptions.Item>
          <Descriptions.Item label="Age">{user.age || "N.A"}</Descriptions.Item>
          <Descriptions.Item label="Date of Birth">{formatDate(user.dateOfBirth)}</Descriptions.Item>
          <Descriptions.Item label="Phone">{user.phone || "N.A"}</Descriptions.Item>
          <Descriptions.Item label="Address">
            {[user.address?.city, user.address?.state, user.address?.country].filter(Boolean).join(", ") || "N.A"}
          </Descriptions.Item>
                  <Descriptions.Item label="Primary Doctor">
            <div className="flex items-center gap-3">
              {medicalRecord?.doctorId?.fullName ? (
                <>
                  <Avatar src={getUserImage(medicalRecord.doctorId.profile_image)} size={36}>
                    {medicalRecord.doctorId.fullName?.[0]}
                  </Avatar>
                  <span>{medicalRecord.doctorId.fullName}</span>
                </>
              ) : (
                "N.A"
              )}
            </div>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {user.role === "patient" && (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Card>
                <Statistic title="BMI" value={healthRecord?.bmi ?? "N.A"} prefix={<HeartPulse size={16} />} />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Statistic title="Weight" value={healthRecord?.weight ?? "N.A"} suffix={healthRecord?.weight ? "kg" : ""} />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Statistic title="Height" value={healthRecord?.height ?? "N.A"} suffix={healthRecord?.height ? "cm" : ""} />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Statistic
                  title="Blood Pressure"
                  value={
                    healthRecord?.bloodPressure
                      ? `${healthRecord.bloodPressure.systolic}/${healthRecord.bloodPressure.diastolic}`
                      : "N.A"
                  }
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Clinical Details" extra={<ShieldPlus size={16} />}>
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="Allergies">
                    <DetailTags items={medicalRecord?.allergies} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Diseases">
                    <DetailTags items={medicalRecord?.diseases} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Emergency Contact">
                    {medicalRecord?.emergencyContact?.name ? (
                      <div className="space-y-1">
                        <div>{medicalRecord.emergencyContact.name}</div>
                        <div className="text-sm text-gray-500">
                          {medicalRecord.emergencyContact.relation || "Relation N.A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {medicalRecord.emergencyContact.phone || "Phone N.A"}
                        </div>
                      </div>
                    ) : (
                      "N.A"
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Doctor Notes">
                    <Paragraph style={{ marginBottom: 0 }}>
                      {medicalRecord?.doctorNotes || "N.A"}
                    </Paragraph>
                  </Descriptions.Item>
                  <Descriptions.Item label="Emergency Notes">
                    <Paragraph style={{ marginBottom: 0 }}>
                      {emergencyAccess?.emergencyNotes || "N.A"}
                    </Paragraph>
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Updated">
                    {formatDate(medicalRecord?.updatedAt)}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Diet Plan" extra={<Phone size={16} />}>
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="Morning">{medicalRecord?.dietPlan?.morning || "N.A"}</Descriptions.Item>
                  <Descriptions.Item label="Afternoon">{medicalRecord?.dietPlan?.afternoon || "N.A"}</Descriptions.Item>
                  <Descriptions.Item label="Evening">{medicalRecord?.dietPlan?.evening || "N.A"}</Descriptions.Item>
                  <Descriptions.Item label="Notes">{medicalRecord?.dietPlan?.notes || "N.A"}</Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>

          <Card title="Medications" extra={<Pill size={16} />}>
            {!medicalRecord?.medications?.length ? (
              <Empty description="No medications added" />
            ) : (
              <div className="space-y-3">
                {medicalRecord.medications.map((item, index) => (
                  <Card key={`${item.name || "med"}-${index}`} size="small">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <Text strong>{item.name || "N.A"}</Text>
                      </div>
                      <div>{item.dosage || "N.A"}</div>
                      <div>{item.frequency || "N.A"}</div>
                      <div>{item.duration || "N.A"}</div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          <Card title="Clinical Reports" extra={<FileText size={16} />}>
            {!medicalRecord?.reports?.length ? (
              <Empty description="No clinical reports found" />
            ) : (
              <div className="space-y-3">
                {medicalRecord.reports.map((report, index) => (
                  <Card key={`${report.fileUrl || "report"}-${index}`} size="small">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <Text strong>{report.type || "Medical Report"}</Text>
                        <div className="text-sm text-gray-500">{formatDate(report.date)}</div>
                      </div>
                      {report.fileUrl ? (
                        <a href={report.fileUrl} target="_blank" rel="noreferrer">
                          Open File
                        </a>
                      ) : (
                        <Text type="secondary">No file attached</Text>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          <Card title="Uploaded Medical Records" extra={<UserRound size={16} />}>
            {records.length === 0 ? (
              <Empty description="No uploaded records yet" />
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <Card key={record._id} size="small">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <UserRound size={16} />
                          <Text strong>{record.title}</Text>
                          <Tag color="blue">{formatRecordType(record.recordType)}</Tag>
                        </div>
                        <Paragraph type="secondary" style={{ marginBottom: 8, marginTop: 8 }}>
                          {record.description || "No description"}
                        </Paragraph>
                        <div className="space-y-1">
                          <Text type="secondary" className="block">
                            Issued by: {record.issuedByDoctorId?.fullName || record.issuedByName || record.doctorId?.fullName || "Patient / External Source"}
                          </Text>
                          <Text type="secondary" className="block">
                            Issued date: {formatDate(record.issuedDate)}
                          </Text>
                          <Text type="secondary" className="block">
                            Added on: {formatDate(record.createdAt)}
                          </Text>
                        </div>
                      </div>

                      <div className="text-left md:text-right">
                        <div className="flex items-center gap-2 text-sm text-gray-500 md:justify-end">
                          <Paperclip size={14} />
                          {record.attachments?.length || (record.fileUrl ? 1 : 0)} attachment(s)
                        </div>
                      </div>
                    </div>

                    {!!(record.attachments?.length || record.fileUrl) && (
                      <div className="mt-4 flex flex-wrap gap-3">
                        {(record.attachments?.length
                          ? record.attachments
                          : record.fileUrl
                            ? [{ name: "Attachment", url: record.fileUrl }]
                            : []
                        ).map((attachment, index) => (
                          attachment.url ? (
                            <a key={`${attachment.url}-${index}`} href={attachment.url} target="_blank" rel="noreferrer">
                              {attachment.name || `Attachment ${index + 1}`}
                            </a>
                          ) : null
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </Card>

          <Card title="Appointments History" extra={<CalendarDays size={16} />}>
            {appointments.length === 0 ? (
              <Empty description="No appointments found" />
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <Card key={appointment._id} size="small">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start gap-3">
                        <Avatar src={getUserImage(appointment.doctorId?.profile_image)} size={44}>
                          {appointment.doctorId?.fullName?.[0]}
                        </Avatar>
                        <div>
                          <Text strong>{appointment.doctorId?.fullName || "Doctor N.A"}</Text>
                          <div className="text-sm text-gray-500">{appointment.doctorId?.email || ""}</div>
                          <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                            {appointment.reason}
                          </Paragraph>
                        </div>
                      </div>

                      <div className="text-left md:text-right">
                        <Tag color={
                          appointment.status === "completed"
                            ? "green"
                            : appointment.status === "confirmed"
                              ? "blue"
                              : appointment.status === "cancelled"
                                ? "red"
                                : "gold"
                        }>
                          {appointment.status.toUpperCase()}
                        </Tag>
                        <div className="text-sm text-gray-500 mt-2">
                          {formatDate(appointment.date)} {appointment.time ? `at ${appointment.time}` : ""}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default AccessibleProfile;
