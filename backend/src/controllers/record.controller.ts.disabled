import { Response } from "express";
import Record from "../models/record.model";
import { createNotification } from "./notification.controller";
import User from "../models/user.model";

const normalizeAttachmentUrls = (value: unknown): string[] => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .flatMap((item) =>
        String(item)
          .split(/\r?\n/)
          .map((entry) => entry.trim()),
      )
      .filter(Boolean);
  }

  const raw = String(value).trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // fall back to newline parsing
  }

  return raw
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
};

export const getRecords = async (req: any, res: Response) => {
  try {
    const filter =
      req.user.role === "patient"
        ? { patientId: req.user.id }
        : req.user.role === "doctor"
          ? { doctorId: req.user.id }
          : {};

    const records = await Record.find(filter)
      .populate("patientId", "fullName patientId")
      .populate("doctorId", "fullName")
      .populate("issuedByDoctorId", "fullName email")
      .sort({ createdAt: -1 });

    res.json(records);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

export const createRecord = async (req: any, res: Response) => {
  try {
    const requestedPatientId = req.body.patientId;
    const patientId =
      req.user.role === "patient" ? req.user.id : requestedPatientId;
    const {
      title,
      description,
      recordType,
      issuedDate,
      issuedByName,
      fileUrl: legacyFileUrl,
      attachmentUrls,
    } = req.body;
    const uploadedFiles = (req.files as Express.Multer.File[] | undefined) || [];
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

    const doctorUser =
      req.user.role === "doctor"
        ? await User.findById(req.user.id).select("fullName").lean()
        : null;

    const record = await Record.create({
      patientId,
      doctorId: req.user.role === "doctor" ? req.user.id : req.body.doctorId,
      issuedByDoctorId: req.user.role === "doctor" ? req.user.id : undefined,
      title,
      description,
      recordType: recordType || "other",
      issuedDate: issuedDate || undefined,
      issuedByName:
        req.user.role === "doctor"
          ? doctorUser?.fullName
          : issuedByName || undefined,
      fileUrl: primaryFileUrl,
      attachments,
    });

    await createNotification(
      patientId,
      "New Report Uploaded",
      title,
      "report",
    );

    res.status(201).json(record);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};
