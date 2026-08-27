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

    // Store the complete server response because the current API returns
    // role/profile alongside the token and other session metadata.
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setToken(data.token);
    setUser(data);

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
