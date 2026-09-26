import { useState } from "react";
import { User, Mail, Lock, UserPlus, Phone, CreditCard, Droplet, Calendar, FileText, Users } from "lucide-react";
import AuthWrapper, { PageFooter } from "./AuthWrapper";
import InputField from "../common/InputField";
import Button from "../common/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthContext";
import { supabase } from "../../utils/supabase";

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [role, setRole] = useState<"patient" | "doctor">("patient");

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "",
        age: "",
        aadharNo: "",
        phoneNo: "",
        whatsappNo: "",
        dob: "",
        gender: "male",
        otherGender: "",
        insurance: "",
        allergyType: "",
        allergyName: "",
        allergySpecific: "",

        // Hospital specific fields
        hospitalAddress: "",
        hospitalLicenceNumber: "",
        managerDetails: "",
        hospitalEmergencyNumber: "",
        hospitalWhatsappNumber: "",
        doctorDetails: "",
        availableDoctors: "",
    });

    const [photo, setPhoto] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.fullName.trim()) return alert("Full name is required");
        if (!form.email.trim()) return alert("Email is required");
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) return alert("Enter a valid email");
        if (!form.password || form.password.length < 6) return alert("Password must be at least 6 characters");

        setLoading(true);

        try {
            // 1. Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("Failed to create user in Supabase Auth");

            const authUserId = authData.user.id;

            // 2. Upload Photo to Supabase Storage if it exists
            let profileImageUrl = "";
            if (photo) {
                const fileName = `profile_${authUserId}_${photo.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from("avatars")
                    .upload(fileName, photo, {
                        upsert: true,
                    });

                if (uploadError) {
                    console.error("Photo upload failed", uploadError);
                } else if (uploadData) {
                    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
                    profileImageUrl = publicUrlData.publicUrl;
                }
            }

            // 3. Build Allergies JSON
            let allergies = null;
            if (form.allergyType && form.allergyType !== "") {
                allergies = {
                    allergyType: form.allergyType,
                    allergyName: form.allergyName,
                    allergySpecific: form.allergySpecific
                };
            }

            const finalGender = form.gender === "other" ? form.otherGender : form.gender;
            
            let patientId = null;
            if (role === "patient") {
                const year = new Date().getFullYear();
                const random = Math.floor(100 + Math.random() * 900);
                patientId = `SHP-${year}-${random}`;
            }

            // 4. Insert into our custom public.users table
            const { data: userData, error: insertError } = await supabase.from("users").insert([
                {
                    // If your SQL schema uses UUID, you can pass authUserId as the id to keep them linked
                    id: authUserId,
                    full_name: form.fullName,
                    email: form.email,
                    password: "managed_by_supabase_auth", // Keep dummy password since column is NOT NULL
                    role: role,
                    patient_id: patientId,
                    age: form.age ? parseInt(form.age) : null,
                    aadhar_no: form.aadharNo || null,
                    phone: form.phoneNo || null,
                    whatsapp_no: form.whatsappNo || null,
                    date_of_birth: form.dob || null,
                    gender: finalGender || null,
                    insurance_details: form.insurance || null,
                    allergies: allergies,
                    profile_image: profileImageUrl,
                    // Hospital specific fields
                    hospital_address: form.hospitalAddress || null,
                    hospital_licence_number: form.hospitalLicenceNumber || null,
                    manager_details: form.managerDetails || null,
                    hospital_emergency_number: form.hospitalEmergencyNumber || null,
                    hospital_whatsapp_number: form.hospitalWhatsappNumber || null,
                    doctor_details: form.doctorDetails || null,
                    available_doctors: form.availableDoctors || null
                }
            ]).select().single();

            if (insertError) {
                throw insertError;
            }

            // 5. Update session and login
            // Supabase returns a session on successful signup if email confirmation is disabled
            const token = authData.session?.access_token || "dummy-token";
            
            // Format user object for context
            const userContextObj = {
                _id: userData.id,
                id: userData.id,
                fullName: userData.full_name,
                email: userData.email,
                role: userData.role,
                profile_image: userData.profile_image,
                patientId: userData.patient_id,
                password: "managed_by_supabase_auth",
                notifications: false
            } as any;

            sessionStorage.setItem("token", token);
            sessionStorage.setItem("user", JSON.stringify(userContextObj));
            login(token, userContextObj);

            if (userData.role === "admin") navigate("/admin/dashboard");
            else if (userData.role === "doctor") navigate("/doctor/dashboard");
            else navigate("/patient/dashboard");

        } catch (error: any) {
            console.error("Registration Error:", error);
            alert(error.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    return (
        <AuthWrapper type="register">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-blue-900">
                    Create {role === "doctor" ? "Hospital" : "Patient"} Account
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                    Register to start using DRQR as a {role === "doctor" ? "hospital or clinic" : "patient"}
                </p>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                <button
                    type="button"
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${role === "patient" ? "bg-white text-blue-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setRole("patient")}
                >
                    Patient
                </button>
                <button
                    type="button"
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${role === "doctor" ? "bg-white text-blue-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setRole("doctor")}
                >
                    Hospital
                </button>
            </div>

            <form className="space-y-4" onSubmit={handleRegister}>
                <InputField
                    label={role === "doctor" ? "Hospital / Doctor Name" : "Full Name"}
                    type="text"
                    name="fullName"
                    placeholder={role === "doctor" ? "e.g. City General Hospital" : "Your full name"}
                    icon={<User size={18} />}
                    value={form.fullName}
                    onChange={handleChange as any}
                />

                <InputField
                    label="Email Address"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    icon={<Mail size={18} />}
                    value={form.email}
                    onChange={handleChange as any}
                />

                <InputField
                    label="Password"
                    type="password"
                    name="password"
                    placeholder="Create strong password"
                    icon={<Lock size={18} />}
                    value={form.password}
                    onChange={handleChange as any}
                />

                {role === "patient" && (
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                        <h3 className="font-semibold text-blue-900">Patient Details</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <InputField
                                label="Age"
                                type="number"
                                name="age"
                                placeholder="Age"
                                icon={<User size={18} />}
                                value={form.age}
                                onChange={handleChange as any}
                            />
                            <InputField
                                label="DOB"
                                type="date"
                                name="dob"
                                placeholder=""
                                icon={<Calendar size={18} />}
                                value={form.dob}
                                onChange={handleChange as any}
                            />
                        </div>

                        <InputField
                            label="Aadhar No"
                            type="text"
                            name="aadharNo"
                            placeholder="12-digit Aadhar Number"
                            icon={<CreditCard size={18} />}
                            value={form.aadharNo}
                            onChange={handleChange as any}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <InputField
                                label="Phone No"
                                type="tel"
                                name="phoneNo"
                                placeholder="Phone number"
                                icon={<Phone size={18} />}
                                value={form.phoneNo}
                                onChange={handleChange as any}
                            />
                            <InputField
                                label="WhatsApp No"
                                type="tel"
                                name="whatsappNo"
                                placeholder="WhatsApp number"
                                icon={<Phone size={18} />}
                                value={form.whatsappNo}
                                onChange={handleChange as any}
                            />
                        </div>

                        {/* Gender Selection */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Gender</label>
                            <select
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other (Mention)</option>
                            </select>
                        </div>
                        {form.gender === "other" && (
                            <InputField
                                label="Specify Gender"
                                type="text"
                                name="otherGender"
                                placeholder="Please specify your gender"
                                icon={<User size={18} />}
                                value={form.otherGender}
                                onChange={handleChange as any}
                            />
                        )}

                        <InputField
                            label="Insurance (Optional)"
                            type="text"
                            name="insurance"
                            placeholder="Insurance details"
                            icon={<FileText size={18} />}
                            value={form.insurance}
                            onChange={handleChange as any}
                        />

                        {/* Allergy Selection */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Allergies</label>
                            <select
                                name="allergyType"
                                value={form.allergyType}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">No Known Allergies</option>
                                <option value="food">Food Allergy</option>
                                <option value="medicine">Medicine Allergy</option>
                            </select>
                        </div>

                        {form.allergyType === "food" && (
                            <div className="grid grid-cols-2 gap-4">
                                <InputField
                                    label="Allergy Name"
                                    type="text"
                                    name="allergyName"
                                    placeholder="e.g. Peanut Allergy"
                                    icon={<Droplet size={18} />}
                                    value={form.allergyName}
                                    onChange={handleChange as any}
                                />
                                <InputField
                                    label="Food Name"
                                    type="text"
                                    name="allergySpecific"
                                    placeholder="e.g. Peanuts"
                                    icon={<Droplet size={18} />}
                                    value={form.allergySpecific}
                                    onChange={handleChange as any}
                                />
                            </div>
                        )}

                        {form.allergyType === "medicine" && (
                            <div className="grid grid-cols-2 gap-4">
                                <InputField
                                    label="Allergy Name"
                                    type="text"
                                    name="allergyName"
                                    placeholder="e.g. Penicillin Allergy"
                                    icon={<Droplet size={18} />}
                                    value={form.allergyName}
                                    onChange={handleChange as any}
                                />
                                <InputField
                                    label="Medicine Name"
                                    type="text"
                                    name="allergySpecific"
                                    placeholder="e.g. Penicillin"
                                    icon={<Droplet size={18} />}
                                    value={form.allergySpecific}
                                    onChange={handleChange as any}
                                />
                            </div>
                        )}

                        {/* Photo Upload */}
                        <div className="flex flex-col gap-1 pb-4">
                            <label className="text-sm font-medium text-gray-700">Your Photo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)}
                                className="w-full px-4 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    </div>
                )}

                {role === "doctor" && (
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                        <h3 className="font-semibold text-blue-900">Hospital Details</h3>

                        <InputField
                            label="Hospital Address"
                            type="text"
                            name="hospitalAddress"
                            placeholder="Full address of the hospital"
                            icon={<FileText size={18} />}
                            value={form.hospitalAddress}
                            onChange={handleChange as any}
                        />

                        <InputField
                            label="Hospital Licence Number"
                            type="text"
                            name="hospitalLicenceNumber"
                            placeholder="e.g. LIC12345678"
                            icon={<FileText size={18} />}
                            value={form.hospitalLicenceNumber}
                            onChange={handleChange as any}
                        />

                        <InputField
                            label="Head Office Manager Details"
                            type="text"
                            name="managerDetails"
                            placeholder="Manager Name & Contact"
                            icon={<User size={18} />}
                            value={form.managerDetails}
                            onChange={handleChange as any}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <InputField
                                label="Emergency Number"
                                type="tel"
                                name="hospitalEmergencyNumber"
                                placeholder="Emergency line"
                                icon={<Phone size={18} />}
                                value={form.hospitalEmergencyNumber}
                                onChange={handleChange as any}
                            />
                            <InputField
                                label="WhatsApp Number"
                                type="tel"
                                name="hospitalWhatsappNumber"
                                placeholder="WhatsApp line"
                                icon={<Phone size={18} />}
                                value={form.hospitalWhatsappNumber}
                                onChange={handleChange as any}
                            />
                        </div>

                        <InputField
                            label="Doctor Details (General)"
                            type="text"
                            name="doctorDetails"
                            placeholder="General doctor details or specialties"
                            icon={<Users size={18} />}
                            value={form.doctorDetails}
                            onChange={handleChange as any}
                        />

                        <InputField
                            label="Available Doctors (Count/Names)"
                            type="text"
                            name="availableDoctors"
                            placeholder="e.g. 15 Doctors available"
                            icon={<Users size={18} />}
                            value={form.availableDoctors}
                            onChange={handleChange as any}
                        />
                        
                        {/* Photo Upload */}
                        <div className="flex flex-col gap-1 pb-4">
                            <label className="text-sm font-medium text-gray-700">Hospital Logo / Photo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)}
                                className="w-full px-4 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    </div>
                )}

                <Button type="submit" text={loading ? "Creating..." : "Create Account"} icon={<UserPlus size={18} />} />
            </form>

            <PageFooter type="register" />
        </AuthWrapper>
    );
};

export default Register;