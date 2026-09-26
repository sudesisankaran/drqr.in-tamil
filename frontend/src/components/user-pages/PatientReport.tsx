import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Row,
  Col,
  Typography,
  Modal,
  Input,
  Space,
  Tag,
  Select,
  notification,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Calendar, FileText, Paperclip, User } from "lucide-react";
import _env from "../../utils/_env";
import { useAuth } from "../../providers/AuthContext";

const { Title, Text, Paragraph } = Typography;

const recordTypeOptions = [
  { label: "Lab Report", value: "lab-report" },
  { label: "Prescription", value: "prescription" },
  { label: "Scan", value: "scan" },
  { label: "Discharge Summary", value: "discharge-summary" },
  { label: "Vaccination", value: "vaccination" },
  { label: "Referral", value: "referral" },
  { label: "Certificate", value: "certificate" },
  { label: "Invoice", value: "invoice" },
  { label: "Other", value: "other" },
] as const;

type Person = {
  _id: string;
  fullName: string;
  patientId?: string;
};

type Attachment = {
  name: string;
  url: string;
};

interface MedicalRecord {
  _id: string;
  patientId: Person;
  doctorId?: Person;
  issuedByDoctorId?: Person;
  title: string;
  description: string;
  recordType: string;
  issuedDate?: string;
  issuedByName?: string;
  fileUrl?: string;
  attachments?: Attachment[];
  createdAt: string;
}

const emptyForm = {
  patientId: "",
  title: "",
  description: "",
  recordType: "lab-report",
  issuedDate: "",
  issuedByName: "",
  attachmentUrls: "",
};

const formatType = (value?: string) =>
  recordTypeOptions.find((option) => option.value === value)?.label || "Other";

const PatientReport = () => {
  const { token, user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Person[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [form, setForm] = useState(emptyForm);

  const fetchRecords = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${_env.SERVER_URL}/records`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load records");

      setRecords(data);
    } catch (err) {
      notification.error({
        message: err instanceof Error ? err.message : "Failed to load records",
      });
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [token]);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!token || user?.role === "patient") return;

      const res = await fetch(`${_env.SERVER_URL}/user/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setPatients(data);
    };

    fetchPatients();
  }, [token, user?.role]);

  const resetModal = () => {
    setForm(emptyForm);
    setSelectedFiles([]);
    setIsModalOpen(false);
  };

  const handleAdd = async () => {
    const requiresPatient = user?.role !== "patient";

    if (!token || !form.title.trim() || (requiresPatient && !form.patientId)) {
      return notification.error({ message: "Patient and title are required" });
    }

    try {
      setSaving(true);

      const payload = new FormData();
      payload.append("title", form.title.trim());
      payload.append("description", form.description.trim());
      payload.append("recordType", form.recordType);

      if (form.issuedDate) {
        payload.append("issuedDate", form.issuedDate);
      }

      if (user?.role !== "doctor" && form.issuedByName.trim()) {
        payload.append("issuedByName", form.issuedByName.trim());
      }

      if (form.attachmentUrls.trim()) {
        payload.append(
          "attachmentUrls",
          JSON.stringify(
            form.attachmentUrls
              .split(/\r?\n/)
              .map((item) => item.trim())
              .filter(Boolean),
          ),
        );
      }

      if (requiresPatient) {
        payload.append("patientId", form.patientId);
      }

      selectedFiles.forEach((file) => {
        payload.append("attachments", file);
      });

      const res = await fetch(`${_env.SERVER_URL}/records`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to save record");

      notification.success({ message: "Record saved" });
      resetModal();
      fetchRecords();
    } catch (err) {
      notification.error({
        message: err instanceof Error ? err.message : "Failed to save record",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 24, minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {user?.role === "patient" ? "My Medical Records" : "Patient Records"}
          </Title>
          <Text type="secondary">
            Organize records by type, issue date, issuer, and multiple attachments.
          </Text>
        </div>

        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsModalOpen(true)}>
          {user?.role === "patient" ? "Upload Record" : "Add Record"}
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {records.map((record) => (
          <Col xs={24} sm={12} md={8} key={record._id}>
            <Card hoverable style={{ borderRadius: 8 }} bodyStyle={{ padding: 16 }}>
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
                  <Space>
                    <FileText size={18} />
                    <div>
                      <Text strong>{record.title}</Text>
                      <div>
                        <Tag color="blue">{formatType(record.recordType)}</Tag>
                      </div>
                    </div>
                  </Space>
                  <Tag color="purple">{new Date(record.createdAt).toLocaleDateString()}</Tag>
                </div>

                <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                  {record.description || "No description"}
                </Paragraph>

                <div className="flex flex-col gap-2">
                  <Space size={4}>
                    <User size={14} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {record.issuedByDoctorId?.fullName || record.issuedByName || (user?.role === "patient"
                        ? record.doctorId?.fullName || "Uploaded by patient"
                        : record.patientId?.fullName || "N.A")}
                    </Text>
                  </Space>

                  <Space size={4}>
                    <Calendar size={14} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Issued: {record.issuedDate ? new Date(record.issuedDate).toLocaleDateString() : "N.A"}
                    </Text>
                  </Space>

                  <Space size={4}>
                    <Paperclip size={14} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Attachments: {record.attachments?.length || (record.fileUrl ? 1 : 0)}
                    </Text>
                  </Space>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(record.attachments?.length
                    ? record.attachments
                    : record.fileUrl
                      ? [{ name: "Attachment", url: record.fileUrl }]
                      : []
                  ).map((attachment, index) => (
                    <a key={`${attachment.url}-${index}`} href={attachment.url} target="_blank" rel="noreferrer">
                      {attachment.name || `File ${index + 1}`}
                    </a>
                  ))}
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={user?.role === "patient" ? "Upload Medical Record" : "Add New Record"}
        open={isModalOpen}
        onCancel={resetModal}
        onOk={handleAdd}
        okText="Save"
        confirmLoading={saving}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {user?.role !== "patient" && (
            <Select
              placeholder="Select patient"
              value={form.patientId || undefined}
              onChange={(patientId) => setForm({ ...form, patientId })}
              options={patients.map((patient) => ({
                label: `${patient.fullName} (${patient.patientId || "N.A"})`,
                value: patient._id,
              }))}
            />
          )}

          <Input
            placeholder="Record title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <Select
            value={form.recordType}
            onChange={(recordType) => setForm({ ...form, recordType })}
            options={recordTypeOptions.map((option) => ({ label: option.label, value: option.value }))}
          />

          <Input
            type="date"
            value={form.issuedDate}
            onChange={(e) => setForm({ ...form, issuedDate: e.target.value })}
          />

          {user?.role !== "doctor" && (
            <Input
              placeholder="Issued by doctor or hospital"
              value={form.issuedByName}
              onChange={(e) => setForm({ ...form, issuedByName: e.target.value })}
            />
          )}

          <input
            type="file"
            multiple
            onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
            className="border border-gray-300 rounded-md px-3 py-2"
          />

          {!!selectedFiles.length && (
            <Text type="secondary">
              Selected files: {selectedFiles.map((file) => file.name).join(", ")}
            </Text>
          )}

          <Input.TextArea
            placeholder="Attachment URLs, one per line"
            rows={3}
            value={form.attachmentUrls}
            onChange={(e) => setForm({ ...form, attachmentUrls: e.target.value })}
          />

          <Input.TextArea
            placeholder="Description"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Space>
      </Modal>
    </div>
  );
};

export default PatientReport;
