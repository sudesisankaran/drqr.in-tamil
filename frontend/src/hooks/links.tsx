import {
    CalendarDays,
    ClipboardList,
    FileText,
    LayoutDashboard,
    MessageCircle,
    ScanLine,
    Settings,
    User,
    Users,
} from "lucide-react";

export const getMenuItems = (role: Role) => {
    const base = `/${role}`;

    if (role === "admin") {
        return [
            { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: `${base}/dashboard` },
            { icon: <Users size={20} />, label: "Doctors", path: `${base}/doctors` },
            { icon: <Users size={20} />, label: "Patients", path: `${base}/patients` },
            { icon: <ScanLine size={20} />, label: "Scan QR", path: "/scan" },
            { icon: <Settings size={20} />, label: "Settings", path: `${base}/settings` },
        ];
    }

    if (role === "doctor") {
        return [
            { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: `${base}/dashboard` },
            { icon: <Users size={20} />, label: "Patients", path: `${base}/patients` },
            { icon: <CalendarDays size={20} />, label: "Appointments", path: `${base}/appointments` },
            { icon: <FileText size={20} />, label: "Reports", path: `${base}/reports` },
            { icon: <ClipboardList size={20} />, label: "Add Visit Record", path: `${base}/add-visit` },
            { icon: <ScanLine size={20} />, label: "Scan QR", path: "/scan" },
            { icon: <MessageCircle size={20} />, label: "Messages", path: `${base}/messages` },
            { icon: <Settings size={20} />, label: "Settings", path: `${base}/settings` },
        ];
    }

    return [
        { icon: <User size={20} />, label: "My Profile", path: `${base}/profile` },
        { icon: <CalendarDays size={20} />, label: "My Appointments", path: `${base}/appointments` },
        { icon: <ClipboardList size={20} />, label: "My Reports", path: `${base}/reports` },
        { icon: <ClipboardList size={20} />, label: "Add Visit Record", path: `${base}/add-visit` },
        { icon: <FileText size={20} />, label: "Add Treatment", path: `${base}/add-treatment` },
        { icon: <ScanLine size={20} />, label: "Scan QR", path: "/scan" },
        { icon: <MessageCircle size={20} />, label: "Messages", path: `${base}/messages` },
        { icon: <Settings size={20} />, label: "Settings", path: `${base}/settings` },
    ];
};
