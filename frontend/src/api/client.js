import axios from "axios";

// Combined deploy (frontend served BY the backend, same origin): leave
// VITE_API_URL unset at build time and calls go to "/api" automatically.
// Two-service deploy (separate frontend/backend Railway services): set
// VITE_API_URL to the backend's public URL, e.g. https://roskyro-api.up.railway.app/api
const baseURL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({ baseURL });

// Paths where a 401 is a normal, expected answer ("wrong password") rather
// than an expired session — those must NOT trigger a logout/redirect, or the
// login page would bounce the user away mid-attempt.
const AUTH_ENDPOINTS = ["/auth/login", "/auth/signup", "/admin/auth/login", "/hospital-console/auth/login"];

function loginPathFor(role) {
  if (role === "hospital_staff") return "/hospital/login";
  return "/login";
}

api.interceptors.request.use((config) => {
  // localStorage is unavailable during the build-time prerender and in
  // private-mode edge cases, so never let reading it throw.
  try {
    const token = localStorage.getItem("roskyro_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    /* no stored session — send the request unauthenticated */
  }
  return config;
});

// Sessions last 7 days. Without this, an expired token left every dashboard
// showing broken/empty panels forever: each request 401'd, nothing cleared the
// stale user out of localStorage, and the app never sent anyone back to log in.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    const isAuthCall = AUTH_ENDPOINTS.some((p) => url.includes(p));

    if (status === 401 && !isAuthCall) {
      let role = null;
      try {
        role = JSON.parse(localStorage.getItem("roskyro_user") || "null")?.role || null;
        localStorage.removeItem("roskyro_token");
        localStorage.removeItem("roskyro_user");
      } catch {
        /* nothing to clear */
      }
      const target = loginPathFor(role);
      if (typeof window !== "undefined" && window.location.pathname !== target) {
        window.location.assign(target);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
