import { Response } from "express";
import HealthRecord from "../models/healthRecord.model";

export const getHealthRecord = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const record = await HealthRecord.findOne({ userId });

    if (!record) {
      return res.status(200).json(null); // 👈 frontend handles N.A
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const upsertHealthRecord = async (req: any, res: Response) => {
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

    const record = await HealthRecord.findOneAndUpdate(
      { userId },
      {
        weight,
        height,
        bmi,
        bloodPressure,
      },
      {
        new: true,
        upsert: true,
      },
    );

    res.json({
      message: "Health record saved successfully",
      record,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteHealthRecord = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    await HealthRecord.findOneAndDelete({ userId });

    res.json({ message: "Health record deleted" });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};
