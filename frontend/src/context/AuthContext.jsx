import { createContext, useContext, useState } from "react";
import api from "../services/api";


// Create Context
const AuthContext = createContext();


// Provider
export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const [token, setToken] = useState(
    localStorage.getItem("token") || null
  );


  // Login Function
  const login = async (email, password) => {

    const response = await api.post(
      "/auth/login",
      {
        email,
        password,
      }
    );


    const data = response.data;

    console.log("LOGIN RESPONSE:", data);

    localStorage.setItem(
      "token",
      data.token
    );


    localStorage.setItem(
      "user",
      JSON.stringify(data)
    );


    setToken(data.token);

    setUser(data);


    return data;

  };


  // Logout Function
  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");


    setToken(null);

    setUser(null);

  };


  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );

};


// Custom Hook
export const useAuth = () => {

  return useContext(AuthContext);

};