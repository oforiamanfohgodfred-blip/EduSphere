import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

const readStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

const buildUser = (data) => ({
  ...(data.profile || {}),
  role: data.role,
  organization_id: data.profile?.organization_id ?? data.organization_id ?? null,
  reference_id: data.profile?.id ?? data.reference_id ?? null,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    const handleExpiredSession = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener("auth:expired", handleExpiredSession);
    return () => window.removeEventListener("auth:expired", handleExpiredSession);
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const data = response.data;

    if (!data.token || !data.role) {
      throw new Error("Invalid authentication response.");
    }

    const authenticatedUser = buildUser(data);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(authenticatedUser));
    setToken(data.token);
    setUser(authenticatedUser);

    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
