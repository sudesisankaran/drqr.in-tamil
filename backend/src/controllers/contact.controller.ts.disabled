import { Request, Response } from "express";
import ContactMessage from "../models/contact.model";

export const createContactMessage = async (req: Request, res: Response) => {
  try {
    const { fullName, email, subject, message } = req.body;

    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const contact = await ContactMessage.create({
      fullName,
      email,
      subject,
      message,
    });

    res.status(201).json({
      message: "Message sent successfully",
      contact,
    });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getContactMessages = async (_req: Request, res: Response) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};
