"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContactMessages = exports.createContactMessage = void 0;
const contact_model_1 = __importDefault(require("../models/contact.model"));
const createContactMessage = async (req, res) => {
    try {
        const { fullName, email, subject, message } = req.body;
        if (!fullName || !email || !subject || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email address" });
        }
        const contact = await contact_model_1.default.create({
            fullName,
            email,
            subject,
            message,
        });
        res.status(201).json({
            message: "Message sent successfully",
            contact,
        });
    }
    catch {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.createContactMessage = createContactMessage;
const getContactMessages = async (_req, res) => {
    try {
        const messages = await contact_model_1.default.find().sort({ createdAt: -1 });
        res.json(messages);
    }
    catch {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getContactMessages = getContactMessages;
