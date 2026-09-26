"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.updateNotifications = exports.changePassword = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const changePassword = async (req, res) => {
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
        const user = await user_model_1.default.findById(userId);
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
    }
    catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.changePassword = changePassword;
const updateNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { notifications } = req.body;
        const user = await user_model_1.default.findByIdAndUpdate(userId, { notifications }, { new: true }).select("-password");
        res.json({
            message: "Notification settings updated",
            user,
        });
    }
    catch {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.updateNotifications = updateNotifications;
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        await user_model_1.default.findByIdAndDelete(userId);
        res.json({ message: "Account deleted successfully" });
    }
    catch {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.deleteAccount = deleteAccount;
