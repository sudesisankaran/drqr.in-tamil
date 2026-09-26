import {
  Button,
  Form,
  Input,
  Modal,
  QRCode,
  Select,
  Space,
  Typography,
  notification,
} from "antd";
import { Camera, Copy, ExternalLink, MapPin, Plus, Share2, User } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../providers/AuthContext";
import _env from "../../utils/_env";
import { getUserImage } from "../../hooks/image";

const { Text } = Typography;

const toDateInputValue = (value?: Date | string) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().split("T")[0];
};

const formatDateLabel = (value?: Date | string) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ProfileDetail = ({
  label,
  value,
  tone = "gray",
}: {
  label: string;
  value?: string | number;
  tone?: "blue" | "green" | "gray" | "amber" | "indigo";
}) => {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-800 border-blue-100",
    green: "bg-green-50 text-green-800 border-green-100",
    gray: "bg-gray-50 text-gray-800 border-gray-100",
    amber: "bg-amber-50 text-amber-800 border-amber-100",
    indigo: "bg-indigo-50 text-indigo-800 border-indigo-100",
  };

  return (
    <div className={`min-w-[8.5rem] rounded-xl border px-3 py-2 text-left ${toneClasses[tone]}`}>
      <div className="text-[11px] font-semibold uppercase tracking-normal opacity-70">{label}</div>
      <div className="mt-0.5 break-words text-sm font-semibold capitalize">
        {value || <span className="normal-case text-gray-400">Not added</span>}
      </div>
    </div>
  );
};

function ProfileCard() {
  const { user, updateUserData, token } = useAuth();
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [openEditProfileModal, setOpenProfileModal] = useState(false);
  const [savingProfileImage, setSavingProfileImage] = useState(false);
  const [partEdit, setPartEdit] = useState<{
    open: boolean;
    type: null | "gender" | "age" | "address";
  }>({
    open: false,
    type: null,
  });
  const [qrData, setQrData] = useState<{ qrCodeId: string; emergencyNotes?: string } | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    gender: user?.gender || "",
    age: String(user?.age ?? ""),
    phone: user?.phone || "",
    dateOfBirth: toDateInputValue(user?.dateOfBirth),
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    country: user?.address?.country || "",
  });

  useEffect(() => {
    setForm({
      fullName: user?.fullName || "",
      gender: user?.gender || "",
      age: String(user?.age ?? ""),
      phone: user?.phone || "",
      dateOfBirth: toDateInputValue(user?.dateOfBirth),
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      country: user?.address?.country || "",
    });
  }, [user]);

  const emergencyUrl = useMemo(() => {
    if (!qrData?.qrCodeId || typeof window === "undefined") return "";
    return `${window.location.origin}/emergency/${qrData.qrCodeId}`;
  }, [qrData?.qrCodeId]);

  const fetchEmergencyQr = async () => {
    if (!token || user?.role !== "patient") return;

    try {
      setQrLoading(true);
      const res = await fetch(`${_env.SERVER_URL}/emergency/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (res.ok) {
        setQrData(data);
      }
    } catch {
      // keep silent when QR is not created yet
    } finally {
      setQrLoading(false);
    }
  };

  useEffect(() => {
    void fetchEmergencyQr();
  }, [token, user?.role]);

  const generateEmergencyQr = async () => {
    try {
      setQrLoading(true);
      const res = await fetch(`${_env.SERVER_URL}/emergency/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emergencyNotes: qrData?.emergencyNotes || "",
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to generate QR code");

      setQrData(data);
      notification.success({
        message: "Emergency QR ready",
        description: "Your shareable emergency access link is now active.",
      });
    } catch (error: any) {
      notification.error({
        message: "Error",
        description: error.message,
      });
    } finally {
      setQrLoading(false);
    }
  };

  const copyEmergencyLink = async () => {
    if (!emergencyUrl) return;

    try {
      await navigator.clipboard.writeText(emergencyUrl);
      notification.success({ message: "Emergency link copied" });
    } catch {
      notification.error({ message: "Unable to copy link" });
    }
  };

  const shareEmergencyLink = async () => {
    if (!emergencyUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${user?.fullName || "Patient"} emergency QR`,
          text: "Open this emergency patient profile.",
          url: emergencyUrl,
        });
        return;
      }

      await copyEmergencyLink();
    } catch {
      notification.error({ message: "Unable to share emergency link" });
    }
  };

  const handleFullSave = async () => {
    try {
      const res = await fetch(`${_env.SERVER_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: form.fullName,
          gender: form.gender,
          age: form.age ? Number(form.age) : undefined,
          phone: form.phone.trim() || undefined,
          dateOfBirth: form.dateOfBirth || undefined,
          address: {
            city: form.city.trim() || undefined,
            state: form.state.trim() || undefined,
            country: form.country.trim() || undefined,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      updateUserData(data.user);

      notification.success({
        message: "Success",
        description: data.message,
      });

      setOpenProfileModal(false);
    } catch (error: any) {
      notification.error({
        message: "Error",
        description: error.message,
      });
    }
  };

  const handlePartialSave = async () => {
    try {
      const payload: Record<string, unknown> = {};

      if (partEdit.type === "gender") payload.gender = form.gender;
      if (partEdit.type === "age") payload.age = form.age ? Number(form.age) : undefined;
      if (partEdit.type === "address") {
        payload.address = {
          city: form.city.trim() || undefined,
          state: form.state.trim() || undefined,
          country: form.country.trim() || undefined,
        };
      }

      const res = await fetch(`${_env.SERVER_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      updateUserData(data.user);

      notification.success({
        message: "Updated",
        description: "Profile updated successfully",
      });

      setPartEdit({ open: false, type: null });
    } catch (error: any) {
      notification.error({
        message: "Error",
        description: error.message,
      });
    }
  };

  const openImagePicker = () => {
    imageInputRef.current?.click();
  };

  const handleImageSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !token) return;

    if (!file.type.startsWith("image/")) {
      notification.error({ message: "Please select an image file" });
      return;
    }

    try {
      setSavingProfileImage(true);
      const payload = new FormData();
      payload.append("profileImage", file);

      const res = await fetch(`${_env.SERVER_URL}/user/profile-image`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to update profile image");

      updateUserData(data.user);
      notification.success({
        message: "Profile image updated",
      });
    } catch (error: any) {
      notification.error({
        message: "Error",
        description: error.message || "Failed to update profile image",
      });
    } finally {
      setSavingProfileImage(false);
    }
  };

  const locationLabel = [user?.address?.city, user?.address?.state, user?.address?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void handleImageSelected(event)}
      />

      <div className="bg-white rounded-3xl shadow-lg p-6 flex flex-col md:flex-row gap-6 items-center border border-gray-100">
        <div className="relative">
          <img
            src={getUserImage(user?.profile_image)}
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl ring-1 ring-gray-200"
            alt={user?.fullName || "Profile"}
          />

          <button
            type="button"
            onClick={openImagePicker}
            disabled={savingProfileImage}
            className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-blue-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg disabled:opacity-60"
          >
            <Camera size={14} />
            {savingProfileImage ? "Uploading..." : "Change Photo"}
          </button>

          <span className="absolute bottom-3 right-3 bg-green-500 w-4 h-4 rounded-full border-2 border-white" />
        </div>

        <div className="flex-1 w-full text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-900">
            {user?.fullName}
          </h2>

          <p className="text-sm text-gray-500 mt-1">DRQR User Profile</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-4">
            <ProfileDetail label="Account Role" value={user?.role} tone="blue" />
            <ProfileDetail label="Full Name" value={user?.fullName} tone="gray" />
            <ProfileDetail label="Email Address" value={user?.email} tone="gray" />
            <ProfileDetail label="Gender" value={user?.gender} tone="indigo" />
            <ProfileDetail label="Age" value={user?.age ? `${user.age} years` : ""} tone="green" />
            <ProfileDetail label="Phone Number" value={user?.phone} tone="amber" />
            <ProfileDetail label="Date of Birth" value={formatDateLabel(user?.dateOfBirth)} tone="gray" />
            <ProfileDetail label="Address" value={locationLabel} tone="gray" />
            {user?.patientId && (
              <ProfileDetail label="Patient ID" value={user.patientId} tone="blue" />
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
            {!user?.gender && (
              <Button
                size="small"
                icon={<Plus size={12} />}
                onClick={() => setPartEdit({ open: true, type: "gender" })}
              >
                Gender
              </Button>
            )}

            {!user?.age && (
              <Button
                size="small"
                icon={<Plus size={12} />}
                onClick={() => setPartEdit({ open: true, type: "age" })}
              >
                Age
              </Button>
            )}

            {!locationLabel && (
              <Button
                size="small"
                icon={<Plus size={12} />}
                onClick={() => setPartEdit({ open: true, type: "address" })}
              >
                Address
              </Button>
            )}
          </div>
        </div>

        <div className="w-full md:w-auto">
          <Button
            type="primary"
            size="large"
            className="w-full md:w-auto rounded-xl"
            onClick={() => setOpenProfileModal(true)}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {user?.role === "patient" && (
        <div className="bg-white rounded-3xl shadow-lg p-6 mt-6 border border-gray-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Emergency QR Access</h3>
              <p className="text-sm text-gray-500 mt-1">
                Generate your QR once, then share the link or let staff scan it in emergencies.
              </p>
            </div>

            <Space wrap>
              <Button type="primary" loading={qrLoading} onClick={generateEmergencyQr}>
                {qrData ? "Refresh QR" : "Generate QR"}
              </Button>
              <Button icon={<Copy size={16} />} disabled={!emergencyUrl} onClick={copyEmergencyLink}>
                Copy Link
              </Button>
              <Button icon={<Share2 size={16} />} disabled={!emergencyUrl} onClick={shareEmergencyLink}>
                Share
              </Button>
              <Button
                icon={<ExternalLink size={16} />}
                disabled={!emergencyUrl}
                onClick={() => window.open(emergencyUrl, "_blank", "noopener,noreferrer")}
              >
                Open
              </Button>
            </Space>
          </div>

          {qrData && emergencyUrl && (
            <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="border border-gray-200 rounded-2xl p-4 w-fit bg-white">
                <QRCode value={emergencyUrl} size={180} />
              </div>

              <div className="min-w-0">
                <Text strong className="block text-gray-900">Emergency Link</Text>
                <Text copyable={{ text: emergencyUrl }} className="block break-all text-gray-600">
                  {emergencyUrl}
                </Text>
                <p className="text-sm text-gray-500 mt-3">
                  Doctors and admins get the full emergency profile after login. Public scan view stays limited.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal
        centered
        open={openEditProfileModal}
        onCancel={() => setOpenProfileModal(false)}
        footer={null}
        title={(
          <div className="flex items-center gap-2">
            <User size={18} />
            <span className="font-semibold">Edit Profile</span>
          </div>
        )}
      >
        <Form layout="vertical" onFinish={handleFullSave} className="mt-4">
          <Form.Item label="Full Name">
            <Input
              value={form.fullName}
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
              placeholder="Enter full name"
            />
          </Form.Item>

          <Form.Item label="Gender">
            <Select
              value={form.gender || undefined}
              onChange={(val) => setForm({ ...form, gender: val })}
              placeholder="Select gender"
            >
              <Select.Option value="male">Male</Select.Option>
              <Select.Option value="female">Female</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Age">
            <Input
              type="number"
              value={form.age}
              onChange={(e) =>
                setForm({ ...form, age: e.target.value })
              }
              placeholder="Enter age"
            />
          </Form.Item>

          <Form.Item label="Phone">
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Enter phone number"
            />
          </Form.Item>

          <Form.Item label="Date of Birth">
            <Input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            />
          </Form.Item>

          <div className="bg-gray-50 p-3 rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-gray-700 font-medium">
              <MapPin size={16} />
              Address
            </div>

            <Form.Item label="City">
              <Input
                value={form.city}
                onChange={(e) =>
                  setForm({ ...form, city: e.target.value })
                }
                placeholder="Enter city"
              />
            </Form.Item>

            <Form.Item label="State">
              <Input
                value={form.state}
                onChange={(e) =>
                  setForm({ ...form, state: e.target.value })
                }
                placeholder="Enter state"
              />
            </Form.Item>

            <Form.Item label="Country">
              <Input
                value={form.country}
                onChange={(e) =>
                  setForm({ ...form, country: e.target.value })
                }
                placeholder="Enter country"
              />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setOpenProfileModal(false)}
              className="px-4 py-2 rounded-lg border"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-900 text-white"
            >
              Save Changes
            </button>
          </div>
        </Form>
      </Modal>

      <Modal
        centered
        open={partEdit.open}
        onCancel={() => setPartEdit({ open: false, type: null })}
        footer={null}
        title={(
          <span className="font-semibold capitalize">
            Edit {partEdit.type}
          </span>
        )}
      >
        <div className="mt-4 space-y-3">
          {partEdit.type === "gender" && (
            <Select
              className="w-full"
              value={form.gender || undefined}
              onChange={(val) => setForm({ ...form, gender: val })}
              placeholder="Select your gender"
            >
              <Select.Option value="male">Male</Select.Option>
              <Select.Option value="female">Female</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          )}

          {partEdit.type === "age" && (
            <Input
              type="number"
              placeholder="Enter age"
              value={form.age}
              onChange={(e) =>
                setForm({ ...form, age: e.target.value })
              }
            />
          )}

          {partEdit.type === "address" && (
            <>
              <Input
                placeholder="City"
                value={form.city}
                onChange={(e) =>
                  setForm({ ...form, city: e.target.value })
                }
              />
              <Input
                placeholder="State"
                value={form.state}
                onChange={(e) =>
                  setForm({ ...form, state: e.target.value })
                }
              />
              <Input
                placeholder="Country"
                value={form.country}
                onChange={(e) =>
                  setForm({ ...form, country: e.target.value })
                }
              />
            </>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() =>
                setPartEdit({ open: false, type: null })
              }
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              onClick={handlePartialSave}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ProfileCard;
