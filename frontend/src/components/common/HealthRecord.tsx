import { useEffect, useState } from "react";
import { StatCard } from "../Dashboard/Layout";
import { Activity, Droplet, Ruler, Weight } from "lucide-react";
import { Button, Modal, Input, notification } from "antd";
import { useAuth } from "../../providers/AuthContext";
import _env from "../../utils/_env";

const HealthRecord = () => {
    const { token } = useAuth();

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const [form, setForm] = useState({
        weight: "",
        height: "",
        systolic: "",
        diastolic: "",
    });

    const format = (val: any, suffix = "") =>
        val ? `${val}${suffix}` : "N.A";

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${_env.SERVER_URL}/health`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            setData(data);

        } catch {
            notification.error({ message: "Failed to load health data" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    const handleOpen = () => {
        setForm({
            weight: data?.weight || "",
            height: data?.height || "",
            systolic: data?.bloodPressure?.systolic || "",
            diastolic: data?.bloodPressure?.diastolic || "",
        });
        setOpen(true);
    };

    const updateHealth = async () => {
        try {
            const res = await fetch(`${_env.SERVER_URL}/health`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    weight: Number(form.weight),
                    height: Number(form.height),
                    bloodPressure: {
                        systolic: Number(form.systolic),
                        diastolic: Number(form.diastolic),
                    },
                }),
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.message);

            notification.success({ message: "Health updated" });

            setOpen(false);
            fetchData();

        } catch (err: any) {
            notification.error({ message: err.message });
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Health Records</h2>

                <Button type="primary" onClick={handleOpen}>
                    Edit
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Activity />}
                    label="BMI"
                    value={format(data?.bmi)}
                    status={
                        data?.bmi
                            ? data.bmi < 18.5
                                ? "Underweight"
                                : data.bmi <= 24.9
                                    ? "Normal"
                                    : "Overweight"
                            : "N.A"
                    }
                    statusColor={
                        data?.bmi <= 24.9 ? "green" : "yellow"
                    }
                    info="Normal: 18.5 – 24.9"
                    hint="Maintain balanced diet & exercise"
                />

                <StatCard
                    icon={<Droplet />}
                    label="Blood Pressure"
                    value={
                        data?.bloodPressure
                            ? `${data.bloodPressure.systolic}/${data.bloodPressure.diastolic}`
                            : "N.A"
                    }
                    status={
                        data?.bloodPressure?.systolic < 120
                            ? "Normal"
                            : "High"
                    }
                    statusColor={
                        data?.bloodPressure?.systolic < 120 ? "green" : "red"
                    }
                    info="Normal: 120 / 80 mmHg"
                    hint="Reduce salt intake if high"
                />

                <StatCard
                    icon={<Weight />}
                    label="Weight"
                    value={format(data?.weight, " kg")}
                    info="Ideal depends on BMI"
                    hint="Track weekly for consistency"
                />

                <StatCard
                    icon={<Ruler />}
                    label="Height"
                    value={format(data?.height, " cm")}
                    info="Used for BMI calculation"
                />
            </div>

            <Modal
                title="Update Health Record"
                open={open}
                onCancel={() => setOpen(false)}
                onOk={updateHealth}
                confirmLoading={loading}
            >
                <div className="flex flex-col gap-4">

                    {/* 🏋️ Weight */}
                    <div>
                        <label className="text-sm font-semibold">Weight (kg)</label>
                        <Input
                            placeholder="e.g. 70"
                            value={form.weight}
                            onChange={(e) =>
                                setForm({ ...form, weight: e.target.value })
                            }
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Normal adult range: 40–120 kg
                        </p>
                    </div>

                    {/* 📏 Height */}
                    <div>
                        <label className="text-sm font-semibold">Height (cm)</label>
                        <Input
                            placeholder="e.g. 170"
                            value={form.height}
                            onChange={(e) =>
                                setForm({ ...form, height: e.target.value })
                            }
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Enter height in centimeters
                        </p>
                    </div>

                    {/* 🧠 BMI INFO */}
                    {form.weight && form.height && (
                        <div className="bg-blue-50 p-3 rounded-xl text-sm">
                            <p className="font-semibold text-blue-900">BMI Preview</p>

                            {(() => {
                                const h = Number(form.height) / 100;
                                const bmi = (Number(form.weight) / (h * h)).toFixed(2);

                                let status = "Normal";
                                if (+bmi < 18.5) status = "Underweight";
                                else if (+bmi > 25) status = "Overweight";

                                return (
                                    <p>
                                        BMI: <strong>{bmi}</strong> ({status})
                                    </p>
                                );
                            })()}

                            <p className="text-xs text-gray-500 mt-1">
                                Normal BMI: 18.5 – 24.9
                            </p>
                        </div>
                    )}

                    {/* 💓 Blood Pressure */}
                    <div className="bg-red-50 p-3 rounded-xl">
                        <p className="font-semibold text-red-900 mb-2">
                            Blood Pressure (mmHg)
                        </p>

                        <div className="flex gap-2">
                            <Input
                                placeholder="Systolic (e.g. 120)"
                                value={form.systolic}
                                onChange={(e) =>
                                    setForm({ ...form, systolic: e.target.value })
                                }
                            />

                            <Input
                                placeholder="Diastolic (e.g. 80)"
                                value={form.diastolic}
                                onChange={(e) =>
                                    setForm({ ...form, diastolic: e.target.value })
                                }
                            />
                        </div>

                        <p className="text-xs text-gray-600 mt-2">
                            Normal BP: 120 / 80 mmHg
                        </p>
                    </div>

                </div>
            </Modal>
        </>
    );
};

export default HealthRecord;