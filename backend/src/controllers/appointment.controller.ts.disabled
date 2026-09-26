import { Response } from "express";
import Appointment from "../models/appointment.model";
import { createNotification } from "./notification.controller";
import User from "../models/user.model";

const getSlotKey = (date: string, time: string) => {
  return `${date}_${time}`;
};

// 🔥 Book Appointment
export const createAppointment = async (req: any, res: Response) => {
  try {
    const { doctorId, date, time, reason } = req.body;
    const patientId = req.user.role === "patient" ? req.user.id : req.body.patientId;

    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const doctor = await User.findById(doctorId).select("role");
    if (!doctor || doctor.role !== "doctor") {
      return res.status(400).json({ message: "Select a valid doctor" });
    }

    const slotKey = `${date}_${time}`;

    const existing = await Appointment.findOne({
      patientId,
      doctorId,
      slotKey,
    });
    if (existing) {
      return res.status(400).json({
        message: "You already booked this slot",
      });
    }

    const count = await Appointment.countDocuments({
      doctorId,
      slotKey,
    });
    if (count >= 2) {
      return res.status(400).json({
        message: "This slot is fully booked",
      });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      time,
      slotKey,
      reason,
    });

    await createNotification(
      doctorId,
      "New Appointment",
      "You have a new appointment request",
      "appointment",
    );

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

import { RequestHandler } from "express";

export const getAppointments: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;

    const filter =
      user.role === "admin"
        ? {}
        : { $or: [{ patientId: user.id }, { doctorId: user.id }] };

    const appointments = await Appointment.find(filter)
      .populate("patientId", "fullName email profile_image")
      .populate("doctorId", "fullName email profile_image");

    res.json(appointments);

  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateAppointmentStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findById(id);

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
    const actor = await User.findById(req.user.id).select("fullName").lean();

    await createNotification(
      recipientId,
      "Appointment Updated",
      `${actor?.fullName || "A user"} marked the appointment as ${status}`,
      "appointment",
    );

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const generateSlots = () => {
  const slots = [];
  let start = 10 * 60; // 10:00 AM
  let end = 18 * 60; // 6:00 PM

  for (let i = start; i < end; i += 15) {
    const hour = Math.floor(i / 60);
    const min = i % 60;

    slots.push(
      `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`,
    );
  }

  return slots;
};

export const getSlotAvailability = async (req: any, res: Response) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({ message: "Doctor and date are required" });
  }

  const slots = generateSlots();

  const bookings = await Appointment.find({ doctorId, date });

  const slotMap: any = {};

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
