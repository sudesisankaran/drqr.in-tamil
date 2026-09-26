"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessibleProfile = exports.getPatients = exports.getDoctors = exports.updateMyMedicalRecord = exports.updateProfileImage = exports.getMe = exports.updateProfile = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const healthRecord_model_1 = __importDefault(require("../models/healthRecord.model"));
const record_model_1 = __importDefault(require("../models/record.model"));
const medicalRecord_model_1 = __importDefault(require("../models/medicalRecord.model"));
const appointment_model_1 = __importDefault(require("../models/appointment.model"));
const emergency_model_1 = __importDefault(require("../models/emergency.model"));
const normalizeText = (value) => typeof value === "string" ? value.trim() : "";
const normalizeList = (value) => Array.isArray(value)
    ? value
        .map((item) => normalizeText(item))
        .filter(Boolean)
    : [];
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { fullName, gender, age, phone, dateOfBirth, address } = req.body;
        if (age && age < 0) {
            return res.status(400).json({ message: "Invalid age" });
        }
        if (gender && !["male", "female", "other"].includes(gender)) {
            return res.status(400).json({ message: "Invalid gender" });
        }
        const updatedUser = await user_model_1.default.findByIdAndUpdate(userId, {
            fullName,
            gender,
            age,
            phone,
            dateOfBirth: dateOfBirth || undefined,
            address,
        }, { new: true }).select("-password");
        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.updateProfile = updateProfile;
const getMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await user_model_1.default.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getMe = getMe;
const updateProfileImage = async (req, res) => {
    try {
        const userId = req.user?.id;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: "Profile image is required" });
        }
        const profileImageUrl = `${req.protocol}://${req.get("host")}/uploads/avatars/${file.filename}`;
        const updatedUser = await user_model_1.default.findByIdAndUpdate(userId, { profile_image: profileImageUrl }, { new: true }).select("-password");
        res.status(200).json({
            message: "Profile image updated successfully",
            user: updatedUser,
        });
    }
    catch {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.updateProfileImage = updateProfileImage;
const updateMyMedicalRecord = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (req.user?.role !== "patient") {
            return res.status(403).json({ message: "Only patients can update their medical record" });
        }
        const hasMedications = Object.prototype.hasOwnProperty.call(req.body, "medications");
        const hasDietPlan = Object.prototype.hasOwnProperty.call(req.body, "dietPlan");
        const hasDoctorNotes = Object.prototype.hasOwnProperty.call(req.body, "doctorNotes");
        const hasAllergies = Object.prototype.hasOwnProperty.call(req.body, "allergies");
        const hasDiseases = Object.prototype.hasOwnProperty.call(req.body, "diseases");
        const hasBloodGroup = Object.prototype.hasOwnProperty.call(req.body, "bloodGroup");
        const hasEmergencyContact = Object.prototype.hasOwnProperty.call(req.body, "emergencyContact");
        const hasEmergencyAccessible = Object.prototype.hasOwnProperty.call(req.body, "isEmergencyAccessible");
        if (!hasMedications &&
            !hasDietPlan &&
            !hasDoctorNotes &&
            !hasAllergies &&
            !hasDiseases &&
            !hasBloodGroup &&
            !hasEmergencyContact &&
            !hasEmergencyAccessible) {
            return res.status(400).json({ message: "No medical record fields provided" });
        }
        let medicalRecord = await medicalRecord_model_1.default.findOne({ userId });
        if (!medicalRecord) {
            medicalRecord = new medicalRecord_model_1.default({
                userId,
                doctorNotes: "",
                medications: [],
                dietPlan: {},
                allergies: [],
                diseases: [],
                reports: [],
                isEmergencyAccessible: true,
            });
        }
        if (hasMedications) {
            medicalRecord.medications = Array.isArray(req.body.medications)
                ? req.body.medications
                    .map((item) => ({
                    name: normalizeText(item?.name),
                    dosage: normalizeText(item?.dosage),
                    frequency: normalizeText(item?.frequency),
                    duration: normalizeText(item?.duration),
                }))
                    .filter((item) => item.name || item.dosage || item.frequency || item.duration)
                : [];
        }
        if (hasDietPlan) {
            const dietPlan = req.body?.dietPlan || {};
            medicalRecord.dietPlan = {
                morning: normalizeText(dietPlan?.morning),
                afternoon: normalizeText(dietPlan?.afternoon),
                evening: normalizeText(dietPlan?.evening),
                notes: normalizeText(dietPlan?.notes),
            };
        }
        if (hasDoctorNotes) {
            medicalRecord.doctorNotes = normalizeText(req.body?.doctorNotes);
        }
        if (hasAllergies) {
            medicalRecord.allergies = normalizeList(req.body?.allergies);
        }
        if (hasDiseases) {
            medicalRecord.diseases = normalizeList(req.body?.diseases);
        }
        if (hasBloodGroup) {
            const bloodGroup = normalizeText(req.body?.bloodGroup);
            medicalRecord.bloodGroup = bloodGroup || undefined;
        }
        if (hasEmergencyContact) {
            const emergencyContact = req.body?.emergencyContact || {};
            medicalRecord.emergencyContact = {
                name: normalizeText(emergencyContact?.name),
                phone: normalizeText(emergencyContact?.phone),
                relation: normalizeText(emergencyContact?.relation),
            };
        }
        if (hasEmergencyAccessible) {
            medicalRecord.isEmergencyAccessible = Boolean(req.body?.isEmergencyAccessible);
        }
        await medicalRecord.save();
        res.json({
            message: "Medical record updated successfully",
            medicalRecord,
        });
    }
    catch (error) {
        console.error("updateMyMedicalRecord error:", error);
        res.status(500).json({
            message: error instanceof Error && error.message
                ? error.message
                : "Server Error",
        });
    }
};
exports.updateMyMedicalRecord = updateMyMedicalRecord;
const getDoctors = async (_req, res) => {
    try {
        const doctors = await user_model_1.default.find({ role: "doctor" })
            .select("-password")
            .sort({ fullName: 1 });
        res.json(doctors);
    }
    catch {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getDoctors = getDoctors;
const getPatients = async (req, res) => {
    try {
        if (!["doctor", "admin"].includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }
        const patients = await user_model_1.default.find({ role: "patient" })
            .select("-password")
            .sort({ fullName: 1 });
        res.json(patients);
    }
    catch {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getPatients = getPatients;
const getAccessibleProfile = async (req, res) => {
    try {
        const viewer = req.user;
        const targetUser = await user_model_1.default.findById(req.params.id).select("-password");
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }
        const isSelf = viewer.id === targetUser.id;
        const isAdmin = viewer.role === "admin";
        const isDoctorViewingPatient = viewer.role === "doctor" && targetUser.role === "patient";
        if (!isSelf && !isAdmin && !isDoctorViewingPatient) {
            return res.status(403).json({ message: "Access denied" });
        }
        const healthRecord = targetUser.role === "patient"
            ? await healthRecord_model_1.default.findOne({ userId: targetUser._id }).lean()
            : null;
        const medicalRecord = targetUser.role === "patient"
            ? await medicalRecord_model_1.default.findOne({ userId: targetUser._id })
                .populate("doctorId", "fullName email profile_image")
                .lean()
            : null;
        const emergencyAccess = targetUser.role === "patient"
            ? await emergency_model_1.default.findOne({ patientId: targetUser._id })
                .select("qrCodeId emergencyNotes active")
                .lean()
            : null;
        const records = await record_model_1.default.find({ patientId: targetUser._id })
            .populate("doctorId", "fullName profile_image")
            .populate("issuedByDoctorId", "fullName email profile_image")
            .sort({ createdAt: -1 })
            .lean();
        const appointments = targetUser.role === "patient"
            ? await appointment_model_1.default.find({ patientId: targetUser._id })
                .populate("doctorId", "fullName email profile_image")
                .sort({ date: -1, createdAt: -1 })
                .lean()
            : [];
        res.json({
            user: targetUser,
            healthRecord,
            medicalRecord,
            emergencyAccess,
            records,
            appointments,
        });
    }
    catch {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getAccessibleProfile = getAccessibleProfile;
