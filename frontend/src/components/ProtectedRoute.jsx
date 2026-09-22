import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ADMIN_LOGIN_PATH } from "../config";

export function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function RequireAdmin({ children }) {
  const { user } = useAuth();
  // Admin/support have no account on the public /login page (that's the
  // customer login, a different backend endpoint entirely) — sending them
  // there on an expired/missing session is a dead end. Send them back to
  // the actual (private, unlinked) admin login path instead.
  if (!user) return <Navigate to={ADMIN_LOGIN_PATH} replace />;
  if (user.role !== "admin" && user.role !== "support") return <Navigate to="/" replace />;
  return children;
}

export function RequireHospitalStaff({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/hospital/login" replace />;
  if (user.role !== "hospital_staff") return <Navigate to="/hospital/login" replace />;
  return children;
}
