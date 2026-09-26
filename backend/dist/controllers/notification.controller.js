"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllAsRead = exports.markAsRead = exports.getNotifications = exports.createNotification = void 0;
const supabase_1 = __importDefault(require("../config/supabase"));
const socket_1 = require("../socket");
const createNotification = async (userId, title, message, type = "system") => {
    const { data: notification, error } = await supabase_1.default
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
        (0, socket_1.emitToUser)(userId, "notification:new", notification);
    }
    else {
        console.error("Failed to create notification:", error);
    }
};
exports.createNotification = createNotification;
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { data: notifications, error } = await supabase_1.default
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });
        if (error) {
            throw error;
        }
        res.json(notifications);
    }
    catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const { data: notification, error } = await supabase_1.default
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
            (0, socket_1.emitToUser)(req.user.id, "notification:read", {
                id: notification.id,
            });
        }
        res.json(notification);
    }
    catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res) => {
    try {
        const { error } = await supabase_1.default
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", req.user.id)
            .eq("is_read", false);
        if (error) {
            throw error;
        }
        (0, socket_1.emitToUser)(req.user.id, "notification:read-all", {});
        res.json({ message: "All notifications marked as read" });
    }
    catch {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.markAllAsRead = markAllAsRead;
