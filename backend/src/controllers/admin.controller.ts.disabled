import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcryptjs";

// 🔥 1. Get All Users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { type } = req.body;
    if (type && !["doctor", "patient"].includes(type as string)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const users = await User.find({
      role: type || "patient",
    }).select("-password");

    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 🔥 2. Get Single User
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

// 🔥 3. Create User (Admin)
export const createUser = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
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
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

// 🔥 4. Update User
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { fullName, email, role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, email, role },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user,
    });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

// 🔥 5. Delete User
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};
