import { useEffect, useState } from "react";
import {
    Table,
    Button,
    Modal,
    Input,
    Popconfirm,
    notification,
    Tag,
} from "antd";
import _env from "../../utils/_env";
import { useAuth } from "../../providers/AuthContext";
import { useNavigate } from "react-router-dom";


const AdminUser = ({ type }: { type: "doctor" | "patient" }) => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [openModal, setOpenModal] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "",
        role: type,
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${_env.SERVER_URL}/admin/users-role`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    type
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            setUsers(data);
        } catch (err: any) {
            notification.error({ message: err.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchUsers();
    }, [token, type]);

    const handleAdd = () => {
        setEditingUser(null);
        setForm({ fullName: "", email: "", password: "", role: type });
        setOpenModal(true);
    };

    const handleEdit = (user: any) => {
        setEditingUser(user);
        setForm({
            fullName: user.fullName,
            email: user.email,
            password: "",
            role: user.role,
        });
        setOpenModal(true);
    };

    const validateForm = () => {
        if (!form.fullName.trim()) return "Full name required";
        if (!form.email.trim()) return "Email required";

        if (!editingUser && !form.password) return "Password required";

        return null;
    };

    const handleSave = async () => {
        const error = validateForm();
        if (error) {
            return notification.error({ message: error });
        }

        setSaving(true);

        try {
            const url = editingUser
                ? `${_env.SERVER_URL}/admin/users/${editingUser._id}`
                : `${_env.SERVER_URL}/admin/users`;

            const method = editingUser ? "PUT" : "POST";

            const payload: any = {
                fullName: form.fullName,
                email: form.email,
                role: form.role,
            };

            if (!editingUser) payload.password = form.password;

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            notification.success({
                message: editingUser ? "User Updated" : "User Created",
            });

            setOpenModal(false);
            fetchUsers();

        } catch (error: any) {
            notification.error({ message: error.message });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`${_env.SERVER_URL}/admin/users/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Delete failed");

            notification.success({ message: "User deleted" });
            fetchUsers();

        } catch (err: any) {
            notification.error({ message: err.message });
        }
    };

    const getRoleTag = (role: string) => {
        if (role === "admin") return <Tag color="red">Admin</Tag>;
        if (role === "doctor") return <Tag color="blue">Doctor</Tag>;
        return <Tag color="green">Patient</Tag>;
    };

    const columns = [
        {
            title: "Name",
            dataIndex: "fullName",
        },
        {
            title: "Email",
            dataIndex: "email",
        },
        {
            title: "Role",
            render: (_: any, record: any) => getRoleTag(record.role),
        },
        {
            title: "Action",
            render: (_: any, record: any) => (
                <div className="flex gap-2">
                    <Button onClick={() => navigate(`/admin/profiles/${record._id}`)}>View</Button>
                    <Button onClick={() => handleEdit(record)}>Edit</Button>

                    <Popconfirm
                        title="Delete user?"
                        onConfirm={() => handleDelete(record._id)}
                    >
                        <Button danger>Delete</Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div className="p-4 bg-white rounded-xl shadow">

            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">User Management</h2>

                <Button type="primary" onClick={handleAdd}>
                    + Add User
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={users}
                loading={loading}
                rowKey="_id"
            />

            <Modal
                centered
                title={editingUser ? "Edit User" : "Add User"}
                open={openModal}
                onCancel={() => setOpenModal(false)}
                onOk={handleSave}
                confirmLoading={saving}
            >
                <div className="flex flex-col gap-3">

                    <Input
                        placeholder="Full Name"
                        value={form.fullName}
                        onChange={(e) =>
                            setForm({ ...form, fullName: e.target.value })
                        }
                    />

                    <Input
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                    />

                    {!editingUser && (
                        <Input.Password
                            placeholder="Password"
                            value={form.password}
                            onChange={(e) =>
                                setForm({ ...form, password: e.target.value })
                            }
                        />
                    )}

                </div>
            </Modal>
        </div>
    );
};

export default AdminUser;
