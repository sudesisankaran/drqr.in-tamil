import { useEffect, useState } from "react";
import { Button, Input, Modal, Select, Switch, notification } from "antd";
import { Apple, ClipboardList, Phone, Pill, ShieldPlus } from "lucide-react";
import { Card, ListItem } from "../Dashboard/Layout";
import ProfileCard from "../common/ProfileCard";
import { HealthRecord } from "../common";
import _env from "../../utils/_env";
import { useAuth } from "../../providers/AuthContext";

const { TextArea } = Input;

type ProfileMedicalRecord = {
  doctorNotes?: string;
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
  bloodGroup?: string;
  allergies?: string[];
  diseases?: string[];
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  isEmergencyAccessible?: boolean;
};

type EmergencyAccessSummary = {
  qrCodeId?: string;
  emergencyNotes?: string;
  active?: boolean;
};

type MedicationFormRow = {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
};

type ClinicalFormState = {
  bloodGroup: string;
  allergies: string;
  diseases: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  emergencyNotes: string;
  isEmergencyAccessible: boolean;
};

type EditorSection = "medications" | "diet" | "notes" | "clinical";

const emptyMedication = (): MedicationFormRow => ({
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
});

const emptyClinicalForm = (): ClinicalFormState => ({
  bloodGroup: "",
  allergies: "",
  diseases: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelation: "",
  emergencyNotes: "",
  isEmergencyAccessible: true,
});

const splitList = (value: string) =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const Profile = () => {
  const { token, user } = useAuth();
  const [medicalRecord, setMedicalRecord] = useState<ProfileMedicalRecord | null>(null);
  const [emergencyAccess, setEmergencyAccess] = useState<EmergencyAccessSummary | null>(null);
  const [loadingMedicalRecord, setLoadingMedicalRecord] = useState(false);
  const [savingMedicalRecord, setSavingMedicalRecord] = useState(false);
  const [editor, setEditor] = useState<{ open: boolean; section: EditorSection | null }>({
    open: false,
    section: null,
  });
  const [medicationForm, setMedicationForm] = useState<MedicationFormRow[]>([]);
  const [dietForm, setDietForm] = useState({
    morning: "",
    afternoon: "",
    evening: "",
    notes: "",
  });
  const [notesForm, setNotesForm] = useState("");
  const [clinicalForm, setClinicalForm] = useState<ClinicalFormState>(emptyClinicalForm());

  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (!token || !user?._id || user.role !== "patient") {
        setMedicalRecord(null);
        setEmergencyAccess(null);
        return;
      }

      try {
        setLoadingMedicalRecord(true);
        const res = await fetch(`${_env.SERVER_URL}/user/profiles/${user._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || "Failed to load profile details");
        }

        setMedicalRecord(result.medicalRecord || null);
        setEmergencyAccess(result.emergencyAccess || null);
      } catch (error) {
        notification.error({
          message: error instanceof Error ? error.message : "Failed to load profile details",
        });
      } finally {
        setLoadingMedicalRecord(false);
      }
    };

    void fetchProfileDetails();
  }, [token, user?._id, user?.role]);

  const medications = medicalRecord?.medications || [];
  const dietPlan = medicalRecord?.dietPlan;
  const doctorNotes = medicalRecord?.doctorNotes;
  const allergies = medicalRecord?.allergies || [];
  const diseases = medicalRecord?.diseases || [];
  const emergencyContact = medicalRecord?.emergencyContact;
  const emergencyNotes = emergencyAccess?.emergencyNotes || "";

  const openEditor = (section: EditorSection) => {
    setEditor({ open: true, section });

    if (section === "medications") {
      setMedicationForm(
        medications.length
          ? medications.map((item) => ({
              name: item.name || "",
              dosage: item.dosage || "",
              frequency: item.frequency || "",
              duration: item.duration || "",
            }))
          : [emptyMedication()],
      );
      return;
    }

    if (section === "diet") {
      setDietForm({
        morning: dietPlan?.morning || "",
        afternoon: dietPlan?.afternoon || "",
        evening: dietPlan?.evening || "",
        notes: dietPlan?.notes || "",
      });
      return;
    }

    if (section === "clinical") {
      setClinicalForm({
        bloodGroup: medicalRecord?.bloodGroup || "",
        allergies: allergies.join(", "),
        diseases: diseases.join(", "),
        emergencyContactName: emergencyContact?.name || "",
        emergencyContactPhone: emergencyContact?.phone || "",
        emergencyContactRelation: emergencyContact?.relation || "",
        emergencyNotes,
        isEmergencyAccessible: medicalRecord?.isEmergencyAccessible ?? true,
      });
      return;
    }

    setNotesForm(doctorNotes || "");
  };

  const closeEditor = () => {
    setEditor({ open: false, section: null });
  };

  const updateMedicationRow = (
    index: number,
    field: keyof MedicationFormRow,
    value: string,
  ) => {
    setMedicationForm((prev) =>
      prev.map((item, rowIndex) =>
        rowIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addMedicationRow = () => {
    setMedicationForm((prev) => [...prev, emptyMedication()]);
  };

  const removeMedicationRow = (index: number) => {
    setMedicationForm((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
  };

  const saveSection = async () => {
    if (!token || !editor.section) return;

    try {
      setSavingMedicalRecord(true);

      if (editor.section === "clinical") {
        const medicalRecordRes = await fetch(`${_env.SERVER_URL}/user/medical-record`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bloodGroup: clinicalForm.bloodGroup,
            allergies: splitList(clinicalForm.allergies),
            diseases: splitList(clinicalForm.diseases),
            emergencyContact: {
              name: clinicalForm.emergencyContactName,
              phone: clinicalForm.emergencyContactPhone,
              relation: clinicalForm.emergencyContactRelation,
            },
            isEmergencyAccessible: clinicalForm.isEmergencyAccessible,
          }),
        });
        const medicalRecordResult = await medicalRecordRes.json();

        if (!medicalRecordRes.ok) {
          throw new Error(medicalRecordResult.message || "Failed to save clinical record");
        }

        const emergencyAccessRes = await fetch(`${_env.SERVER_URL}/emergency/me`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            emergencyNotes: clinicalForm.emergencyNotes,
          }),
        });
        const emergencyAccessResult = await emergencyAccessRes.json();

        if (!emergencyAccessRes.ok) {
          throw new Error(emergencyAccessResult.message || "Failed to save emergency notes");
        }

        setMedicalRecord(medicalRecordResult.medicalRecord || null);
        setEmergencyAccess(emergencyAccessResult || null);
        notification.success({
          message: "Clinical record updated successfully",
        });
        closeEditor();
        return;
      }

      let payload: Record<string, unknown>;

      if (editor.section === "medications") {
        payload = {
          medications: medicationForm.filter((item) =>
            [item.name, item.dosage, item.frequency, item.duration].some((value) => value.trim()),
          ),
        };
      } else if (editor.section === "diet") {
        payload = {
          dietPlan: dietForm,
        };
      } else {
        payload = {
          doctorNotes: notesForm,
        };
      }

      const res = await fetch(`${_env.SERVER_URL}/user/medical-record`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to save medical record");
      }

      setMedicalRecord(result.medicalRecord || null);
      notification.success({
        message: result.message || "Medical record updated",
      });
      closeEditor();
    } catch (error) {
      notification.error({
        message: error instanceof Error ? error.message : "Failed to save medical record",
      });
    } finally {
      setSavingMedicalRecord(false);
    }
  };

  const modalTitle =
    editor.section === "medications"
      ? "Edit Medications"
      : editor.section === "diet"
        ? "Edit Diet Plan"
        : editor.section === "clinical"
          ? "Edit Clinical Record"
          : "Edit Doctor Notes";

  const hasClinicalDetails = Boolean(
    medicalRecord?.bloodGroup ||
      allergies.length ||
      diseases.length ||
      emergencyContact?.name ||
      emergencyContact?.phone ||
      emergencyContact?.relation ||
      emergencyNotes,
  );

  return (
    <section className="p-6 space-y-8 max-w-7xl mx-auto">
      <ProfileCard />
      <HealthRecord />

      {user?.role === "patient" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Medications" onEditClick={() => openEditor("medications")}>
              {loadingMedicalRecord ? (
                <div className="text-sm text-gray-500">Loading medications...</div>
              ) : medications.length ? (
                medications.map((item, index) => (
                  <ListItem
                    key={`${item.name || "medication"}-${index}`}
                    icon={<Pill />}
                    text={[
                      item.name || "Unnamed medication",
                      item.dosage,
                      item.frequency,
                      item.duration,
                    ].filter(Boolean).join(" - ")}
                  />
                ))
              ) : (
                <div className="text-sm text-gray-500">No medications added yet. Use edit to add them.</div>
              )}
            </Card>

            <Card title="Diet Plan" onEditClick={() => openEditor("diet")}>
              {loadingMedicalRecord ? (
                <div className="text-sm text-gray-500">Loading diet plan...</div>
              ) : dietPlan ? (
                <>
                  <ListItem icon={<Apple />} text={`Morning: ${dietPlan.morning || "N.A"}`} />
                  <ListItem icon={<Apple />} text={`Afternoon: ${dietPlan.afternoon || "N.A"}`} />
                  <ListItem icon={<Apple />} text={`Evening: ${dietPlan.evening || "N.A"}`} />
                  <ListItem icon={<Apple />} text={`Notes: ${dietPlan.notes || "N.A"}`} />
                </>
              ) : (
                <div className="text-sm text-gray-500">No diet plan added yet. Use edit to add it.</div>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Clinical Record" onEditClick={() => openEditor("clinical")}>
              {loadingMedicalRecord ? (
                <div className="text-sm text-gray-500">Loading clinical record...</div>
              ) : hasClinicalDetails ? (
                <>
                  <ListItem icon={<ShieldPlus />} text={`Blood Group: ${medicalRecord?.bloodGroup || "N.A"}`} />
                  <ListItem
                    icon={<ShieldPlus />}
                    text={`Allergies: ${allergies.length ? allergies.join(", ") : "N.A"}`}
                  />
                  <ListItem
                    icon={<ShieldPlus />}
                    text={`Diseases: ${diseases.length ? diseases.join(", ") : "N.A"}`}
                  />
                  <ListItem
                    icon={<Phone />}
                    text={`Emergency Contact: ${
                      emergencyContact?.name
                        ? `${emergencyContact.name}${emergencyContact.relation ? ` (${emergencyContact.relation})` : ""}${emergencyContact.phone ? ` - ${emergencyContact.phone}` : ""}`
                        : "N.A"
                    }`}
                  />
                  <ListItem
                    icon={<ShieldPlus />}
                    text={`Emergency QR Access: ${medicalRecord?.isEmergencyAccessible === false ? "Disabled" : "Enabled"}`}
                  />
                  <div className="rounded-xl bg-slate-50 p-3 text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Emergency Notes:</span>{" "}
                    {emergencyNotes || "No emergency notes added yet."}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">No clinical record added yet. Use edit to add it.</div>
              )}
            </Card>

            <Card title="Doctor Notes" onEditClick={() => openEditor("notes")}>
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <ClipboardList className="text-blue-900 mt-1" />
                <span className="whitespace-pre-line">
                  {loadingMedicalRecord
                    ? "Loading doctor notes..."
                    : doctorNotes || "No doctor notes added yet. Use edit to add them."}
                </span>
              </div>
            </Card>
          </div>
        </>
      )}

      <Modal
        centered
        destroyOnHidden
        title={modalTitle}
        open={editor.open}
        onCancel={closeEditor}
        onOk={() => void saveSection()}
        confirmLoading={savingMedicalRecord}
        okText="Save"
      >
        {editor.section === "medications" && (
          <div className="space-y-4">
            {medicationForm.map((item, index) => (
              <div
                key={`medication-row-${index}`}
                className="rounded-xl border border-gray-200 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Medication {index + 1}</h4>
                  {medicationForm.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicationRow(index)}
                      className="text-sm text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <Input
                  placeholder="Medicine name"
                  value={item.name}
                  onChange={(e) => updateMedicationRow(index, "name", e.target.value)}
                />
                <Input
                  placeholder="Dosage"
                  value={item.dosage}
                  onChange={(e) => updateMedicationRow(index, "dosage", e.target.value)}
                />
                <Input
                  placeholder="Frequency"
                  value={item.frequency}
                  onChange={(e) => updateMedicationRow(index, "frequency", e.target.value)}
                />
                <Input
                  placeholder="Duration"
                  value={item.duration}
                  onChange={(e) => updateMedicationRow(index, "duration", e.target.value)}
                />
              </div>
            ))}

            <Button type="dashed" block onClick={addMedicationRow}>
              Add Medication
            </Button>
          </div>
        )}

        {editor.section === "diet" && (
          <div className="space-y-3">
            <Input
              placeholder="Morning plan"
              value={dietForm.morning}
              onChange={(e) => setDietForm((prev) => ({ ...prev, morning: e.target.value }))}
            />
            <Input
              placeholder="Afternoon plan"
              value={dietForm.afternoon}
              onChange={(e) => setDietForm((prev) => ({ ...prev, afternoon: e.target.value }))}
            />
            <Input
              placeholder="Evening plan"
              value={dietForm.evening}
              onChange={(e) => setDietForm((prev) => ({ ...prev, evening: e.target.value }))}
            />
            <TextArea
              rows={4}
              placeholder="Additional diet notes"
              value={dietForm.notes}
              onChange={(e) => setDietForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        )}

        {editor.section === "clinical" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Blood Group</label>
              <Select
                allowClear
                value={clinicalForm.bloodGroup || undefined}
                placeholder="Select blood group"
                onChange={(value) =>
                  setClinicalForm((prev) => ({ ...prev, bloodGroup: value || "" }))
                }
                options={[
                  { value: "A+", label: "A+" },
                  { value: "A-", label: "A-" },
                  { value: "B+", label: "B+" },
                  { value: "B-", label: "B-" },
                  { value: "AB+", label: "AB+" },
                  { value: "AB-", label: "AB-" },
                  { value: "O+", label: "O+" },
                  { value: "O-", label: "O-" },
                ]}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Allergies</label>
              <TextArea
                rows={3}
                placeholder="Comma separated allergies"
                value={clinicalForm.allergies}
                onChange={(e) =>
                  setClinicalForm((prev) => ({ ...prev, allergies: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Diseases</label>
              <TextArea
                rows={3}
                placeholder="Comma separated diseases"
                value={clinicalForm.diseases}
                onChange={(e) =>
                  setClinicalForm((prev) => ({ ...prev, diseases: e.target.value }))
                }
              />
            </div>

            <div className="rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="text-sm font-medium text-gray-900">Emergency Contact</div>
              <Input
                placeholder="Contact name"
                value={clinicalForm.emergencyContactName}
                onChange={(e) =>
                  setClinicalForm((prev) => ({
                    ...prev,
                    emergencyContactName: e.target.value,
                  }))
                }
              />
              <Input
                placeholder="Contact phone"
                value={clinicalForm.emergencyContactPhone}
                onChange={(e) =>
                  setClinicalForm((prev) => ({
                    ...prev,
                    emergencyContactPhone: e.target.value,
                  }))
                }
              />
              <Input
                placeholder="Relation"
                value={clinicalForm.emergencyContactRelation}
                onChange={(e) =>
                  setClinicalForm((prev) => ({
                    ...prev,
                    emergencyContactRelation: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Emergency Notes</label>
              <TextArea
                rows={4}
                placeholder="Important notes for emergency access"
                value={clinicalForm.emergencyNotes}
                onChange={(e) =>
                  setClinicalForm((prev) => ({ ...prev, emergencyNotes: e.target.value }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
              <div>
                <div className="text-sm font-medium text-gray-900">Emergency QR Visibility</div>
                <div className="text-xs text-gray-500">
                  Control whether this clinical record appears on the emergency screen.
                </div>
              </div>
              <Switch
                checked={clinicalForm.isEmergencyAccessible}
                onChange={(checked) =>
                  setClinicalForm((prev) => ({ ...prev, isEmergencyAccessible: checked }))
                }
              />
            </div>
          </div>
        )}

        {editor.section === "notes" && (
          <TextArea
            rows={8}
            placeholder="Write doctor notes"
            value={notesForm}
            onChange={(e) => setNotesForm(e.target.value)}
          />
        )}
      </Modal>
    </section>
  );
};

export default Profile;
