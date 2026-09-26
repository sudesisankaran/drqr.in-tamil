import { Request, Response } from "express";
import supabase from "../config/supabase";

export const createTreatmentRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      doctorName,
      doctorLicenceNumber,
      doctorQualification,
      treatmentDate,
      treatmentName,
      treatmentIdProofUrl,
    } = req.body;

    const patientId = (req as any).user?.sub || (req as any).user?.id || (req as any).user?._id;

    const { data, error } = await supabase
      .from('treatment_records')
      .insert([
        {
          patient_id: patientId,
          doctor_name: doctorName,
          doctor_licence_number: doctorLicenceNumber,
          doctor_qualification: doctorQualification,
          treatment_date: treatmentDate ? new Date(treatmentDate).toISOString() : null,
          treatment_name: treatmentName,
          treatment_id_proof_url: treatmentIdProofUrl,
        }
      ])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data[0],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTreatmentRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.sub || (req as any).user?.id || (req as any).user?._id;
    
    let query = supabase.from('treatment_records').select('*');
    
    if ((req as any).user.role === 'patient') {
      query = query.eq('patient_id', userId);
    } else if (req.query.patientId) {
      query = query.eq('patient_id', req.query.patientId as string);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
