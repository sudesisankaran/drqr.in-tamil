"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVisitRecords = exports.createVisitRecord = void 0;
const supabase_1 = __importDefault(require("../config/supabase"));
const createVisitRecord = async (req, res) => {
    try {
        const { prescription, labReports, scanningReport, bill, location, hospitalName, visitDate, doctorName, doctorRegNo, } = req.body;
        const patientId = req.user?.sub || req.user?.id || req.user?._id;
        const { data, error } = await supabase_1.default
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
        if (error)
            throw error;
        res.status(201).json({
            success: true,
            data: data[0],
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createVisitRecord = createVisitRecord;
const getVisitRecords = async (req, res) => {
    try {
        const userId = req.user?.sub || req.user?.id || req.user?._id;
        let query = supabase_1.default.from('visit_records').select('*');
        if (req.user.role === 'patient') {
            query = query.eq('patient_id', userId);
        }
        else if (req.query.patientId) {
            query = query.eq('patient_id', req.query.patientId);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error)
            throw error;
        res.status(200).json({
            success: true,
            data,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getVisitRecords = getVisitRecords;
