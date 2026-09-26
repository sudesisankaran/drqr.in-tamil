import { useEffect, useState } from "react";
import { Input, List, Avatar, Card, Button, notification } from "antd";
import { Search } from "lucide-react";
import _env from "../../utils/_env";
import { useAuth } from "../../providers/AuthContext";
import { getUserImage } from "../../hooks/image";
import { useNavigate } from "react-router-dom";

type Patient = {
  _id: string;
  fullName: string;
  age?: number;
  gender?: string;
  patientId?: string;
  profile_image?: string;
};

const DoctorPatient = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!token) return;

      try {
        const res = await fetch(`${_env.SERVER_URL}/user/patients`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to load patients");

        setPatients(data);
      } catch (err) {
        notification.error({
          message: err instanceof Error ? err.message : "Failed to load patients",
        });
      }
    };

    fetchPatients();
  }, [token]);

  const filtered = patients.filter((patient) =>
    patient.fullName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ borderRadius: 8 }}>
        <Input
          placeholder="Search patients..."
          prefix={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 20 }}
        />

        <List
          itemLayout="horizontal"
          dataSource={filtered}
          locale={{ emptyText: "No patients found" }}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button key="view" type="link" onClick={() => navigate(`/doctor/profiles/${item._id}`)}>
                  Open Profile
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar src={getUserImage(item.profile_image)} size={48}>{item.fullName[0]}</Avatar>}
                title={<span style={{ fontWeight: 600 }}>{item.fullName}</span>}
                description={`ID: ${item.patientId || "N.A"} | ${item.age || "N.A"} yrs | ${item.gender || "N.A"}`}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default DoctorPatient;
