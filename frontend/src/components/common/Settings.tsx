import { Card, Switch, Input, Button, notification, Popconfirm } from "antd";
import { useState } from "react";
import { useAuth } from "../../providers/AuthContext";
import _env from "../../utils/_env";

const Settings = () => {
  const { user, logout, token } = useAuth();

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    password: "",
    newPassword: "",
    notifications: user?.notifications,
  });


  const handlePasswordChange = async () => {
    if (!form.password || !form.newPassword) {
      return notification.error({
        message: "All fields are required",
      });
    }

    if (form.newPassword.length < 6) {
      return notification.error({
        message: "Password must be at least 6 characters",
      });
    }

    try {
      const res = await fetch(`${_env.SERVER_URL}/settings/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: form.password,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      notification.success({ message: data.message });

      // 🔥 Clear fields
      setForm({ ...form, password: "", newPassword: "" });

    } catch (err: any) {
      notification.error({ message: err.message });
    }
  };

  const handleToggle = async (val: boolean) => {
    try {
      const res = await fetch(`${_env.SERVER_URL}/settings/notifications`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notifications: val }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      notification.success({
        message: "Notification settings updated",
      });

    } catch (err: any) {
      notification.error({ message: err.message });
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${_env.SERVER_URL}/settings/delete-account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      notification.success({
        message: "Account deleted",
      });

      logout();

    } catch (err: any) {
      notification.error({ message: err.message });
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <Card title="Change Password">
        <div className="space-y-3">
          <Input.Password
            placeholder="Current Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <Input.Password
            placeholder="New Password"
            value={form.newPassword}
            onChange={(e) =>
              setForm({ ...form, newPassword: e.target.value })
            }
          />

          <Button onClick={handlePasswordChange}>
            Update Password
          </Button>
        </div>
      </Card>

      <Card title="Notifications">
        <div className="flex justify-between items-center">
          <span>Email Notifications</span>
          <Switch
            checked={form.notifications}
            onChange={(val) => {
              setForm({ ...form, notifications: val });
              handleToggle(val);
            }}
          />
        </div>
      </Card>

      <Card title="Account">
        <div className="flex gap-3">
          <Button danger onClick={logout}>
            Logout
          </Button>

          <Popconfirm
            title="Delete Account?"
            description="This action cannot be undone!"
            onConfirm={handleDelete}
            okText="Yes, Delete"
            cancelText="Cancel"
          >
            <Button danger type="primary">
              Delete Account
            </Button>
          </Popconfirm>
        </div>
      </Card>

    </div>
  );
};

export default Settings;