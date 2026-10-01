import { Response } from "express";

export const getHealthRecord = async (req: any, res: Response) => {
  try {
    // MongoDB was deprecated. Returning null for now.
    res.json(null);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const upsertHealthRecord = async (req: any, res: Response) => {
  try {
    res.status(501).json({ message: "Not Implemented Yet" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteHealthRecord = async (req: any, res: Response) => {
  try {
    res.status(501).json({ message: "Not Implemented Yet" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
