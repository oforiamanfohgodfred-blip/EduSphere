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

    if (!data.token || !data.user) {
      throw new Error("Invalid authentication response.");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);

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
