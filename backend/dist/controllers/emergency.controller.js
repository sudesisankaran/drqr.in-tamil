"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureMyEmergencyQr = exports.getMyEmergencyQr = exports.getEmergencyPatient = void 0;
const crypto_1 = __importDefault(require("crypto"));
const emergency_model_1 = __importDefault(require("../models/emergency.model"));
const healthRecord_model_1 = __importDefault(require("../models/healthRecord.model"));
const medicalRecord_model_1 = __importDefault(require("../models/medicalRecord.model"));
const record_model_1 = __importDefault(require("../models/record.model"));
const appointment_model_1 = __importDefault(require("../models/appointment.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const normalizeText = (value) => typeof value === "string" ? value.trim() : "";
const publicPatientFields = "fullName role profile_image gender age address patientId";
const privatePatientFields = "fullName email role profile_image gender age dateOfBirth phone address patientId";
const buildEmergencyPayload = async (qrCodeId, viewerRole) => {
    const access = await emergency_model_1.default.findOne({
        qrCodeId,
        active: true,
    }).lean();
    if (!access) {
        return null;
    }
    const canViewClinicalDetails = viewerRole === "doctor" || viewerRole === "admin";
    const patient = await user_model_1.default.findById(access.patientId)
        .select(canViewClinicalDetails ? privatePatientFields : publicPatientFields)
        .lean();
    if (!patient || patient.role !== "patient") {
        return null;
    }
    const medicalRecord = await medicalRecord_model_1.default.findOne({
        userId: patient._id,
        isEmergencyAccessible: true,
    })
        .sort({ updatedAt: -1 })
        .lean();
    const healthRecord = canViewClinicalDetails
        ? await healthRecord_model_1.default.findOne({ userId: patient._id })
            .sort({ updatedAt: -1 })
            .lean()
        : null;
    const uploadedRecords = canViewClinicalDetails
        ? await record_model_1.default.find({ patientId: patient._id })
            .populate("doctorId", "fullName email profile_image")
            .populate("issuedByDoctorId", "fullName email profile_image")
            .sort({ issuedDate: -1, createdAt: -1 })
            .lean()
        : [];
    const appointments = canViewClinicalDetails
        ? await appointment_model_1.default.find({ patientId: patient._id })
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
const getEmergencyPatient = async (req, res) => {
    try {
        const data = await buildEmergencyPayload(req.params.qrCodeId, req.user?.role);
        if (!data) {
            return res.status(404).json({ message: "Emergency QR not found" });
        }
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getEmergencyPatient = getEmergencyPatient;
const getMyEmergencyQr = async (req, res) => {
    try {
        const userId = req.user.id;
        const access = await emergency_model_1.default.findOne({ patientId: userId }).lean();
        if (!access) {
            return res.status(404).json({ message: "Emergency QR not created yet" });
        }
        res.json(access);
    }
    catch {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getMyEmergencyQr = getMyEmergencyQr;
const ensureMyEmergencyQr = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await user_model_1.default.findById(userId).select("role").lean();
        if (!user || user.role !== "patient") {
            return res
                .status(403)
                .json({ message: "Only patients can create emergency QR access" });
        }
        const access = await emergency_model_1.default.findOneAndUpdate({ patientId: userId }, {
            $setOnInsert: {
                patientId: userId,
                qrCodeId: crypto_1.default.randomBytes(12).toString("hex"),
                active: true,
            },
            emergencyNotes: normalizeText(req.body?.emergencyNotes),
        }, { new: true, upsert: true });
        res.status(201).json(access);
    }
    catch {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.ensureMyEmergencyQr = ensureMyEmergencyQr;
