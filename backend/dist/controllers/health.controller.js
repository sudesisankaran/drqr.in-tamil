"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHealthRecord = exports.upsertHealthRecord = exports.getHealthRecord = void 0;
const healthRecord_model_1 = __importDefault(require("../models/healthRecord.model"));
const getHealthRecord = async (req, res) => {
    try {
        const userId = req.user.id;
        const record = await healthRecord_model_1.default.findOne({ userId });
        if (!record) {
            return res.status(200).json(null); // 👈 frontend handles N.A
        }
        res.json(record);
    }
    catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getHealthRecord = getHealthRecord;
const upsertHealthRecord = async (req, res) => {
    try {
        const userId = req.user.id;
        const { weight, height, bloodPressure } = req.body;
        if (!weight || !height || !bloodPressure) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }
        if (!bloodPressure.systolic || !bloodPressure.diastolic) {
            return res.status(400).json({
                message: "Invalid blood pressure",
            });
        }
        const h = height / 100;
        const bmi = +(weight / (h * h)).toFixed(2);
        const record = await healthRecord_model_1.default.findOneAndUpdate({ userId }, {
            weight,
            height,
            bmi,
            bloodPressure,
        }, {
            new: true,
            upsert: true,
        });
        res.json({
            message: "Health record saved successfully",
            record,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.upsertHealthRecord = upsertHealthRecord;
const deleteHealthRecord = async (req, res) => {
    try {
        const userId = req.user.id;
        await healthRecord_model_1.default.findOneAndDelete({ userId });
        res.json({ message: "Health record deleted" });
    }
    catch {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.deleteHealthRecord = deleteHealthRecord;
