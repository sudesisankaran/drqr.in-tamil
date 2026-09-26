"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const notification_controller_1 = require("./notification.controller");
const supabase_1 = __importDefault(require("../config/supabase"));
const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";
const generateToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, JWT_SECRET, {
        expiresIn: "7d",
    });
};
const registerUser = async (req, res) => {
    try {
        const { fullName, email, password, role, age, aadharNo, phoneNo, whatsappNo, dob, gender, otherGender, insurance, allergyType, allergyName, allergySpecific } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "Full Name, Email, and Password are required" });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        // Check if user exists
        const { data: userExists } = await supabase_1.default.from("users").select("id").eq("email", email).single();
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        const allowedRoles = ["patient", "doctor"];
        const userRole = allowedRoles.includes(role) ? role : "patient";
        // Determine patient ID for patients
        let patientId = null;
        if (userRole === "patient") {
            const year = new Date().getFullYear();
            const random = Math.floor(100 + Math.random() * 900);
            patientId = `SHP-${year}-${random}`;
        }
        // Hash Password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // Build allergies JSONB
        let allergies = null;
        if (allergyType && allergyType !== "") {
            allergies = {
                allergyType,
                allergyName,
                allergySpecific
            };
        }
        // Handle Photo Upload
        let profileImageUrl = "";
        if (req.file) {
            // Create a unique file name
            const fileName = `profile_${Date.now()}_${req.file.originalname}`;
            const { data: uploadData, error: uploadError } = await supabase_1.default.storage
                .from("avatars") // Make sure an 'avatars' bucket exists in Supabase
                .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
            });
            if (uploadError) {
                console.error("Supabase storage upload error:", uploadError);
                // We can continue registration even if photo fails, or choose to throw
            }
            else if (uploadData) {
                const { data: publicUrlData } = supabase_1.default.storage.from("avatars").getPublicUrl(fileName);
                profileImageUrl = publicUrlData.publicUrl;
            }
        }
        // Determine final gender
        const finalGender = gender === "other" ? otherGender : gender;
        // Insert to Supabase
        const { data: newUser, error: insertError } = await supabase_1.default.from("users").insert([
            {
                full_name: fullName,
                email,
                password: hashedPassword,
                role: userRole,
                patient_id: patientId,
                age: age ? parseInt(age) : null,
                aadhar_no: aadharNo || null,
                phone: phoneNo || null,
                whatsapp_no: whatsappNo || null,
                date_of_birth: dob || null,
                gender: finalGender || null,
                insurance_details: insurance || null,
                allergies: allergies,
                profile_image: profileImageUrl
            }
        ]).select().single();
        if (insertError) {
            console.error(insertError);
            return res.status(500).json({ message: "Database error during registration", details: insertError.message });
        }
        const { password: _, ...userResponse } = newUser;
        res.status(201).json({
            message: "User registered successfully",
            token: generateToken(newUser.id, newUser.role),
            user: {
                _id: newUser.id,
                id: newUser.id,
                fullName: newUser.full_name,
                email: newUser.email,
                role: newUser.role,
                profile_image: newUser.profile_image,
                patientId: newUser.patient_id
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { data: user, error } = await supabase_1.default.from("users").select("*").eq("email", email).single();
        if (error || !user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        // Try to create notification but don't fail login if it fails
        try {
            await (0, notification_controller_1.createNotification)(user.id, "Welcome", "You have successfully logged in", "system");
        }
        catch (notifErr) {
            console.error("Failed to send login notification", notifErr);
        }
        res.status(200).json({
            message: "Login successful",
            token: generateToken(user.id, user.role),
            user: {
                _id: user.id, // For backwards compatibility with frontend expecting _id
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                role: user.role,
                profile_image: user.profile_image,
                patientId: user.patient_id
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};
exports.loginUser = loginUser;
