import { Response } from "express";
import User from "../models/user.model";

export const changePassword = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const { password, newPassword } = req.body;

    if (!password || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    user.password = newPassword;

    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateNotifications = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { notifications } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { notifications },
      { new: true }
    ).select("-password");

    res.json({
      message: "Notification settings updated",
      user,
    });

  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteAccount = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    await User.findByIdAndDelete(userId);

    res.json({ message: "Account deleted successfully" });

  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};