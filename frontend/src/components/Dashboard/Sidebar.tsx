
import { Link, useNavigate } from "react-router-dom";
import { getMenuItems } from "../../hooks/links";
import { useAuth } from "../../providers/AuthContext";

const Sidebar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate("/login");
    };
    const role = user?.role as Role
    const menuItems = getMenuItems(role);

    return (
        <aside className="hidden lg:flex flex-col w-64 bg-blue-900 text-white py-8 fixed left-0 top-0 h-full">
            <SidebarHeader role={role} />

            <nav className="flex flex-col flex-1  overflow-y-auto gap-3 text-blue-100 font-medium mt-8">
                {menuItems.map((item, index) => (
                    <SidebarItem
                        key={index}
                        icon={item.icon}
                        label={item.label}
                        path={item.path}
                    />
                ))}
            </nav>
            <button
                onClick={handleLogout}
                className="bg-red-500 text-white mx-8 px-4 py-2 rounded hover:bg-red-600 transition"
            >
                Logout
            </button>
        </aside>
    );
};

export default Sidebar

export const SidebarMobile = ({ onNavigate }: { onNavigate?: () => void }) => {
    const { user } = useAuth();

    const role = user?.role as Role
    const menuItems = getMenuItems(role);

    return (
        <>
            <SidebarHeader role={role} />
            <nav className="flex flex-col gap-3 text-blue-100 font-medium mt-10">
                {menuItems.map((item, index) => (
                    <SidebarItem
                        key={index}
                        icon={item.icon}
                        label={item.label}
                        path={item.path}
                        onClick={onNavigate}
                    />
                ))}
            </nav>
        </>
    );
};

const SidebarHeader = ({ role }: { role: Role }) => (
    <div className="flex items-center gap-3 px-8">
        <img src="/logo.jpg" alt="DRQR Logo" className="w-12 h-12 rounded-2xl object-cover bg-white" />
        <div>
            <h2 className="text-lg font-bold leading-tight">DRQR</h2>
            <p className="text-sm text-blue-200 capitalize">
                {role} Panel
            </p>
        </div>
    </div>
);

const SidebarItem = ({
    icon,
    label,
    path,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    path: string;
    onClick?: () => void;
}) => (
    <Link
        to={path}
        onClick={onClick}
        className="flex items-center gap-3 px-8 py-3 rounded-xl cursor-pointer hover:bg-blue-800 transition"
    >
        <span className="text-blue-200">{icon}</span>
        <span className="text-sm font-semibold">{label}</span>
    </Link>
);
