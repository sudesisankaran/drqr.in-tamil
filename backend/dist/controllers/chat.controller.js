"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.getConversation = exports.getChatContacts = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const message_model_1 = __importDefault(require("../models/message.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const notification_controller_1 = require("./notification.controller");
const socket_1 = require("../socket");
const getConversationKey = (firstId, secondId) => [firstId, secondId].sort().join(":");
const getChatContacts = async (req, res) => {
    try {
        const role = req.user.role;
        const contactRole = role === "doctor" ? "patient" : "doctor";
        if (role === "admin") {
            const users = await user_model_1.default.find({ role: { $in: ["doctor", "patient"] } })
                .select("fullName email role profile_image patientId")
                .sort({ fullName: 1 });
            return res.json(users);
        }
        const users = await user_model_1.default.find({ role: contactRole })
            .select("fullName email role profile_image patientId")
            .sort({ fullName: 1 });
        res.json(users);
    }
    catch {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getChatContacts = getChatContacts;
const getConversation = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { userId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user" });
        }
        const conversationKey = getConversationKey(currentUserId, userId);
        await message_model_1.default.updateMany({ conversationKey, receiverId: currentUserId }, { isRead: true });
        const messages = await message_model_1.default.find({ conversationKey })
            .sort({ createdAt: 1 })
            .populate("senderId", "fullName role")
            .populate("receiverId", "fullName role");
        res.json(messages);
    }
    catch {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getConversation = getConversation;
const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId, text } = req.body;
        if (!receiverId || !text?.trim()) {
            return res
                .status(400)
                .json({ message: "Receiver and message are required" });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ message: "Invalid receiver" });
        }
        const receiver = await user_model_1.default.findById(receiverId).select("role");
        if (!receiver) {
            return res.status(404).json({ message: "Receiver not found" });
        }
        const message = await message_model_1.default.create({
            senderId,
            receiverId,
            conversationKey: getConversationKey(senderId, receiverId),
            text,
        });
        const populated = await message.populate("senderId", "fullName role");
        (0, socket_1.emitToUser)(receiverId, "message:new", populated);
        (0, socket_1.emitToUser)(senderId, "message:sent", populated);
        await (0, notification_controller_1.createNotification)(receiverId, "New Message", `You have a new message from ${populated.senderId.fullName}`, "system");
        res.status(201).json(populated);
    }
    catch {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.sendMessage = sendMessage;
