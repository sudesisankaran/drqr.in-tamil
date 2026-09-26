import { Response } from "express";
import mongoose from "mongoose";
import Message from "../models/message.model";
import User, { IUser } from "../models/user.model";
import { createNotification } from "./notification.controller";
import { emitToUser } from "../socket";

const getConversationKey = (firstId: string, secondId: string) =>
  [firstId, secondId].sort().join(":");

type PopulatedMessageUser = Pick<IUser, "fullName" | "role">;

export const getChatContacts = async (req: any, res: Response) => {
  try {
    const role = req.user.role;
    const contactRole = role === "doctor" ? "patient" : "doctor";

    if (role === "admin") {
      const users = await User.find({ role: { $in: ["doctor", "patient"] } })
        .select("fullName email role profile_image patientId")
        .sort({ fullName: 1 });
      return res.json(users);
    }

    const users = await User.find({ role: contactRole })
      .select("fullName email role profile_image patientId")
      .sort({ fullName: 1 });

    res.json(users);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getConversation = async (req: any, res: Response) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user" });
    }

    const conversationKey = getConversationKey(currentUserId, userId);

    await Message.updateMany(
      { conversationKey, receiverId: currentUserId },
      { isRead: true },
    );

    const messages = await Message.find({ conversationKey })
      .sort({ createdAt: 1 })
      .populate("senderId", "fullName role")
      .populate("receiverId", "fullName role");

    res.json(messages);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

export const sendMessage = async (req: any, res: Response) => {
  try {
    const senderId = req.user.id;
    const { receiverId, text } = req.body;

    if (!receiverId || !text?.trim()) {
      return res
        .status(400)
        .json({ message: "Receiver and message are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "Invalid receiver" });
    }

    const receiver = await User.findById(receiverId).select("role");

    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    const message = await Message.create({
      senderId,
      receiverId,
      conversationKey: getConversationKey(senderId, receiverId),
      text,
    });

    const populated = await message.populate<{ senderId: PopulatedMessageUser }>(
      "senderId",
      "fullName role",
    );

    emitToUser(receiverId, "message:new", populated);
    emitToUser(senderId, "message:sent", populated);

    await createNotification(
      receiverId,
      "New Message",
      `You have a new message from ${populated.senderId.fullName}`,
      "system",
    );

    res.status(201).json(populated);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};
