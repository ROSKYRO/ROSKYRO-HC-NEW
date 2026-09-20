import { createContext, useContext, useState, useCallback } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // A corrupted "roskyro_user" value (or localStorage being unavailable in
    // private mode / during the build-time prerender) used to throw straight
    // out of this initializer, which crashes React before anything renders —
    // the user got a blank white page with no way to recover.
    try {
      const raw = localStorage.getItem("roskyro_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      try {
        localStorage.removeItem("roskyro_user");
        localStorage.removeItem("roskyro_token");
      } catch {
        /* nothing we can do */
      }
      return null;
    }
  });

  const login = useCallback(async (phone, password) => {
    // Customer login only — the backend rejects admin/support accounts here.
    const { data } = await api.post("/auth/login", { phone, password });
    persist(data);
    return data;
  }, []);

  const adminLogin = useCallback(async (phone, password) => {
    // Separate endpoint, separate rate limit, short-lived token. Never call
    // this from the public-facing Login page.
    const { data } = await api.post("/admin/auth/login", { phone, password });
    persist(data);
    return data;
  }, []);

  const hospitalLogin = useCallback(async (phone, password) => {
    const { data } = await api.post("/hospital-console/auth/login", { phone, password });
    persist(data);
    return data;
  }, []);

  const signup = useCallback(async (payload) => {
    const { data } = await api.post("/auth/signup", payload);
    persist(data);
    return data;
  }, []);

  function persist(data) {
    const u = { user_id: data.user_id, full_name: data.full_name, role: data.role };
    // Safari private mode throws on setItem once the quota is hit. Keeping the
    // in-memory session alive means the login still works for this tab instead
    // of failing outright after the server already accepted the credentials.
    try {
      localStorage.setItem("roskyro_token", data.access_token);
      localStorage.setItem("roskyro_user", JSON.stringify(u));
    } catch {
      /* session survives in memory for this tab only */
    }
    setUser(u);
  }

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("roskyro_token");
      localStorage.removeItem("roskyro_user");
    } catch {
      /* nothing stored */
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, adminLogin, hospitalLogin, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
