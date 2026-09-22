import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Building2, 
  HeartHandshake, 
  UserPlus, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Users, 
  HeartPulse, 
  FileText, 
  ChevronRight,
  Sparkles,
  MessageSquare,
  Building
} from "lucide-react";
import { HOSPITAL_WA_LINK, SUPPORT_PHONE_DISPLAY, BOOK_WA_LINK } from "../../config";
import api from "../../api/client";

export default function ThreePillarsSection() {
  const [activeTab, setActiveTab] = useState("hospitals");
  const [applyForm, setApplyForm] = useState({ full_name: "", phone: "", email: "" });
  const [applyStatus, setApplyStatus] = useState(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState("");

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyError("");
    setApplyLoading(true);
    try {
      await api.post("/agents/apply", applyForm);
      setApplyStatus("success");
    } catch (err) {
      setApplyError(err.response?.data?.detail || "Could not submit application. Please call our helpline.");
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <section id="three-pillars" className="py-16 md:py-24 bg-slate-50/70 border-y border-ink/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet/10 border border-violet/15 text-xs font-bold text-violet uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Three Pillars of ROSKYRO</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-ink tracking-tight mb-5">
            Designed for Hospitals. Built for Families. Powered by Verified Officers.
          </h2>
          <p className="text-ink-muted text-base sm:text-lg leading-relaxed">
            Everything on the ROSKYRO platform is organized around these three essential pillars. Select your category below to explore tailored services and dedicated workflows.
          </p>
        </div>

        {/* Interactive Pillar Deep-Dive Container */}
        <div className="bg-white rounded-3xl border border-ink/10 shadow-xl overflow-hidden mb-16">
          
          {/* Tab Bar */}
          <div className="border-b border-ink/10 bg-slate-50/80 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/40 mr-2 hidden sm:inline">
              Explore Pillar Details:
            </span>
            <button
              onClick={() => setActiveTab("hospitals")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "hospitals"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-ink/70 hover:text-ink hover:bg-white"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>1. For Hospitals</span>
            </button>
            <button
              onClick={() => setActiveTab("patients")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "patients"
                  ? "bg-violet text-white shadow-sm"
                  : "text-ink/70 hover:text-ink hover:bg-white"
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>2. For Patients &amp; Families</span>
            </button>
            <button
              onClick={() => setActiveTab("officers")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "officers"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-ink/70 hover:text-ink hover:bg-white"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>3. Join ROSKYRO</span>
            </button>
          </div>

          {/* Tab 1: For Hospitals Deep Dive */}
          {activeTab === "hospitals" && (
            <div className="p-6 sm:p-10 lg:p-12 animate-fadeIn">
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                <div className="lg:col-span-7">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                    Hospital Partnership Architecture
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-2 mb-4">
                    How the Patient Concierge Program Works for Your Hospital
                  </h3>
                  <p className="text-ink-muted text-sm sm:text-base leading-relaxed mb-6">
                    Hospitals partner with ROSKYRO to provide an end-to-end human touch for every admitted patient. Your medical team remains 100% focused on clinical excellence, while ROSKYRO officers handle the logistics, inquiries, and discharge workflows.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                      <div className="font-bold text-ink text-sm mb-1">No New Workflows</div>
                      <div className="text-xs text-ink/70 leading-relaxed">
                        Patients are admitted via your existing desk. You simply flag enrolled patients in the ROSKYRO Console.
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                      <div className="font-bold text-ink text-sm mb-1">Zero Staff Overhead</div>
                      <div className="text-xs text-ink/70 leading-relaxed">
                        ROSKYRO employs, background-checks, and pays all officers directly. No added hospital HR or payroll cost.
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <Link
                      to="/for-hospitals"
                      className="px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md shadow-indigo-200"
                    >
                      <span>Read Full Hospital Guide</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/hospital/login"
                      className="px-5 py-3 rounded-full border border-ink/20 text-ink font-semibold text-sm hover:bg-slate-100 transition-all flex items-center gap-1.5"
                    >
                      <Building className="w-4 h-4 text-indigo-600" />
                      <span>Hospital Console Login</span>
                    </Link>
                  </div>
                </div>

                {/* Right Visual Card for Hospitals */}
                <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 to-ink text-white rounded-2xl p-6 sm:p-7 shadow-xl">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Hospital Console Preview</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">Live Active</span>
                  </div>
                  <div className="space-y-3 text-xs mb-6">
                    <div className="p-3 rounded-xl bg-white/10 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">Bed #204 — Patient Sharma</div>
                        <div className="text-white/60 text-[11px]">Officer: Rahul Verma (Assigned)</div>
                      </div>
                      <span className="text-[10px] bg-indigo-400/20 text-indigo-200 px-2 py-1 rounded-md">Investigations</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/10 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">Bed #118 — Patient Patel</div>
                        <div className="text-white/60 text-[11px]">Officer: Priya Singh (Assigned)</div>
                      </div>
                      <span className="text-[10px] bg-emerald-400/20 text-emerald-200 px-2 py-1 rounded-md">Discharge Ready</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed mb-4">
                    Officers log milestones in real-time. Hospital staff can view discharge clearance, family authorizations, and patient sentiment instantly.
                  </p>
                  <a
                    href={HOSPITAL_WA_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full text-center py-2.5 rounded-xl bg-white text-ink text-xs font-bold hover:bg-indigo-50 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    WhatsApp Hospital Partnership Lead: {SUPPORT_PHONE_DISPLAY}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: For Patients Deep Dive */}
          {activeTab === "patients" && (
            <div className="p-6 sm:p-10 lg:p-12 animate-fadeIn">
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                <div className="lg:col-span-7">
                  <span className="text-xs font-bold uppercase tracking-widest text-violet">
                    Patient &amp; Family Care Experience
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-2 mb-4">
                    A Dedicated Human Guide Through Every Step of Your Stay
                  </h3>
                  <p className="text-ink-muted text-sm sm:text-base leading-relaxed mb-6">
                    When you or your parents are at the hospital, the confusion of tests, admission counters, and bills causes maximum stress. ROSKYRO assigns one verified officer who stays with you through it all.
                  </p>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-violet/5 border border-violet/10 text-xs text-ink/80">
                      <Clock className="w-4 h-4 text-violet shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-ink">30-Minute Bedside Greeting:</strong> Your officer meets you right after admission, introduces themselves, and takes charge of non-medical errands.
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-violet/5 border border-violet/10 text-xs text-ink/80">
                      <HeartPulse className="w-4 h-4 text-violet shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-ink">Clear Boundaries:</strong> Clinical treatment is 100% handled by your doctors. Your officer manages logistics, forms, and updates so doctors can focus on you.
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-violet/5 border border-violet/10 text-xs text-ink/80">
                      <Users className="w-4 h-4 text-violet shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-ink">Annual Membership:</strong> Doctor + Healthcare Concierge — a dedicated concierge doctor, unlimited coordination, and ambulance covers, under one plan.
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <Link
                      to="/for-patients"
                      className="px-6 py-3 rounded-full bg-brand-gradient text-white font-semibold text-sm hover:opacity-95 transition-all flex items-center gap-2 shadow-md shadow-violet/20"
                    >
                      <span>Explore Patient Journey &amp; Plans</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                      href={BOOK_WA_LINK}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-3 rounded-full border border-emerald-500/40 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-semibold text-sm transition-all flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>Request Officer on WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Right Visual Card for Patients */}
                <div className="lg:col-span-5 bg-gradient-to-br from-violet via-purple-900 to-ink text-white rounded-2xl p-6 sm:p-7 shadow-xl">
                  <div className="text-xs font-bold text-flare uppercase tracking-wider mb-2">
                    Annual Concierge Membership
                  </div>
                  <h4 className="font-display text-2xl font-bold mb-2">Doctor + Healthcare Concierge</h4>
                  <p className="text-white/70 text-xs mb-5">
                    Year-round peace of mind for parents and seniors in Ambikapur &amp; Chhattisgarh.
                  </p>
                  <div className="space-y-2 text-xs text-white/90 mb-6 bg-white/10 p-4 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-flare shrink-0" />
                      <span>Dedicated Concierge Doctor</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-flare shrink-0" />
                      <span>Unlimited Doctor Consultations (fair-use)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-flare shrink-0" />
                      <span>Unlimited Concierge Coordination</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-flare shrink-0" />
                      <span>4 Ambulance Dispatches Covered</span>
                    </div>
                  </div>
                  <Link
                    to="/membership/info"
                    className="block w-full text-center py-2.5 rounded-xl bg-white text-ink text-xs font-bold hover:bg-violet-50 transition-colors"
                  >
                    View Membership Details →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Join ROSKYRO Deep Dive */}
          {activeTab === "officers" && (
            <div className="p-6 sm:p-10 lg:p-12 animate-fadeIn">
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                <div className="lg:col-span-7">
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                    Relationship Officer Careers &amp; Dignity
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-2 mb-4">
                    Join ROSKYRO: Earn Fairly, Work with Professional Respect
                  </h3>
                  <p className="text-ink-muted text-sm sm:text-base leading-relaxed mb-6">
                    ROSKYRO is not a gig platform — our Relationship Officers are trained healthcare professionals with fixed base pay, weekly performance payouts, complete insurance, and respectful uniforms.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3 mb-8 text-xs text-ink/80">
                    <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40">
                      <div className="font-bold text-emerald-800 mb-1">💸 Weekly UPI Payments</div>
                      <div>Earnings transferred directly to your bank account every single week.</div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40">
                      <div className="font-bold text-emerald-800 mb-1">🛡️ Health &amp; Accident Cover</div>
                      <div>Accident insurance from day one, plus health cover for qualified officers.</div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40">
                      <div className="font-bold text-emerald-800 mb-1">🌴 12 Paid Annual Leaves</div>
                      <div>Paid time off so you take care of yourself while helping others.</div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40">
                      <div className="font-bold text-emerald-800 mb-1">📈 Promotion Ladder</div>
                      <div>Trainee Officer → Senior Partner → Hospital Concierge Lead.</div>
                    </div>
                  </div>

                  <Link
                    to="/become-a-partner"
                    className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    <span>Read complete Relationship Officer benefits &amp; criteria</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Right Form: Quick Apply Form */}
                <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-emerald-500/20">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                    Fast 1-Minute Application
                  </div>
                  <h4 className="font-display text-xl font-bold mb-3">Apply to Join ROSKYRO</h4>
                  <p className="text-white/60 text-xs mb-5">
                    Enter your details below. Our recruitment and training team in Ambikapur will call you within 24 hours.
                  </p>

                  {applyStatus === "success" ? (
                    <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center">
                      <div className="text-2xl mb-1">🎉</div>
                      <div className="font-bold text-white text-sm">Application Received!</div>
                      <div className="text-xs text-emerald-200 mt-1">
                        Our officer coordinator will contact you shortly for your interview and document check.
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleApply} className="space-y-3.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-white/80 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={applyForm.full_name}
                          onChange={(e) => setApplyForm({ ...applyForm, full_name: e.target.value })}
                          placeholder="e.g. Ramesh Kumar"
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-white/80 mb-1">Phone Number (WhatsApp)</label>
                        <input
                          type="tel"
                          required
                          value={applyForm.phone}
                          onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                          placeholder="e.g. 9876543210"
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-white/80 mb-1">Email (Optional)</label>
                        <input
                          type="email"
                          value={applyForm.email}
                          onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                          placeholder="e.g. ramesh@example.com"
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                      </div>

                      {applyError && (
                        <div className="text-xs text-red-400 bg-red-950/50 p-2 rounded-lg border border-red-800">
                          {applyError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={applyLoading}
                        className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-ink font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                      >
                        {applyLoading ? "Submitting..." : "Submit Application Now"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* The 3 Core Pillar Master Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          
          {/* Pillar 1: For Hospitals */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-100 hover:border-indigo-400 shadow-lg shadow-indigo-50/50 hover:shadow-xl hover:shadow-indigo-100 transition-all flex flex-col justify-between relative group">
            <div className="absolute top-5 right-5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Pillar 01
              </span>
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <Building2 className="w-7 h-7" />
              </div>

              <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-1">
                For Healthcare Providers
              </div>
              <h3 className="font-display text-2xl font-bold text-ink mb-3 group-hover:text-indigo-600 transition-colors">
                For Hospitals
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed mb-6">
                The Patient Concierge Program places a dedicated Relationship Officer at every enrolled patient's bedside — taking non-clinical paperwork and navigation off your nurses' shoulders.
              </p>

              <div className="space-y-2.5 text-xs text-ink/80 mb-8 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Payroll Burden:</strong> ROSKYRO recruits, trains &amp; manages officers.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Faster Bed Turnaround:</strong> Proactive discharge clearance &amp; billing guidance.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Hospital Console:</strong> Live status dashboard for hospital superintendents.</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to="/for-hospitals"
                className="w-full py-3 px-5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-200 hover:shadow-lg transition-all"
              >
                <span>Explore Hospital Program</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center justify-between text-xs px-2 text-ink-muted">
                <Link to="/hospital/login" className="hover:text-indigo-600 font-medium">
                  Hospital Login →
                </Link>
                <button 
                  onClick={() => setActiveTab("hospitals")}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  View Details ↓
                </button>
              </div>
            </div>
          </div>

          {/* Pillar 2: For Patients & Families */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-violet/30 hover:border-violet shadow-lg shadow-violet/5 hover:shadow-xl hover:shadow-violet/15 transition-all flex flex-col justify-between relative group">
            <div className="absolute top-5 right-5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet/10 text-violet border border-violet/20">
                Pillar 02
              </span>
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-brand-gradient text-white flex items-center justify-center mb-6 shadow-md shadow-violet/20 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-7 h-7" />
              </div>

              <div className="text-xs font-bold uppercase tracking-widest text-violet mb-1">
                For Individuals &amp; Families
              </div>
              <h3 className="font-display text-2xl font-bold text-ink mb-3 group-hover:text-violet transition-colors">
                For Patients &amp; Families
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed mb-6">
                Never navigate counters or worry from afar alone. Get a personal Relationship Officer by your side from admission through discharge, plus annual VIP family memberships.
              </p>

              <div className="space-y-2.5 text-xs text-ink/80 mb-8 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-violet shrink-0 mt-0.5" />
                  <span><strong>Named Personal Officer:</strong> Assigned within 30 min of admission.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-violet shrink-0 mt-0.5" />
                  <span><strong>Full Bedside Care:</strong> Pharmacy runs, investigation escort &amp; paperwork.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-violet shrink-0 mt-0.5" />
                  <span><strong>Family Distance Peace:</strong> Structured daily photo/progress reports.</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to="/for-patients"
                className="w-full py-3 px-5 rounded-full bg-brand-gradient hover:opacity-95 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-violet/20 hover:shadow-lg transition-all"
              >
                <span>Explore Patient Concierge</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center justify-between text-xs px-2 text-ink-muted">
                <a href={BOOK_WA_LINK} target="_blank" rel="noreferrer" className="text-emerald-600 font-semibold hover:underline flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  WhatsApp Help
                </a>
                <button 
                  onClick={() => setActiveTab("patients")}
                  className="text-violet font-semibold hover:underline"
                >
                  View Details ↓
                </button>
              </div>
            </div>
          </div>

          {/* Pillar 3: Join ROSKYRO */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-100 hover:border-emerald-400 shadow-lg shadow-emerald-50/50 hover:shadow-xl hover:shadow-emerald-100 transition-all flex flex-col justify-between relative group">
            <div className="absolute top-5 right-5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Pillar 03
              </span>
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-6 shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform">
                <UserPlus className="w-7 h-7" />
              </div>

              <div className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1">
                For Healthcare Professionals
              </div>
              <h3 className="font-display text-2xl font-bold text-ink mb-3 group-hover:text-emerald-600 transition-colors">
                Join ROSKYRO
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed mb-6">
                Build a respected, salaried career in healthcare concierge. Receive certified professional training, weekly UPI payouts, comprehensive insurance, and rapid promotion ladders.
              </p>

              <div className="space-y-2.5 text-xs text-ink/80 mb-8 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Weekly Payouts:</strong> Direct UPI transfers every single week.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Medical &amp; Accident Cover:</strong> Day-one coverage + 12 paid leaves.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Growth Track:</strong> Trainee → Senior Partner → Hospital Team Lead.</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to="/become-a-partner"
                className="w-full py-3 px-5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-200 hover:shadow-lg transition-all"
              >
                <span>Apply to Join ROSKYRO</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center justify-between text-xs px-2 text-ink-muted">
                <Link to="/become-a-partner#benefits" className="hover:text-emerald-600 font-medium">
                  View Benefits →
                </Link>
                <button 
                  onClick={() => setActiveTab("officers")}
                  className="text-emerald-600 font-semibold hover:underline"
                >
                  Quick Apply ↓
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
