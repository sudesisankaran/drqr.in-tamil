import { Request, Response } from "express";
import supabase from "../config/supabase";

export const createVisitRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      prescription,
      labReports,
      scanningReport,
      bill,
      location,
      hospitalName,
      visitDate,
      doctorName,
      doctorRegNo,
    } = req.body;

    const patientId = (req as any).user?.sub || (req as any).user?.id || (req as any).user?._id;

    const { data, error } = await supabase
      .from('visit_records')
      .insert([
        {
          patient_id: patientId,
          prescription,
          lab_reports: labReports || [],
          scanning_report: scanningReport,
          bill,
          location,
          hospital_name: hospitalName,
          visit_date: visitDate ? new Date(visitDate).toISOString() : null,
          doctor_name: doctorName,
          doctor_reg_no: doctorRegNo,
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

export const getVisitRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.sub || (req as any).user?.id || (req as any).user?._id;
    
    let query = supabase.from('visit_records').select('*');
    
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
