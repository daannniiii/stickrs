import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);
const SESSION_KEY = "stickr_admin_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(SESSION_KEY) || "");
  const isAdmin = Boolean(token);

  const login = useCallback(async (password) => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success || !data.token) {
      throw new Error(data.error || "Login failed");
    }
    sessionStorage.setItem(SESSION_KEY, data.token);
    setToken(data.token);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setToken("");
  }, []);

  return (
    <AuthContext.Provider value={{ isAdmin, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
