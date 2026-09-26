import { Response } from "express";
import supabase from "../config/supabase";
import { emitToUser } from "../socket";

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: string = "system",
) => {
  const { data: notification, error } = await supabase
    .from("notifications")
    .insert([
      {
        user_id: userId,
        title,
        message,
        type,
      },
    ])
    .select()
    .single();

  if (!error && notification) {
    emitToUser(userId, "notification:new", notification);
  } else {
    console.error("Failed to create notification:", error);
  }
};

export const getNotifications = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const markAsRead = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const { data: notification, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (notification) {
      emitToUser(req.user.id, "notification:read", {
        id: notification.id,
      });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const markAllAsRead = async (req: any, res: Response) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", req.user.id)
      .eq("is_read", false);

    if (error) {
      throw error;
    }

    emitToUser(req.user.id, "notification:read-all", {});

    res.json({ message: "All notifications marked as read" });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};
