import { useState } from "react";
import { Mail, Lock, LogIn } from "lucide-react";
import AuthWrapper, { PageFooter, PageHeader } from "./AuthWrapper";
import InputField from "../common/InputField";
import Button from "../common/Button";
import _env from "../../utils/_env";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthContext";
import { supabase } from "../../utils/supabase";

const Login = () => {
    const navigate = useNavigate();
    const {login}=useAuth()

    const [role, setRole] = useState<"patient" | "doctor">("patient");

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.email.trim()) {
            return alert("Email is required");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            return alert("Enter a valid email");
        }

        if (!form.password) {
            return alert("Password is required");
        }

        setLoading(true);

        try {
            // 1. Sign in with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: form.email,
                password: form.password,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("Login failed");

            // 2. Fetch the custom user profile from public.users table
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("*")
                .eq("id", authData.user.id)
                .single();

            if (userError || !userData) {
                // If it fails, they might be an old user without an auth.users mapping.
                // We'll throw an error and ask them to re-register for the new system.
                throw new Error("User profile not found. Please re-register if you are from the old system.");
            }
            
            // Check if the user is logging into the correct portal
            if (role === "patient" && userData.role !== "patient") {
                throw new Error("Invalid account type for Patient Portal");
            }
            if (role === "doctor" && userData.role !== "doctor" && userData.role !== "admin") {
                throw new Error("Invalid account type for Hospital Portal");
            }

            const token = authData.session?.access_token || "dummy-token";
            
            // Format user object for context
            const userContextObj = {
                _id: userData.id,
                id: userData.id,
                fullName: userData.full_name,
                email: userData.email,
                role: userData.role,
                profile_image: userData.profile_image,
                patientId: userData.patient_id
            };

            sessionStorage.setItem("token", token);
            sessionStorage.setItem("user", JSON.stringify(userContextObj));
            login(token, userContextObj);

            if (userData.role === "admin") navigate("/admin/dashboard");
            else if (userData.role === "doctor") navigate("/doctor/dashboard");
            else navigate("/patient/dashboard");

        } catch (error: any) {
            console.error("Login Error:", error);
            alert(error.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthWrapper type="login">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-blue-900">
                    {role === "doctor" ? "Hospital" : "Patient"} Login
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                    Access your {role === "doctor" ? "Hospital/Doctor" : "Patient"} dashboard
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

            <form className="space-y-5" onSubmit={handleLogin}>
                <InputField
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    icon={<Mail size={18} />}
                    value={form.email}
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                    }
                />

                <InputField
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    icon={<Lock size={18} />}
                    value={form.password}
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                />

                <Button
                    type="submit"
                    text={loading ? "Logging in..." : "Login"}
                    icon={<LogIn size={18} />}
                />
            </form>

            <PageFooter type="login" />
        </AuthWrapper>
    );
};

export default Login;