import React, { createContext, useContext, useState, useEffect } from "react";
import api from "./api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/api/auth/me")
        .then((res) => {
          setUser(res.data);
          if (res.data.preferred_language) {
            setLang(res.data.preferred_language);
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
    if (userData.preferred_language) {
      setLang(userData.preferred_language);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AppContext.Provider value={{ user, loading, lang, setLang, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
