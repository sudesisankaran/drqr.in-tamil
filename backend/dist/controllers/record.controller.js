"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRecord = exports.getRecords = void 0;
const record_model_1 = __importDefault(require("../models/record.model"));
const notification_controller_1 = require("./notification.controller");
const user_model_1 = __importDefault(require("../models/user.model"));
const normalizeAttachmentUrls = (value) => {
    if (!value)
        return [];
    if (Array.isArray(value)) {
        return value
            .flatMap((item) => String(item)
            .split(/\r?\n/)
            .map((entry) => entry.trim()))
            .filter(Boolean);
    }
    const raw = String(value).trim();
    if (!raw)
        return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
    }
    catch {
        // fall back to newline parsing
    }
    return raw
        .split(/\r?\n/)
        .map((entry) => entry.trim())
        .filter(Boolean);
};
const getRecords = async (req, res) => {
    try {
        const filter = req.user.role === "patient"
            ? { patientId: req.user.id }
            : req.user.role === "doctor"
                ? { doctorId: req.user.id }
                : {};
        const records = await record_model_1.default.find(filter)
            .populate("patientId", "fullName patientId")
            .populate("doctorId", "fullName")
            .populate("issuedByDoctorId", "fullName email")
            .sort({ createdAt: -1 });
        res.json(records);
    }
    catch {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getRecords = getRecords;
const createRecord = async (req, res) => {
    try {
        const requestedPatientId = req.body.patientId;
        const patientId = req.user.role === "patient" ? req.user.id : requestedPatientId;
        const { title, description, recordType, issuedDate, issuedByName, fileUrl: legacyFileUrl, attachmentUrls, } = req.body;
        const uploadedFiles = req.files || [];
        const uploadedAttachments = uploadedFiles.map((file) => ({
            name: file.originalname,
            url: `${req.protocol}://${req.get("host")}/uploads/records/${file.filename}`,
        }));
        const linkedAttachments = normalizeAttachmentUrls(attachmentUrls).map((url) => ({
            name: url.split("/").pop() || "Attachment",
            url,
        }));
        const legacyAttachment = legacyFileUrl
            ? [{ name: "Linked file", url: String(legacyFileUrl).trim() }]
            : [];
        const attachments = [
            ...uploadedAttachments,
            ...linkedAttachments,
            ...legacyAttachment,
        ];
        const primaryFileUrl = attachments[0]?.url;
        if (!patientId || !title) {
            return res.status(400).json({ message: "Patient and title required" });
        }
        const doctorUser = req.user.role === "doctor"
            ? await user_model_1.default.findById(req.user.id).select("fullName").lean()
            : null;
        const record = await record_model_1.default.create({
            patientId,
            doctorId: req.user.role === "doctor" ? req.user.id : req.body.doctorId,
            issuedByDoctorId: req.user.role === "doctor" ? req.user.id : undefined,
            title,
            description,
            recordType: recordType || "other",
            issuedDate: issuedDate || undefined,
            issuedByName: req.user.role === "doctor"
                ? doctorUser?.fullName
                : issuedByName || undefined,
            fileUrl: primaryFileUrl,
            attachments,
        });
        await (0, notification_controller_1.createNotification)(patientId, "New Report Uploaded", title, "report");
        res.status(201).json(record);
    }
    catch {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.createRecord = createRecord;
