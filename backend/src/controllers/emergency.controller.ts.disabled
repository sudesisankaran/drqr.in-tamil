import { Response } from "express";
import crypto from "crypto";
import EmergencyAccess from "../models/emergency.model";
import HealthRecord from "../models/healthRecord.model";
import MedicalRecord from "../models/medicalRecord.model";
import Record from "../models/record.model";
import Appointment from "../models/appointment.model";
import User from "../models/user.model";

const normalizeText = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const publicPatientFields =
  "fullName role profile_image gender age address patientId";

const privatePatientFields =
  "fullName email role profile_image gender age dateOfBirth phone address patientId";

const buildEmergencyPayload = async (qrCodeId: string, viewerRole?: string) => {
  const access = await EmergencyAccess.findOne({
    qrCodeId,
    active: true,
  }).lean();

  if (!access) {
    return null;
  }

  const canViewClinicalDetails =
    viewerRole === "doctor" || viewerRole === "admin";

  const patient = await User.findById(access.patientId)
    .select(canViewClinicalDetails ? privatePatientFields : publicPatientFields)
    .lean();

  if (!patient || patient.role !== "patient") {
    return null;
  }

  const medicalRecord = await MedicalRecord.findOne({
    userId: patient._id,
    isEmergencyAccessible: true,
  })
    .sort({ updatedAt: -1 })
    .lean();

  const healthRecord = canViewClinicalDetails
    ? await HealthRecord.findOne({ userId: patient._id })
        .sort({ updatedAt: -1 })
        .lean()
    : null;

  const uploadedRecords = canViewClinicalDetails
    ? await Record.find({ patientId: patient._id })
        .populate("doctorId", "fullName email profile_image")
        .populate("issuedByDoctorId", "fullName email profile_image")
        .sort({ issuedDate: -1, createdAt: -1 })
        .lean()
    : [];

  const appointments = canViewClinicalDetails
    ? await Appointment.find({ patientId: patient._id })
        .populate("doctorId", "fullName email profile_image")
        .sort({ date: -1, createdAt: -1 })
        .lean()
    : [];

  const emergencySummary = {
    bloodGroup: medicalRecord?.bloodGroup || "N.A",
    allergies: medicalRecord?.allergies || [],
    diseases: medicalRecord?.diseases || [],
    emergencyContact: medicalRecord?.emergencyContact || null,
    emergencyNotes: access.emergencyNotes || "",
  };

  return {
    qrCodeId: access.qrCodeId,
    accessLevel: canViewClinicalDetails ? "doctor" : "public",
    patient,
    emergency: emergencySummary,
    clinical: canViewClinicalDetails
        ? {
          healthRecord,
          fullMedicalRecord: medicalRecord,
          medications: medicalRecord?.medications || [],
          dietPlan: medicalRecord?.dietPlan || null,
          doctorNotes: medicalRecord?.doctorNotes || "",
          reports: medicalRecord?.reports || [],
          uploadedRecords,
          appointments,
          lastUpdated: medicalRecord?.updatedAt || null,
        }
      : null,
  };
};

export const getEmergencyPatient = async (req: any, res: Response) => {
  try {
    const data = await buildEmergencyPayload(req.params.qrCodeId, req.user?.role);

    if (!data) {
      return res.status(404).json({ message: "Emergency QR not found" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getMyEmergencyQr = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const access = await EmergencyAccess.findOne({ patientId: userId }).lean();

    if (!access) {
      return res.status(404).json({ message: "Emergency QR not created yet" });
    }

    res.json(access);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

export const ensureMyEmergencyQr = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("role").lean();

    if (!user || user.role !== "patient") {
      return res
        .status(403)
        .json({ message: "Only patients can create emergency QR access" });
    }

    const access = await EmergencyAccess.findOneAndUpdate(
      { patientId: userId },
      {
        $setOnInsert: {
          patientId: userId,
          qrCodeId: crypto.randomBytes(12).toString("hex"),
          active: true,
        },
        emergencyNotes: normalizeText(req.body?.emergencyNotes),
      },
      { new: true, upsert: true },
    );

    res.status(201).json(access);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};
