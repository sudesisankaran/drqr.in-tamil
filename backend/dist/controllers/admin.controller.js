"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// 🔥 1. Get All Users
const getAllUsers = async (req, res) => {
    try {
        const { type } = req.body;
        if (type && !["doctor", "patient"].includes(type)) {
            return res.status(400).json({ message: "Invalid role" });
        }
        const users = await user_model_1.default.find({
            role: type || "patient",
        }).select("-password");
        res.json(users);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getAllUsers = getAllUsers;
// 🔥 2. Get Single User
const getUserById = async (req, res) => {
    try {
        const user = await user_model_1.default.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    }
    catch {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getUserById = getUserById;
// 🔥 3. Create User (Admin)
const createUser = async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;
        // Validation
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }
        const userExists = await user_model_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        // Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const user = await user_model_1.default.create({
            fullName,
            email,
            password,
            role,
        });
        res.status(201).json({
            message: "User created successfully",
            user: {
                ...user.toObject(),
                password: undefined,
            },
        });
    }
    catch {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.createUser = createUser;
// 🔥 4. Update User
const updateUser = async (req, res) => {
    try {
        const { fullName, email, role } = req.body;
        const user = await user_model_1.default.findByIdAndUpdate(req.params.id, { fullName, email, role }, { new: true }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            message: "User updated successfully",
            user,
        });
    }
    catch {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.updateUser = updateUser;
// 🔥 5. Delete User
const deleteUser = async (req, res) => {
    try {
        const user = await user_model_1.default.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    }
    catch {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.deleteUser = deleteUser;
