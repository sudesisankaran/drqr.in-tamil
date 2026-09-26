import { Response } from "express";
import supabase from "../config/supabase";
import { createNotification } from "./notification.controller";

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
    let query = supabase.from('medical_records').select(`
      *,
      patient:users!medical_records_patientId_fkey(id, full_name, email, patient_id),
      doctor:users!medical_records_doctorId_fkey(id, full_name, email),
      issuedByDoctor:users!medical_records_issuedByDoctorId_fkey(id, full_name, email)
    `);
    
    if (req.user.role === "patient") {
      query = query.eq('patientId', req.user.id);
    } else if (req.user.role === "doctor") {
      query = query.eq('doctorId', req.user.id);
    }

    const { data: records, error } = await query.order('createdAt', { ascending: false });
    
    if (error) throw error;
    
    // Map data back to expected shape for frontend
    const formattedRecords = records.map(r => ({
      _id: r.id,
      patientId: r.patient ? { _id: r.patient.id, fullName: r.patient.full_name, patientId: r.patient.patient_id } : null,
      doctorId: r.doctor ? { _id: r.doctor.id, fullName: r.doctor.full_name } : null,
      issuedByDoctorId: r.issuedByDoctor ? { _id: r.issuedByDoctor.id, fullName: r.issuedByDoctor.full_name, email: r.issuedByDoctor.email } : null,
      title: r.title,
      description: r.description,
      recordType: r.recordType,
      issuedDate: r.issuedDate,
      issuedByName: r.issuedByName,
      fileUrl: r.fileUrl,
      attachments: r.attachments,
      createdAt: r.createdAt
    }));

    res.json(formattedRecords);
  } catch (error: any) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const createRecord = async (req: any, res: Response) => {
  try {
    const requestedPatientId = req.body.patientId;
    const patientId = req.user.role === "patient" ? req.user.id : requestedPatientId;
    
    if (!patientId || !req.body.title) {
      return res.status(400).json({ message: "Patient and title required" });
    }

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

    const legacyAttachment = legacyFileUrl ? [{ name: "Linked file", url: String(legacyFileUrl).trim() }] : [];
    const attachments = [...uploadedAttachments, ...linkedAttachments, ...legacyAttachment];
    const primaryFileUrl = attachments[0]?.url || null;

    let doctorName = req.user.role === "doctor" ? undefined : (issuedByName || undefined);
    if (req.user.role === "doctor") {
      const { data: doctor } = await supabase.from('users').select('full_name').eq('id', req.user.id).single();
      if (doctor) doctorName = doctor.full_name;
    }

    const { data: record, error } = await supabase.from('medical_records').insert([{
      patientId: patientId,
      doctorId: req.user.role === "doctor" ? req.user.id : (req.body.doctorId || null),
      issuedByDoctorId: req.user.role === "doctor" ? req.user.id : null,
      title: title,
      description: description || null,
      recordType: recordType || "other",
      issuedDate: issuedDate || null,
      issuedByName: doctorName,
      fileUrl: primaryFileUrl,
      attachments: attachments.length > 0 ? attachments : null
    }]).select().single();

    if (error) throw error;

    await createNotification(patientId, "New Report Uploaded", title, "report");

    res.status(201).json({
      ...record,
      _id: record.id
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
