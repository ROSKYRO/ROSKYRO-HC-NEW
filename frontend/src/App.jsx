import { Routes, Route, Navigate, useParams } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BottomNav from "./components/BottomNav";
import { RequireAuth, RequireAdmin, RequireHospitalStaff } from "./components/ProtectedRoute";
import { ADMIN_LOGIN_PATH } from "./config";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BecomePartner from "./pages/BecomePartner";
import ForHospitals from "./pages/ForHospitals";
import ForPatients from "./pages/ForPatients";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import MembershipSignup from "./pages/MembershipSignup";
import MembershipInfo from "./pages/MembershipInfo";
import MemberDashboard from "./pages/MemberDashboard";
import PriorityAccess from "./pages/PriorityAccess";
import PriorityAccessProfile from "./pages/PriorityAccessProfile";
import PriorityAccessApply from "./pages/PriorityAccessApply";
import OfficerDischarge from "./pages/OfficerDischarge";
import OfficerPortal from "./pages/OfficerPortal";
import DoctorPortal from "./pages/DoctorPortal";
import DoctorConciergePlan from "./pages/DoctorConciergePlan";
import HospitalLogin from "./pages/HospitalLogin";
import HospitalDashboard from "./pages/HospitalDashboard";
import AdminHospitalProgram from "./pages/AdminHospitalProgram";
import AdminNotifications from "./pages/AdminNotifications";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import FeedbackPage from "./pages/FeedbackPage";

function RedirectToPriorityAccessProfile() {
  const { id } = useParams();
  return <Navigate to={`/membership/priority-access/${id}`} replace />;
}

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/become-a-partner" element={<BecomePartner />} />
          <Route path="/join" element={<BecomePartner />} />
          <Route path="/for-hospitals" element={<ForHospitals />} />
          <Route path="/for-patients" element={<ForPatients />} />
          <Route path="/membership/join" element={<MembershipSignup />} />
          <Route path="/membership/info" element={<MembershipInfo />} />
          {/* Standalone marketing page for the Doctor + Healthcare Concierge
              plan — previously just a card among the other three on the
              homepage teaser. /membership/doctor-concierge is the canonical
              link (kept under /membership like info/priority-access);
              /doctor-concierge is a short redirect for anything already
              pointing at the old style of link. */}
          <Route path="/membership/doctor-concierge" element={<DoctorConciergePlan />} />
          <Route path="/doctor-concierge" element={<Navigate to="/membership/doctor-concierge" replace />} />
          <Route path="/member" element={<RequireAuth><MemberDashboard /></RequireAuth>} />
          {/* Priority Access (Doctors & Clinics) is a membership benefit, not a
              standalone service — it lives under /membership/priority-access. */}
          <Route path="/membership/priority-access" element={<PriorityAccess />} />
          <Route path="/membership/priority-access/apply" element={<PriorityAccessApply />} />
          <Route path="/membership/priority-access/:id" element={<PriorityAccessProfile />} />
          {/* Old standalone links keep working, redirected to their new home under Membership */}
          <Route path="/priority-access" element={<Navigate to="/membership/priority-access" replace />} />
          <Route path="/priority-access/apply" element={<Navigate to="/membership/priority-access/apply" replace />} />
          <Route path="/priority-access/:id" element={<RedirectToPriorityAccessProfile />} />
          <Route path={ADMIN_LOGIN_PATH} element={<AdminLogin />} />
          <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          <Route path="/officer/discharge/:token" element={<OfficerDischarge />} />
          <Route path="/officer/portal/:token" element={<OfficerPortal />} />
          <Route path="/doctor/portal/:token" element={<DoctorPortal />} />
          <Route path="/hospital/login" element={<HospitalLogin />} />
          <Route path="/hospital/dashboard" element={<RequireHospitalStaff><HospitalDashboard /></RequireHospitalStaff>} />
          <Route path="/admin/hospitals" element={<RequireAdmin><AdminHospitalProgram /></RequireAdmin>} />
          <Route path="/admin/notifications" element={<RequireAdmin><AdminNotifications /></RequireAdmin>} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/complaints" element={<FeedbackPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          {/* Old links to removed pages (/services, /blog, /my-bookings, /how-it-works, …) land on the home page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}

export default function App() {
  return <AppLayout />;
}
