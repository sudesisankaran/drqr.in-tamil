"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSlotAvailability = exports.generateSlots = exports.updateAppointmentStatus = exports.getAppointments = exports.createAppointment = void 0;
const appointment_model_1 = __importDefault(require("../models/appointment.model"));
const notification_controller_1 = require("./notification.controller");
const user_model_1 = __importDefault(require("../models/user.model"));
const getSlotKey = (date, time) => {
    return `${date}_${time}`;
};
// 🔥 Book Appointment
const createAppointment = async (req, res) => {
    try {
        const { doctorId, date, time, reason } = req.body;
        const patientId = req.user.role === "patient" ? req.user.id : req.body.patientId;
        if (!patientId || !doctorId || !date || !time) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const doctor = await user_model_1.default.findById(doctorId).select("role");
        if (!doctor || doctor.role !== "doctor") {
            return res.status(400).json({ message: "Select a valid doctor" });
        }
        const slotKey = `${date}_${time}`;
        const existing = await appointment_model_1.default.findOne({
            patientId,
            doctorId,
            slotKey,
        });
        if (existing) {
            return res.status(400).json({
                message: "You already booked this slot",
            });
        }
        const count = await appointment_model_1.default.countDocuments({
            doctorId,
            slotKey,
        });
        if (count >= 2) {
            return res.status(400).json({
                message: "This slot is fully booked",
            });
        }
        const appointment = await appointment_model_1.default.create({
            patientId,
            doctorId,
            date,
            time,
            slotKey,
            reason,
        });
        await (0, notification_controller_1.createNotification)(doctorId, "New Appointment", "You have a new appointment request", "appointment");
        res.status(201).json({
            message: "Appointment booked successfully",
            appointment,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.createAppointment = createAppointment;
const getAppointments = async (req, res) => {
    try {
        const user = req.user;
        const filter = user.role === "admin"
            ? {}
            : { $or: [{ patientId: user.id }, { doctorId: user.id }] };
        const appointments = await appointment_model_1.default.find(filter)
            .populate("patientId", "fullName email profile_image")
            .populate("doctorId", "fullName email profile_image");
        res.json(appointments);
    }
    catch {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getAppointments = getAppointments;
const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        const appointment = await appointment_model_1.default.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        const isDoctor = appointment.doctorId.toString() === req.user.id;
        const isPatient = appointment.patientId.toString() === req.user.id;
        if (req.user.role !== "admin" && !isDoctor && !isPatient) {
            return res.status(403).json({ message: "Access denied" });
        }
        if (req.user.role === "patient" && status !== "cancelled") {
            return res
                .status(403)
                .json({ message: "Patients can only cancel appointments" });
        }
        appointment.status = status;
        await appointment.save();
        const recipientId = isDoctor
            ? appointment.patientId.toString()
            : appointment.doctorId.toString();
        const actor = await user_model_1.default.findById(req.user.id).select("fullName").lean();
        await (0, notification_controller_1.createNotification)(recipientId, "Appointment Updated", `${actor?.fullName || "A user"} marked the appointment as ${status}`, "appointment");
        res.json(appointment);
    }
    catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.updateAppointmentStatus = updateAppointmentStatus;
const generateSlots = () => {
    const slots = [];
    let start = 10 * 60; // 10:00 AM
    let end = 18 * 60; // 6:00 PM
    for (let i = start; i < end; i += 15) {
        const hour = Math.floor(i / 60);
        const min = i % 60;
        slots.push(`${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`);
    }
    return slots;
};
exports.generateSlots = generateSlots;
const getSlotAvailability = async (req, res) => {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
        return res.status(400).json({ message: "Doctor and date are required" });
    }
    const slots = (0, exports.generateSlots)();
    const bookings = await appointment_model_1.default.find({ doctorId, date });
    const slotMap = {};
    bookings.forEach((b) => {
        slotMap[b.time] = (slotMap[b.time] || 0) + 1;
    });
    const result = slots.map((time) => ({
        time,
        booked: slotMap[time] || 0,
        available: (slotMap[time] || 0) < 2,
    }));
    res.json(result);
};
exports.getSlotAvailability = getSlotAvailability;
