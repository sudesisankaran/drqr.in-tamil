import { createContext, useContext, useEffect, useState } from "react";
import _env from "../utils/_env";
import { useNavigate } from "react-router-dom";

type User = {
  _id: string;
  fullName: string;
  email: string;
  password: string;
  role: "admin" | "doctor" | "patient";
  profile_image?: string;
  gender?: "male" | "female" | "other" | string;
  dateOfBirth?: Date;
  age?: number | string | undefined;
  phone?: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
  patientId?: string;
  notifications: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  updateUserData: (user: User) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const logout = () => {
    setToken(null);
    setUser(null);

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = sessionStorage.getItem("token");
      const storedUser = sessionStorage.getItem("user");

      if (!storedToken) {
        logout();
        return;
      }

      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }

      try {
        const res = await fetch(`${_env.SERVER_URL}/user/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (!res.ok) {
          throw new Error("Invalid token");
        }

        const data = await res.json();

        setToken(storedToken);
        setUser(data);
        sessionStorage.setItem("user", JSON.stringify(data));
      } catch {
        logout();
      }
    };

    initAuth();
  }, []);

  const login = (token: string, user: User) => {
    setToken(token);
    setUser(user);

    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(user));
  };

  const updateUserData = (user: User) => {
    setUser(user);
    sessionStorage.setItem("user", JSON.stringify(user));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
