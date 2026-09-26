import { useEffect, useRef, useState } from "react";
import { Badge, Button, Drawer, List, Typography, notification } from "antd";
import { Bell } from "lucide-react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import _env from "../../utils/_env";
import { useAuth } from "../../providers/AuthContext";

const { Text } = Typography;

type AppNotification = {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export const NotificationPanel: React.FC = () => {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const notifiedSocketErrorRef = useRef(false);
  const socketRef = useRef<Socket | null>(null);

  const fetchNotifications = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${_env.SERVER_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load notifications");
      }

      setNotifications(data);
    } catch (err) {
      notification.error({
        message: err instanceof Error ? err.message : "Failed to load notifications",
      });
    }
  };

  useEffect(() => {
    void fetchNotifications();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const socketServerUrl = _env.SERVER_URL.replace(/\/api\/?$/, "");
    const socket = io(socketServerUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;
    notifiedSocketErrorRef.current = false;

    const handleNewNotification = (incoming: AppNotification) => {
      setNotifications((prev) => {
        const filtered = prev.filter((item) => item._id !== incoming._id);
        return [incoming, ...filtered];
      });
    };

    const handleNotificationRead = ({ id }: { id: string }) => {
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isRead: true } : item)),
      );
    };

    const handleAllNotificationsRead = () => {
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    };

    const handleSocketError = () => {
      if (notifiedSocketErrorRef.current) return;

      notifiedSocketErrorRef.current = true;
      notification.error({ message: "Real-time notifications connection failed" });
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("notification:read", handleNotificationRead);
    socket.on("notification:read-all", handleAllNotificationsRead);
    socket.on("connect_error", handleSocketError);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("notification:read", handleNotificationRead);
      socket.off("notification:read-all", handleAllNotificationsRead);
      socket.off("connect_error", handleSocketError);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const markAsRead = async (id: string) => {
    if (!token) return;

    try {
      const res = await fetch(`${_env.SERVER_URL}/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update notification");
      }

      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isRead: true } : item)),
      );
    } catch (err) {
      notification.error({
        message: err instanceof Error ? err.message : "Failed to update notification",
      });
    }
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const markAllAsRead = async () => {
    if (!token || !unreadCount) return;

    try {
      setBulkUpdating(true);
      const res = await fetch(`${_env.SERVER_URL}/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update notifications");
      }

      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      notification.success({
        message: data.message || "All notifications marked as read",
      });
    } catch (err) {
      notification.error({
        message: err instanceof Error ? err.message : "Failed to update notifications",
      });
    } finally {
      setBulkUpdating(false);
    }
  };

  return (
    <>
      <Badge count={unreadCount} size="small">
        <Bell size={22} style={{ cursor: "pointer" }} onClick={() => setOpen(true)} />
      </Badge>

      <Drawer
        title={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={380}
        extra={(
          <Button
            type="link"
            disabled={!unreadCount}
            loading={bulkUpdating}
            onClick={() => void markAllAsRead()}
          >
            Mark all read
          </Button>
        )}
      >
        <List
          itemLayout="vertical"
          dataSource={notifications}
          locale={{ emptyText: "No notifications" }}
          renderItem={(item) => (
            <List.Item
              key={item._id}
              onClick={() => void markAsRead(item._id)}
              style={{
                cursor: "pointer",
                borderRadius: 12,
                marginBottom: 12,
                padding: 14,
                background: item.isRead ? "#ffffff" : "#eff6ff",
                border: item.isRead ? "1px solid #f0f0f0" : "1px solid #bfdbfe",
              }}
            >
              <List.Item.Meta
                title={<Text strong={!item.isRead}>{item.title}</Text>}
                description={item.message}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </List.Item>
          )}
        />
      </Drawer>
    </>
  );
};
