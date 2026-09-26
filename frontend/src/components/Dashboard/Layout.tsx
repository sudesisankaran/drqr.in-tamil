import {
    Edit,
    Menu,
    X,
} from "lucide-react";
import React, { useState } from "react";
import Sidebar, { SidebarMobile } from "./Sidebar";
import { Button } from "antd";
import { NotificationPanel } from "../common";
import { useAuth } from "../../providers/AuthContext";
import { getUserImage } from "../../hooks/image";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user } = useAuth()

    return (
        <div className="h-screen bg-slate-50 flex overflow-hidden">
            <Sidebar />

            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="relative w-72 bg-blue-900 text-white h-full p-6 overflow-y-auto">
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-4 right-4 text-white"
                        >
                            <X size={28} />
                        </button>
                        <SidebarMobile onNavigate={() => setMobileOpen(false)} />
                    </div>
                </div>
            )}

            <main className="flex-1 overflow-y-auto lg:ml-64">

                <header className="sticky top-0 bg-white z-20 shadow-sm px-6 py-4 flex justify-between items-center">

                    <div className="flex items-center gap-3">
                        <button
                            className="lg:hidden text-blue-900"
                            onClick={() => setMobileOpen(true)}
                        >
                            <Menu size={28} />
                        </button>

                        <h1 className="text-xl font-bold text-blue-900 capitalize hidden lg:block">
                            {user?.role} Dashboard
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <img
                                src={getUserImage(user?.profile_image)}
                                alt="doctor"
                                className="w-10 h-10 rounded-full"
                            />
                            <p className="text-sm font-semibold text-gray-700">
                                {user?.fullName}
                            </p>
                        </div>
                        <NotificationPanel />
                    </div>
                </header>

                {children}
            </main>
        </div>
    );
};

export default Layout;

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;

    status?: string; // e.g. Normal / High
    statusColor?: string; // green / red / yellow
    info?: string; // normal range
    hint?: string; // suggestion
}

export const StatCard: React.FC<StatCardProps> = ({
    icon,
    label,
    value,
    status,
    statusColor = "gray",
    info,
    hint,
}) => (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition">

        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-900 rounded-xl flex items-center justify-center">
                {icon}
            </div>

            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <h3 className="text-lg font-bold text-gray-900">{value}</h3>
            </div>
        </div>

        {status && (
            <span
                className={`text-xs font-semibold px-2 py-1 rounded-full w-fit
        ${statusColor === "green"
                        ? "bg-green-100 text-green-700"
                        : statusColor === "red"
                            ? "bg-red-100 text-red-700"
                            : statusColor === "yellow"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                    }`}
            >
                {status}
            </span>
        )}

        {info && (
            <p className="text-xs text-gray-500">{info}</p>
        )}

        {hint && (
            <p className="text-xs text-blue-700 font-medium">
                💡 {hint}
            </p>
        )}

    </div>
);

export const Card = ({
    title,
    children,
    onEditClick
}: {
    title: string;
    children: React.ReactNode;
    onEditClick: () => void
}) => (
    <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 mb-4">{title}</h3>
            <Button type="dashed" size="small" icon={<Edit size={14} color="#99a1af " className="text-gray-400" />} onClick={onEditClick} />
        </div>
        <div className="space-y-3">{children}</div>
    </div>
);

export const ListItem = ({
    icon,
    text,
}: {
    icon: React.ReactNode;
    text: string;
}) => (
    <div className="flex items-center gap-3 text-sm text-gray-700">
        <span className="text-blue-900">{icon}</span>
        {text}
    </div>
);
