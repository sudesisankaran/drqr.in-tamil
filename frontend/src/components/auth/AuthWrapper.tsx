import Scroll from "../page-binder/Scroll";
import {
    HeartPulse,
    ShieldCheck,
    Activity,
    UserPlus,
} from "lucide-react";

import { Link } from "react-router-dom";
import type { ReactNode } from "react";

type AuthType = "login" | "register";

interface AuthWrapperProps {
    type: AuthType;
    children: ReactNode;
}

const AuthWrapper = ({ type, children }: AuthWrapperProps) => {
    return (
        <Scroll>
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="bg-white w-full max-w-5xl rounded-2xl shadow-lg border grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                    <div className="hidden md:flex flex-col justify-center bg-linear-to-br from-slate-50 to-blue-50 p-10">
                        <div className="relative mb-10">
                            <div className="absolute -inset-6 bg-blue-100 rounded-full blur-2xl opacity-50"></div>

                            <img
                                src={type === "login" ? "/login-health.svg" : "/register-health.svg"}
                                alt="DRQR Illustration"
                                className="relative z-10 w-full h-40 object-contain"
                            />
                        </div>
                        <h2 className="text-3xl font-bold text-blue-900 leading-snug">
                            {type === "login" ? (
                                <>
                                    Welcome Back to <br /> DRQR
                                </>
                            ) : (
                                <>
                                    Join DRQR <br /> Today
                                </>
                            )}
                        </h2>
                        <p className="text-gray-600 mt-4 text-sm leading-relaxed">
                            {type === "login"
                                ? "Login to securely access your medical records, appointments, prescriptions, and emergency health data anytime."
                                : "Create your account to manage medical records, doctor visits, prescriptions, and emergency QR access in one platform."}
                        </p>

                        <div className="mt-8 space-y-4 text-sm font-medium">
                            <FeatureItem icon={<ShieldCheck size={20} />} text="Secure & Private Access" />

                            <FeatureItem icon={<HeartPulse size={20} />} text="Instant Emergency Information" />

                            {type === "register" && (
                                <>
                                    <FeatureItem icon={<Activity size={20} />} text="QR Emergency Access" />
                                    <FeatureItem icon={<UserPlus size={20} />} text="Doctor & Patient Support" />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="p-8 sm:p-10 flex flex-col justify-center">
                        {children}
                    </div>
                </div>
            </div>
        </Scroll>
    );
};

export default AuthWrapper;

const FeatureItem = ({
    icon,
    text,
}: {
    icon: ReactNode;
    text: string;
}) => {
    return (
        <div className="flex items-center gap-3 text-blue-900">
            {icon}
            <span>{text}</span>
        </div>
    );
};

/* ================= PAGE HEADER ================= */

export const PageHeader = ({ type }: { type: AuthType }) => {
    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-900">
                {type === "login" ? "Login to Your Account" : "Create Account"}
            </h2>

            <p className="text-gray-600 text-sm mt-1">
                {type === "login"
                    ? "Access your DRQR dashboard"
                    : "Register to start using DRQR"}
            </p>
        </div>
    );
};

/* ================= PAGE FOOTER ================= */

export const PageFooter = ({ type }: { type: AuthType }) => {
    return (
        <p className="text-center text-sm text-gray-600 mt-6">
            {type === "login" ? (
                <>
                    Don’t have an account?{" "}
                    <Link to="/register" className="text-blue-900 font-semibold">
                        Register
                    </Link>
                </>
            ) : (
                <>
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-900 font-semibold">
                        Login
                    </Link>
                </>
            )}
        </p>
    );
};
