import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Download, Loader2 } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const CHECK_FIELDS = [
  ["id_verified", "ID verified"],
  ["police_verified", "Police check"],
  ["references_checked", "References"],
  ["interview_passed", "Interview"],
  ["training_completed", "Training"],
  ["id_card_issued", "Photo ID issued"],
];

const COMPLAINT_STATUS_OPTIONS = ["open", "in_review", "resolved"];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [agents, setAgents] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [cities, setCities] = useState([]);
  const [team, setTeam] = useState([]);
  const [paApplications, setPaApplications] = useState([]);
  const [paPartners, setPaPartners] = useState([]);
  const [paRequests, setPaRequests] = useState([]);
  const [pendingNotifications, setPendingNotifications] = useState(0);
  const [memberships, setMemberships] = useState([]);
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [careRequests, setCareRequests] = useState([]);
  const [actionItems, setActionItems] = useState(null);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  async function downloadFullReportPdf() {
    setExportingPdf(true);
    try {
      const response = await api.get("/admin/export/all.pdf", { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const stamp = new Date().toISOString().slice(0, 10);
      const link = document.createElement("a");
      link.href = url;
      link.download = `roskyro-admin-export-${stamp}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.detail || "Could not generate the PDF report. Please try again.");
    } finally {
      setExportingPdf(false);
    }
  }

  async function loadStats() {
    const { data } = await api.get("/admin/dashboard");
    setStats(data);
  }
  async function loadAgents() {
    const { data } = await api.get("/agents");
    setAgents(data);
  }
  async function loadCustomers() {
    setLoading(true);
    const { data } = await api.get("/admin/customers");
    setCustomers(data);
    setLoading(false);
  }
  async function updateCustomer(id, payload) {
    await api.patch(`/admin/customers/${id}`, payload);
    loadCustomers();
  }
  async function loadActionItems() {
    const { data } = await api.get("/admin/action-items");
    setActionItems(data);
  }
  async function loadComplaints() {
    setLoading(true);
    const { data } = await api.get("/admin/complaints");
    setComplaints(data);
    setLoading(false);
  }
  async function loadCities() {
    setLoading(true);
    const { data } = await api.get("/admin/cities");
    setCities(data);
    setLoading(false);
  }
  async function loadTeam() {
    setLoading(true);
    const { data } = await api.get("/admin/team");
    setTeam(data);
    setLoading(false);
  }
  async function loadPAApplications() {
    setLoading(true);
    const { data } = await api.get("/admin/priority-access/applications", { params: { status_filter: "pending" } });
    setPaApplications(data);
    setLoading(false);
  }
  async function loadPAPartners() {
    setLoading(true);
    const { data } = await api.get("/admin/priority-access/partners");
    setPaPartners(data);
    setLoading(false);
  }
  async function loadPARequests() {
    setLoading(true);
    const { data } = await api.get("/admin/priority-access/appointment-requests");
    setPaRequests(data);
    setLoading(false);
  }
  async function loadDoctors() {
    const { data } = await api.get("/admin/doctors");
    setDoctors(data);
  }
  async function loadMemberships() {
    setLoading(true);
    const { data } = await api.get("/admin/memberships");
    setMemberships(data);
    setLoading(false);
  }
  async function loadPendingInvoices() {
    const { data } = await api.get("/admin/memberships/invoices", { params: { status_filter: "pending" } });
    setPendingInvoices(data);
  }
  async function loadInquiries() {
    const { data } = await api.get("/admin/membership-inquiries");
    setInquiries(data);
  }
  async function loadCareRequests(filters = {}) {
    setLoading(true);
    const { data } = await api.get("/admin/care-requests", { params: filters });
    setCareRequests(data);
    setLoading(false);
  }
  async function updateCareRequest(id, payload) {
    await api.patch(`/admin/care-requests/${id}`, payload);
    loadCareRequests();
  }

  useEffect(() => { loadStats(); loadAgents(); loadActionItems(); api.get("/admin/notifications", { params: { status: "pending" } }).then(({ data }) => setPendingNotifications(data.length)).catch(() => {}); }, []);

  useEffect(() => {
    if (tab === "customers" && customers.length === 0) loadCustomers();
    if (tab === "complaints" && complaints.length === 0) loadComplaints();
    if (tab === "cities" && cities.length === 0) loadCities();
    if (tab === "team" && team.length === 0) loadTeam();
    if (tab === "priority-access") { loadPAApplications(); loadPAPartners(); loadPARequests(); }
    if (tab === "membership") { loadMemberships(); loadPendingInvoices(); loadDoctors(); loadInquiries(); }
    if (tab === "doctors") loadDoctors();
    if (tab === "care-requests") loadCareRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function toggleCheck(agentId, field, value) {
    await api.patch(`/agents/${agentId}/verification`, { [field]: value });
    loadAgents();
  }

  async function updateComplaint(id, status, resolution_note) {
    await api.patch(`/admin/complaints/${id}`, { status, resolution_note });
    loadComplaints();
  }

  // --- Partners: add / activate-deactivate / edit rates & availability / delete ---
  async function addPartner(payload) {
    await api.post("/admin/partners", payload);
    loadAgents();
  }
  async function setPartnerStatus(id, status) {
    await api.patch(`/admin/partners/${id}/status`, { status });
    loadAgents();
  }
  async function updateAgentPartner(id, payload) {
    await api.patch(`/admin/partners/${id}`, payload);
    loadAgents();
  }
  async function deletePartner(id) {
    if (!window.confirm("Remove this partner? This can't be undone.")) return;
    try {
      await api.delete(`/admin/partners/${id}`);
      loadAgents();
    } catch (err) {
      alert(err.response?.data?.detail || "Could not delete this partner.");
    }
  }

  // --- Cities: add / live-inactive / edit / delete ---
  async function addCity(payload) {
    await api.post("/admin/cities", payload);
    loadCities();
  }
  async function updateCity(id, payload) {
    await api.patch(`/admin/cities/${id}`, payload);
    loadCities();
  }
  async function deleteCity(id) {
    if (!window.confirm("Delete this city? This can't be undone.")) return;
    try {
      await api.delete(`/admin/cities/${id}`);
      loadCities();
    } catch (err) {
      alert(err.response?.data?.detail || "Could not delete this city.");
    }
  }

  // --- Team: add / activate-deactivate / delete ---
  async function addTeamMember(payload) {
    await api.post("/admin/team", payload);
    loadTeam();
  }
  async function updateTeamMember(id, payload) {
    await api.patch(`/admin/team/${id}`, payload);
    loadTeam();
  }
  async function deleteTeamMember(id) {
    if (!window.confirm("Remove this team member? This can't be undone.")) return;
    try {
      await api.delete(`/admin/team/${id}`);
      loadTeam();
    } catch (err) {
      alert(err.response?.data?.detail || "Could not remove this team member.");
    }
  }

  // --- Priority Access Network ---
  async function reviewApplication(id, approve) {
    const notes = window.prompt(approve ? "Verification notes (optional):" : "Reason for rejection (optional):") || "";
    try {
      await api.post(`/admin/priority-access/applications/${id}/review`, { approve, review_notes: notes });
      loadPAApplications();
      loadPAPartners();
    } catch (err) {
      alert(err.response?.data?.detail || "Could not review this application.");
    }
  }
  async function updatePartner(id, payload) {
    await api.patch(`/admin/priority-access/partners/${id}`, payload);
    loadPAPartners();
  }
  async function updateAppointmentRequest(id, payload) {
    await api.patch(`/admin/priority-access/appointment-requests/${id}`, payload);
    loadPARequests();
  }
  async function quickAddPartner(payload) {
    await api.post("/admin/priority-access/partners/quick-add", payload);
    loadPAPartners();
  }
  async function quickAddAppointment(payload) {
    await api.post("/admin/priority-access/appointment-requests/quick-add", payload);
    loadPARequests();
  }

  // --- Memberships ---
  async function quickAddMembership(payload) {
    const { data } = await api.post("/admin/memberships/quick-add", payload);
    loadMemberships();
    loadPendingInvoices();
    loadInquiries();
    return data;
  }
  async function updateInquiry(id, payload) {
    await api.patch(`/admin/membership-inquiries/${id}`, payload);
    loadInquiries();
  }
  async function updateMembershipStatus(id, status) {
    await api.patch(`/admin/memberships/${id}/status`, { status });
    loadMemberships();
  }
  async function markInvoicePaid(invoiceId) {
    await api.post(`/admin/memberships/invoices/${invoiceId}/mark-paid`);
    loadMemberships();
    loadPendingInvoices();
  }
  async function renewInvoice(membershipId) {
    await api.post(`/admin/memberships/${membershipId}/invoices/renew`);
    loadPendingInvoices();
  }

  // --- Concierge doctors (Doctor + Healthcare Concierge Membership) ---
  async function addDoctor(payload) {
    await api.post("/admin/doctors", payload);
    loadDoctors();
  }
  async function updateDoctor(id, payload) {
    await api.patch(`/admin/doctors/${id}`, payload);
    loadDoctors();
  }
  async function deleteDoctor(id) {
    if (!window.confirm("Remove this doctor? This can't be undone.")) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      loadDoctors();
    } catch (err) {
      alert(err.response?.data?.detail || "Could not delete this doctor.");
    }
  }
  async function assignDoctor(membershipId, doctorId, force = false) {
    try {
      await api.patch(`/admin/memberships/${membershipId}/assign-doctor`, { doctor_id: doctorId, force });
      loadMemberships();
      loadDoctors();
    } catch (err) {
      if (err.response?.status === 409 && !force) {
        const msg = err.response?.data?.detail || "This doctor is at capacity.";
        if (window.confirm(`${msg}\n\nAssign anyway?`)) {
          return assignDoctor(membershipId, doctorId, true);
        }
        return;
      }
      alert(err.response?.data?.detail || "Could not assign this doctor.");
    }
  }
  async function unassignDoctor(membershipId) {
    await api.delete(`/admin/memberships/${membershipId}/assign-doctor`);
    loadMemberships();
    loadDoctors();
  }
  async function issueDoctorPortalLink(doctorId) {
    const { data } = await api.post(`/admin/doctors/${doctorId}/portal-link`);
    loadDoctors();
    return data;
  }
  async function logDoctorConsultation(doctorId, membershipId, note) {
    try {
      await api.post(`/admin/doctors/${doctorId}/consultations`, { membership_id: membershipId, note: note || null });
      loadMemberships();
    } catch (err) {
      alert(err.response?.data?.detail || "Could not log this consultation.");
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-3xl text-ink">Admin dashboard</h1>
        <button
          onClick={downloadFullReportPdf}
          disabled={exportingPdf}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-brand-gradient text-white text-sm font-semibold shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {exportingPdf ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Full Report (PDF)</span>
            </>
          )}
        </button>
      </div>

      <div className="flex gap-6 border-b border-ink/10 mb-8 overflow-x-auto">
        {["overview", "partners", "priority-access", "membership", "doctors", "care-requests", "cities", "team", "customers", "complaints"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-semibold capitalize border-b-2 -mb-px whitespace-nowrap ${
              tab === t ? "border-violet text-violet" : "border-transparent text-ink/50"
            }`}
          >
            {t === "priority-access" ? "Priority Access" : t === "membership" ? "Memberships" : t === "care-requests" ? "Care Requests" : t}
          </button>
        ))}
        <Link
          to="/admin/hospitals"
          className="pb-3 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap border-transparent text-ink/50 hover:text-violet"
        >
          Hospitals
        </Link>
        <Link
          to="/admin/notifications"
          className="pb-3 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap border-transparent text-ink/50 hover:text-violet flex items-center gap-1.5"
        >
          Notifications
          {pendingNotifications > 0 && (
            <span className="text-[10px] font-bold bg-clay text-white rounded-full px-1.5 py-0.5 leading-none">
              {pendingNotifications}
            </span>
          )}
        </Link>
      </div>

      {tab === "overview" && stats && (
        <div className="space-y-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            <Stat label="Active partners" value={stats.agents.active} />
            <Stat label="Partners in pipeline" value={stats.agents.in_pipeline} />
            <Stat label="Open complaints" value={stats.complaints.open} highlight={stats.complaints.open > 0} />
            <Stat label="Priority complaints" value={stats.complaints.priority_open} highlight={stats.complaints.priority_open > 0} />
          </div>

          <ActionItemsWidget items={actionItems} onGoTo={setTab} />
        </div>
      )}

      {tab === "partners" && (
        <div className="space-y-4">
          <AddPartnerForm onAdd={addPartner} />
          {agents.map((a) => (
            <PartnerCard
              key={a.id}
              a={a}
              onToggleCheck={toggleCheck}
              onSetStatus={setPartnerStatus}
              onUpdate={updateAgentPartner}
              onDelete={deletePartner}
            />
          ))}
          {agents.length === 0 && <p className="text-ink/60">No partner applications yet.</p>}
        </div>
      )}

      {tab === "cities" && (
        <div className="space-y-4">
          <AddCityForm onAdd={addCity} />
          {loading && <p className="text-ink/50">Loading…</p>}
          {cities.map((c) => (
            <CityRow key={c.id} city={c} onUpdate={updateCity} onDelete={deleteCity} />
          ))}
          {!loading && cities.length === 0 && <p className="text-ink/60">No cities yet.</p>}
        </div>
      )}

      {tab === "team" && (
        <div className="space-y-4">
          <AddTeamMemberForm onAdd={addTeamMember} />
          {loading && <p className="text-ink/50">Loading…</p>}
          {team.map((m) => (
            <TeamRow key={m.id} member={m} isSelf={user?.user_id === m.id} onUpdate={updateTeamMember} onDelete={deleteTeamMember} />
          ))}
          {!loading && team.length === 0 && <p className="text-ink/60">No team members yet.</p>}
        </div>
      )}

      {tab === "priority-access" && (
        <div className="space-y-10">
          <div className="grid md:grid-cols-2 gap-6">
            <QuickAddPartnerForm onAdd={quickAddPartner} />
            <QuickAddAppointmentForm partners={paPartners} onAdd={quickAddAppointment} />
          </div>

          <div>
            <h2 className="font-display text-xl text-ink mb-3">Pending applications</h2>
            {loading && <p className="text-ink/50">Loading…</p>}
            <div className="space-y-3">
              {paApplications.map((a) => (
                <div key={a.id} className="border border-ink/10 rounded-card p-5">
                  <div className="flex justify-between items-start gap-3 flex-wrap">
                    <div>
                      <div className="font-semibold text-ink">
                        {a.name} <span className="text-xs font-normal text-ink/50 capitalize">({a.partner_type})</span>
                      </div>
                      <div className="text-sm text-ink/60">
                        {a.city}{a.area ? `, ${a.area}` : ""} · {a.contact_number}
                        {a.specialty && ` · ${a.specialty}`}
                        {a.departments && ` · ${a.departments}`}
                      </div>
                      {(a.consultation_fee || a.priority_fee) && (
                        <div className="text-xs text-ink/50 mt-1">
                          {a.consultation_fee && `Consultation ₹${a.consultation_fee}`}
                          {a.priority_fee && ` · Priority fee ₹${a.priority_fee}`}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => reviewApplication(a.id, true)} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-violet/15 text-magenta">
                        Approve
                      </button>
                      <button onClick={() => reviewApplication(a.id, false)} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-clay/15 text-clay">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!loading && paApplications.length === 0 && <p className="text-ink/60">No pending applications.</p>}
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink mb-3">Active partners</h2>
            <div className="space-y-3">
              {paPartners.map((p) => (
                <div key={p.id} className="border border-ink/10 rounded-card p-5">
                  <div className="flex justify-between items-start gap-3 flex-wrap">
                    <div>
                      <div className="font-semibold text-ink">
                        {p.name} <span className="text-xs font-normal text-ink/50 capitalize">({p.partner_type})</span>
                      </div>
                      <div className="text-sm text-ink/60">{p.city}{p.area ? `, ${p.area}` : ""} · {p.specialty || p.departments || "—"}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={p.partner_status}
                        onChange={(e) => updatePartner(p.id, { partner_status: e.target.value })}
                        className="text-xs rounded-full border border-ink/15 px-3 py-1.5"
                      >
                        <option value="active">🟢 Active</option>
                        <option value="temporarily_unavailable">🟡 Temporarily unavailable</option>
                        <option value="inactive">🔴 Inactive</option>
                      </select>
                      <select
                        value={p.priority_access_status}
                        onChange={(e) => updatePartner(p.id, { priority_access_status: e.target.value })}
                        className="text-xs rounded-full border border-ink/15 px-3 py-1.5"
                      >
                        <option value="available">Priority: Available</option>
                        <option value="not_available">Priority: Not available</option>
                        <option value="by_request">Priority: By request</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              {paPartners.length === 0 && <p className="text-ink/60">No approved partners yet.</p>}
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink mb-3">Appointment requests</h2>
            <div className="space-y-3">
              {paRequests.map((r) => (
                <div key={r.id} className="border border-ink/10 rounded-card p-5">
                  <div className="flex justify-between items-start gap-3 flex-wrap">
                    <div>
                      <div className="font-semibold text-ink">{r.patient_name} <span className="text-xs font-normal text-ink/50">· {r.patient_phone}</span></div>
                      <div className="text-sm text-ink/60">{r.preferred_time || "No preferred time given"}</div>
                      {r.notes && <div className="text-sm text-ink/50 mt-1">{r.notes}</div>}
                      {r.concierge_notes && <div className="text-sm text-ink/70 mt-1 bg-mist rounded p-2">{r.concierge_notes}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-violet capitalize">{r.status}</span>
                      {r.status === "requested" && (
                        <>
                          <button
                            onClick={() => {
                              const notes = window.prompt("Confirmation details for the patient (fee, slot, priority fee):") || "";
                              updateAppointmentRequest(r.id, { status: "confirmed", concierge_notes: notes });
                            }}
                            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-violet/15 text-magenta"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => updateAppointmentRequest(r.id, { status: "cancelled" })}
                            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-clay/15 text-clay"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {paRequests.length === 0 && <p className="text-ink/60">No appointment requests yet.</p>}
            </div>
          </div>
        </div>
      )}

      {tab === "membership" && (
        <div className="space-y-10">
          <div>
            <h2 className="font-display text-xl text-ink mb-1">Membership inquiries</h2>
            <p className="text-sm text-ink/50 mb-3">
              Leads from the public "Enquire" form — no price was quoted to them. Call, understand what they need
              (specialization, care requirement), agree a price, then use "Add Membership directly" below with that
              price and mark the inquiry converted.
            </p>
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div key={inq.id} className="border border-ink/10 rounded-card p-4 flex justify-between items-start gap-3 flex-wrap">
                  <div>
                    <div className="font-semibold text-ink">
                      {inq.full_name} <span className="text-xs font-normal text-ink/50">· {inq.phone}</span>
                    </div>
                    {inq.message && <div className="text-sm text-ink/60 mt-1">{inq.message}</div>}
                    <div className="text-xs text-ink/40 mt-1">{new Date(inq.created_at).toLocaleString("en-IN")}</div>
                    <textarea
                      defaultValue={inq.concierge_notes || ""}
                      onBlur={(e) => { if (e.target.value !== (inq.concierge_notes || "")) updateInquiry(inq.id, { status: inq.status, concierge_notes: e.target.value }); }}
                      placeholder="Internal notes — call outcome, price discussed…"
                      className="mt-2 w-full text-xs border border-ink/15 rounded-lg px-2.5 py-1.5"
                      rows={2}
                    />
                  </div>
                  <select
                    value={inq.status}
                    onChange={(e) => updateInquiry(inq.id, { status: e.target.value, concierge_notes: inq.concierge_notes })}
                    className="text-xs rounded-full border border-ink/15 px-3 py-1.5 capitalize"
                  >
                    {["new", "contacted", "converted", "closed"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              ))}
              {inquiries.length === 0 && <p className="text-ink/60">No inquiries yet.</p>}
            </div>
          </div>

          <QuickAddMembershipForm onAdd={quickAddMembership} />

          <div>
            <h2 className="font-display text-xl text-ink mb-3">Pending payments</h2>
            <div className="space-y-3">
              {pendingInvoices.map((inv) => {
                const m = memberships.find((mm) => mm.id === inv.membership_id);
                return (
                  <div key={inv.id} className="flex items-center justify-between border border-ink/10 rounded-card p-4 flex-wrap gap-3">
                    <div>
                      <div className="font-semibold text-ink">{m ? `${m.customer_name} (${m.customer_phone})` : `Membership #${inv.membership_id}`}</div>
                      <div className="text-sm text-ink/60">₹{inv.amount.toLocaleString("en-IN")} · {new Date(inv.period_start).toLocaleDateString("en-IN")} – {new Date(inv.period_end).toLocaleDateString("en-IN")}</div>
                    </div>
                    <button onClick={() => markInvoicePaid(inv.id)} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-violet/15 text-magenta">
                      Mark Paid
                    </button>
                  </div>
                );
              })}
              {pendingInvoices.length === 0 && <p className="text-ink/60">No pending payments.</p>}
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink mb-3">All members</h2>
            {loading && <p className="text-ink/50">Loading…</p>}
            <div className="space-y-3">
              {memberships.map((m) => (
                <div key={m.id} className="border border-ink/10 rounded-card p-5">
                  <div className="flex justify-between items-start gap-3 flex-wrap">
                    <div>
                      <div className="font-semibold text-ink">
                        {m.customer_name} <span className="text-xs font-normal text-ink/50">· {m.customer_phone}</span>
                      </div>
                      <div className="text-sm text-ink/60 capitalize">
                        {m.member_code} · {m.plan} · ₹{m.annual_price_snapshot.toLocaleString("en-IN")}/yr · {m.family_member_count} family member(s)
                      </div>
                      {m.status === "active" && (
                        <div className="text-xs text-ink/50 mt-1">
                          {m.relationship_officer_visits_unlimited
                            ? "Unlimited concierge coordination this month (fair-use policy)"
                            : `This month: ${m.relationship_officer_visits_used}/${m.relationship_officer_visits_quota} Relationship Officer visits used`}
                        </div>
                      )}
                      {m.next_billing_date && (
                        <div className="text-xs text-ink/50 mt-1">Next billing {new Date(m.next_billing_date).toLocaleDateString("en-IN")}</div>
                      )}
                      {/* Doctor + Healthcare Concierge Membership: shows for every
                          plan, not just doctor_concierge, since nothing stops an
                          admin giving another plan's member a concierge doctor too. */}
                      <div className="mt-1">
                        {m.assigned_doctor_id ? (
                          <div className="text-xs text-ink/60">
                            Concierge doctor: <span className="font-semibold text-ink">Dr. {m.assigned_doctor_name}</span>
                            {m.status === "active" && (
                              <span>
                                {" · "}
                                {m.doctor_consultations_unlimited
                                  ? `${m.doctor_consultations_used} consultation${m.doctor_consultations_used === 1 ? "" : "s"} logged this year — Unlimited (fair-use)`
                                  : `${m.doctor_consultations_used}/${m.doctor_consultations_quota} consultations used this year`}
                                {m.doctor_consultations_usage_flag && (
                                  <span className="ml-1.5 text-amber-700 font-semibold">⚠ usage looks unusual — worth a check-in</span>
                                )}
                              </span>
                            )}
                            <button onClick={() => unassignDoctor(m.id)} className="ml-2 text-magenta hover:underline">Unassign</button>
                          </div>
                        ) : (
                          <div className="text-xs text-clay font-semibold">No concierge doctor assigned</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={m.status}
                        onChange={(e) => updateMembershipStatus(m.id, e.target.value)}
                        className="text-xs rounded-full border border-ink/15 px-3 py-1.5 capitalize"
                      >
                        {["pending", "active", "paused", "cancelled", "expired"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <select
                        value=""
                        onChange={(e) => { if (e.target.value) assignDoctor(m.id, Number(e.target.value)); }}
                        className="text-xs rounded-full border border-violet/30 px-3 py-1.5 text-violet"
                      >
                        <option value="">{m.assigned_doctor_id ? "Reassign doctor…" : "Assign a doctor…"}</option>
                        {doctors.map((d) => (
                          <option key={d.id} value={d.id} disabled={d.status !== "active"}>
                            Dr. {d.full_name} ({d.assigned_member_count}/{d.max_members}){d.status !== "active" ? " — inactive" : ""}
                          </option>
                        ))}
                      </select>
                      {m.assigned_doctor_id && m.status === "active" && (
                        <button
                          onClick={() => {
                            const note = window.prompt("Short note for this consultation (optional):", "");
                            if (note !== null) logDoctorConsultation(m.assigned_doctor_id, m.id, note);
                          }}
                          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-ink/10 text-ink/70"
                        >
                          Log consultation
                        </button>
                      )}
                      <button onClick={() => renewInvoice(m.id)} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-ink/10 text-ink/70">
                        Generate next invoice
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!loading && memberships.length === 0 && <p className="text-ink/60">No members yet.</p>}
            </div>
          </div>
        </div>
      )}

      {tab === "customers" && (
        <div>
          {loading && <p className="text-ink/50 mb-4">Loading…</p>}
          {!loading && customers.length === 0 && <p className="text-ink/60">No customers have signed up yet.</p>}
          {customers.length > 0 && (
            <div className="overflow-x-auto border border-ink/10 rounded-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-parchment text-left text-ink/60">
                    <Th>Name</Th>
                    <Th>Phone</Th>
                    <Th>Email</Th>
                    <Th>Status</Th>
                    <Th>Joined</Th>
                    <Th></Th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <CustomerRow key={c.id} customer={c} onUpdate={updateCustomer} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "complaints" && (
        <div className="space-y-4">
          {loading && <p className="text-ink/50">Loading…</p>}
          {!loading && complaints.length === 0 && <p className="text-ink/60">No complaints or feedback yet.</p>}
          {complaints.map((c) => (
            <ComplaintCard key={c.id} complaint={c} onUpdate={updateComplaint} />
          ))}
        </div>
      )}

      {tab === "doctors" && (
        <DoctorsTab doctors={doctors} onAdd={addDoctor} onUpdate={updateDoctor} onDelete={deleteDoctor} onIssuePortalLink={issueDoctorPortalLink} />
      )}

      {tab === "care-requests" && (
        <CareRequestsTab careRequests={careRequests} loading={loading} onFilter={loadCareRequests} onUpdate={updateCareRequest} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Concierge Doctors — Doctor + Healthcare Concierge Membership
// ---------------------------------------------------------------------------

function DoctorsTab({ doctors, onAdd, onUpdate, onDelete, onIssuePortalLink }) {
  const [showAdd, setShowAdd] = useState(false);
  return (
    <div>
      <p className="text-sm text-ink/60 mb-4 max-w-xl">
        Doctors ROSKYRO has partnered with to be a member's dedicated concierge
        physician on the Doctor + Healthcare Concierge Membership. Assign a
        doctor to a member from the <span className="font-semibold">Memberships</span> tab.
      </p>
      <button onClick={() => setShowAdd((v) => !v)} className="text-sm font-semibold px-4 py-2 rounded-full bg-violet text-white mb-5">
        {showAdd ? "Cancel" : "+ Add a doctor"}
      </button>
      {showAdd && <AddDoctorForm onAdd={async (payload) => { await onAdd(payload); setShowAdd(false); }} />}

      <div className="space-y-3 mt-5">
        {doctors.map((d) => (
          <DoctorCard key={d.id} doctor={d} onUpdate={onUpdate} onDelete={onDelete} onIssuePortalLink={onIssuePortalLink} />
        ))}
        {doctors.length === 0 && <p className="text-ink/60">No doctors added yet.</p>}
      </div>
    </div>
  );
}

function AddDoctorForm({ onAdd }) {
  const [fullName, setFullName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [qualification, setQualification] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [maxMembers, setMaxMembers] = useState(40);
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onAdd({
        full_name: fullName, specialty: specialty || null, qualification: qualification || null,
        contact_phone: phone, whatsapp: whatsapp || null, email: email || null,
        max_members: Number(maxMembers) || 40, bio: bio || null,
      });
      setFullName(""); setSpecialty(""); setQualification(""); setPhone(""); setWhatsapp(""); setEmail(""); setMaxMembers(40); setBio("");
    } catch (err) {
      setError(err.response?.data?.detail || "Could not add this doctor.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="border border-ink/10 rounded-card p-5 grid sm:grid-cols-2 gap-4 mb-5">
      <label className="text-sm text-ink/70">
        Full name
        <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Dr. Anjali Mehta" className="block mt-1 w-full border border-ink/15 rounded-lg px-3 py-2 text-sm" />
      </label>
      <label className="text-sm text-ink/70">
        Phone number
        <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98xxxxxxxx" className="block mt-1 w-full border border-ink/15 rounded-lg px-3 py-2 text-sm" />
      </label>
      <label className="text-sm text-ink/70">
        Specialty
        <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Internal Medicine" className="block mt-1 w-full border border-ink/15 rounded-lg px-3 py-2 text-sm" />
      </label>
      <label className="text-sm text-ink/70">
        Qualification
        <input value={qualification} onChange={(e) => setQualification(e.target.value)} placeholder="MBBS, MD" className="block mt-1 w-full border border-ink/15 rounded-lg px-3 py-2 text-sm" />
      </label>
      <label className="text-sm text-ink/70">
        WhatsApp (optional)
        <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="block mt-1 w-full border border-ink/15 rounded-lg px-3 py-2 text-sm" />
      </label>
      <label className="text-sm text-ink/70">
        Email (optional)
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="block mt-1 w-full border border-ink/15 rounded-lg px-3 py-2 text-sm" />
      </label>
      <label className="text-sm text-ink/70">
        Max members (capacity)
        <input type="number" min="1" value={maxMembers} onChange={(e) => setMaxMembers(e.target.value)} className="block mt-1 w-full border border-ink/15 rounded-lg px-3 py-2 text-sm" />
      </label>
      <label className="text-sm text-ink/70 sm:col-span-2">
        Short bio shown to members (optional)
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className="block mt-1 w-full border border-ink/15 rounded-lg px-3 py-2 text-sm" />
      </label>
      <div className="sm:col-span-2 flex items-center gap-3">
        <button disabled={saving} className="text-sm font-semibold px-4 py-2 rounded-full bg-violet text-white disabled:opacity-60">
          {saving ? "Adding…" : "Add doctor"}
        </button>
        {error && <p className="text-xs text-clay">{error}</p>}
      </div>
    </form>
  );
}

function DoctorCard({ doctor: d, onUpdate, onDelete, onIssuePortalLink }) {
  const [editingCapacity, setEditingCapacity] = useState(false);
  const [maxMembers, setMaxMembers] = useState(d.max_members);
  const [issuing, setIssuing] = useState(false);
  const overCapacity = d.assigned_member_count >= d.max_members;

  const portalLink = d.portal_token ? `${window.location.origin}/doctor/portal/${d.portal_token}` : null;

  async function handleIssuePortalLink() {
    setIssuing(true);
    try {
      await onIssuePortalLink(d.id);
    } catch (err) {
      alert(err.response?.data?.detail || "Could not issue this doctor's portal link.");
    } finally {
      setIssuing(false);
    }
  }
  function copyPortalLink() {
    if (!portalLink) return;
    navigator.clipboard?.writeText(portalLink);
    alert("Portal link copied.");
  }

  return (
    <div className="border border-ink/10 rounded-card p-5">
      <div className="flex justify-between items-start gap-3 flex-wrap">
        <div>
          <div className="font-semibold text-ink">Dr. {d.full_name}</div>
          <div className="text-sm text-ink/60">
            {d.specialty || "General"}{d.qualification ? ` · ${d.qualification}` : ""} · {d.contact_phone}
          </div>
          {d.bio && <div className="text-sm text-ink/50 mt-1 max-w-lg">{d.bio}</div>}
          <div className={`text-xs mt-1 ${overCapacity ? "text-clay font-semibold" : "text-ink/50"}`}>
            {d.assigned_member_count} / {d.max_members} members assigned{overCapacity ? " — at capacity" : ""}
          </div>
          {/* This doctor's own no-login portal — same pattern as the
              hospital program's officer portal link. */}
          <div className="text-xs mt-2 flex items-center gap-2 flex-wrap">
            <button onClick={handleIssuePortalLink} disabled={issuing} className="font-semibold text-violet hover:underline disabled:opacity-60">
              {issuing ? "Issuing…" : portalLink ? "Regenerate portal link" : "Issue portal link"}
            </button>
            {portalLink && (
              <>
                <button onClick={copyPortalLink} className="text-ink/50 hover:underline">Copy link</button>
                <span className="text-ink/40">
                  {d.portal_link_live
                    ? `valid till ${new Date(d.portal_token_expires_at).toLocaleDateString()}`
                    : "link expired"}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={d.status}
            onChange={(e) => onUpdate(d.id, { status: e.target.value })}
            className="text-xs rounded-full border border-ink/15 px-3 py-1.5 capitalize"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {editingCapacity ? (
            <span className="flex items-center gap-1">
              <input
                type="number" min="1" value={maxMembers} autoFocus
                onChange={(e) => setMaxMembers(e.target.value)}
                className="w-16 text-xs border border-ink/15 rounded-lg px-2 py-1.5"
              />
              <button
                onClick={() => { onUpdate(d.id, { max_members: Number(maxMembers) || 1 }); setEditingCapacity(false); }}
                className="text-xs font-semibold px-2 py-1.5 rounded-full bg-violet text-white"
              >
                Save
              </button>
            </span>
          ) : (
            <button onClick={() => setEditingCapacity(true)} className="text-xs font-semibold text-violet hover:underline">
              Edit capacity
            </button>
          )}
          <button onClick={() => onDelete(d.id)} className="text-xs font-semibold text-clay hover:underline">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Admin Care Requests board — every coordination ticket across every
// member, in one place. Same "list of cards with a filter bar" shape as
// ComplaintCard below, but with an extra origin badge since a ticket here
// can come from the member themselves or from their concierge doctor
// (referred either through the doctor's own portal or logged by the
// concierge desk on the doctor's behalf — see AdminCareRequestOut).
// ---------------------------------------------------------------------------

const CARE_REQUEST_STATUS_OPTIONS = ["open", "in_progress", "resolved", "cancelled"];
const CARE_REQUEST_CATEGORY_OPTIONS = [
  "appointment", "hospital", "diagnostic", "specialist", "follow_up",
  "admission", "discharge", "physical_assistance", "records", "family_update", "medical_travel", "other",
];

function CareRequestsTab({ careRequests, loading, onFilter, onUpdate }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [originFilter, setOriginFilter] = useState("");

  function applyFilters(next = {}) {
    const filters = {
      status_filter: next.status_filter ?? statusFilter,
      category_filter: next.category_filter ?? categoryFilter,
      origin_filter: next.origin_filter ?? originFilter,
    };
    onFilter(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
  }

  return (
    <div>
      <p className="text-sm text-ink/60 mb-4 max-w-xl">
        Every coordination ticket a member (or their concierge doctor, on their behalf) has raised — appointments,
        hospital/specialist coordination, admission &amp; discharge assistance, and everything else in Care History.
      </p>
      <div className="flex flex-wrap gap-2 mb-5">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); applyFilters({ status_filter: e.target.value }); }}
          className="text-xs rounded-full border border-ink/15 px-3 py-1.5 capitalize"
        >
          <option value="">All statuses</option>
          {CARE_REQUEST_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); applyFilters({ category_filter: e.target.value }); }}
          className="text-xs rounded-full border border-ink/15 px-3 py-1.5 capitalize"
        >
          <option value="">All categories</option>
          {CARE_REQUEST_CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>{c.replace("_", " ")}</option>
          ))}
        </select>
        <select
          value={originFilter}
          onChange={(e) => { setOriginFilter(e.target.value); applyFilters({ origin_filter: e.target.value }); }}
          className="text-xs rounded-full border border-ink/15 px-3 py-1.5 capitalize"
        >
          <option value="">Member + doctor-referred</option>
          <option value="member">Member-raised only</option>
          <option value="doctor_referral">Doctor-referred only</option>
        </select>
      </div>

      {loading && <p className="text-ink/50">Loading…</p>}
      {!loading && careRequests.length === 0 && <p className="text-ink/60">No care requests match this filter.</p>}
      <div className="space-y-3">
        {careRequests.map((r) => (
          <CareRequestCard key={r.id} request={r} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  );
}

function CareRequestCard({ request: r, onUpdate }) {
  const [notes, setNotes] = useState(r.concierge_notes || "");
  const [status, setStatus] = useState(r.status);
  const open = r.status === "open" || r.status === "in_progress";

  return (
    <div className={`border rounded-card p-5 ${open ? "border-ink/10" : "border-ink/10 opacity-70"}`}>
      <div className="flex justify-between items-start gap-4 mb-2 flex-wrap">
        <div>
          <div className="font-semibold text-ink flex items-center gap-2 flex-wrap">
            {r.title}
            {r.origin === "doctor_referral" && (
              <span className="text-[10px] font-bold uppercase tracking-wide text-violet bg-violet/10 px-2 py-0.5 rounded-full">
                Referred by doctor
              </span>
            )}
          </div>
          <div className="text-sm text-ink/50">
            {r.customer_name} ({r.customer_phone}) · {r.member_code} · {r.plan}
            {r.family_member_name && ` · for ${r.family_member_name}`}
          </div>
          <div className="text-xs text-ink/40 mt-0.5 capitalize">
            {r.category.replace("_", " ")} · {new Date(r.created_at).toLocaleString()}
            {r.resolved_at && ` · resolved ${new Date(r.resolved_at).toLocaleDateString()}`}
          </div>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-parchment text-ink/70 capitalize whitespace-nowrap">
          {r.status.replace("_", " ")}
        </span>
      </div>
      {r.description && <p className="text-sm text-ink/80 mb-3">{r.description}</p>}
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="text-sm border border-ink/15 rounded-lg px-3 py-2 bg-white capitalize"
        >
          {CARE_REQUEST_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Concierge notes (shared back to the member)"
          className="flex-1 text-sm border border-ink/15 rounded-lg px-3 py-2"
        />
        <button
          onClick={() => onUpdate(r.id, { status, concierge_notes: notes })}
          className="text-xs font-semibold px-4 py-2 rounded-full bg-violet text-white whitespace-nowrap"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function ComplaintCard({ complaint, onUpdate }) {
  const [note, setNote] = useState(complaint.resolution_note || "");
  const [status, setStatus] = useState(complaint.status);

  return (
    <div className={`border rounded-card p-5 ${complaint.is_priority && complaint.status !== "resolved" ? "border-clay bg-clay/5" : "border-ink/10"}`}>
      <div className="flex justify-between items-start gap-4 mb-2">
        <div>
          <div className="font-semibold text-ink">
            {complaint.name} {complaint.is_priority && <span className="text-clay text-xs ml-1">⚠ Safety</span>}
          </div>
          <div className="text-sm text-ink/50">
            {complaint.phone} · {complaint.category} {complaint.booking_code ? `· ${complaint.booking_code}` : ""} · {new Date(complaint.created_at).toLocaleString()}
          </div>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-parchment text-ink/70 capitalize whitespace-nowrap">
          {complaint.status.replace("_", " ")}
        </span>
      </div>
      <p className="text-sm text-ink/80 mb-3">{complaint.message}</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="text-sm border border-ink/15 rounded-lg px-3 py-2 bg-white"
        >
          {COMPLAINT_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Reply / resolution note (optional)"
          className="flex-1 text-sm border border-ink/15 rounded-lg px-3 py-2"
        />
        <button
          onClick={() => onUpdate(complaint.id, status, note)}
          className="text-sm font-semibold px-4 py-2 rounded-lg bg-violet text-white"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function Th({ children }) {
  return <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}

function Stat({ label, value, highlight }) {
  return (
    <div className={`rounded-card p-5 border ${highlight ? "border-clay bg-clay/10" : "border-ink/10 bg-white/50"}`}>
      <div className="text-xs text-ink/50 mb-1">{label}</div>
      <div className="font-display text-2xl text-ink">{value}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Today's Action Items — the four things the recommended daily/weekly admin
// routine checks by hand (Discharge Alerts, Pending Invoices, Membership
// Inquiries, Doctor Capacity), combined into one glance. Backed entirely by
// GET /admin/action-items, itself a re-derivation of each tab's own data.
// ---------------------------------------------------------------------------

function ActionItemsWidget({ items, onGoTo }) {
  const navigate = useNavigate();

  if (!items) return null;

  const pendingInvoicesCount = items.pending_membership_invoices_count + items.pending_hospital_invoices_count;
  const pendingInvoicesAmount = items.pending_membership_invoices_amount + items.pending_hospital_invoices_amount;

  const cards = [
    {
      key: "discharge",
      label: "Discharge alerts",
      value: items.discharge_alerts_count,
      sub: items.discharge_alerts_critical_count > 0 ? `${items.discharge_alerts_critical_count} critical` : "cases stuck in pending-discharge",
      urgent: items.discharge_alerts_critical_count > 0,
      onClick: () => navigate("/admin/hospitals"),
    },
    {
      key: "invoices",
      label: "Pending invoices",
      value: pendingInvoicesCount,
      sub: `₹${pendingInvoicesAmount.toLocaleString("en-IN")} awaiting payment`,
      urgent: pendingInvoicesCount > 0,
      onClick: () => onGoTo("membership"),
    },
    {
      key: "inquiries",
      label: "New membership leads",
      value: items.new_membership_inquiries_count,
      sub: "not yet contacted",
      urgent: items.new_membership_inquiries_count > 0,
      onClick: () => onGoTo("membership"),
    },
    {
      key: "doctors",
      label: "Doctors near/over capacity",
      value: items.doctors_near_or_over_capacity.length,
      sub: items.doctors_near_or_over_capacity.some((d) => d.over_capacity) ? "some already over max" : "≥80% of max members",
      urgent: items.doctors_near_or_over_capacity.some((d) => d.over_capacity),
      onClick: () => onGoTo("doctors"),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg text-ink">Today's action items</h2>
        <span className="text-xs text-ink/50">{items.total_action_items} total</span>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
        {cards.map((card) => (
          <button
            key={card.key}
            onClick={card.onClick}
            className={`text-left rounded-card p-5 border transition hover:shadow-sm ${card.urgent ? "border-clay bg-clay/10" : "border-ink/10 bg-white/50"}`}
          >
            <div className="text-xs text-ink/50 mb-1">{card.label}</div>
            <div className="font-display text-2xl text-ink">{card.value}</div>
            <div className="text-xs text-ink/50 mt-1">{card.sub}</div>
          </button>
        ))}
      </div>
      {items.doctors_near_or_over_capacity.length > 0 && (
        <div className="mt-3 text-xs text-ink/60">
          {items.doctors_near_or_over_capacity.map((d) => (
            <span key={d.id} className={`inline-block mr-3 mb-1 px-2 py-1 rounded-full ${d.over_capacity ? "bg-clay/15 text-clay" : "bg-flare/20 text-ink"}`}>
              {d.full_name}: {d.assigned_member_count}/{d.max_members}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cities: add form + row with live/inactive toggle + delete
// ---------------------------------------------------------------------------

function AddCityForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", state: "", is_live: false });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onAdd(form);
      setForm({ name: "", state: "", is_live: false });
      setOpen(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not add city.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm font-semibold px-4 py-2 rounded-full bg-violet text-white">
        + Add city
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="border border-ink/10 rounded-card p-5 grid sm:grid-cols-2 gap-3">
      <Input label="City name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
      <Input label="State" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
      <label className="flex items-center gap-2 text-sm text-ink/70">
        <input type="checkbox" checked={form.is_live} onChange={(e) => setForm((f) => ({ ...f, is_live: e.target.checked }))} />
        Launch as live (bookable) immediately
      </label>
      {error && <p className="sm:col-span-2 text-sm text-clay">{error}</p>}
      <div className="sm:col-span-2 flex gap-2">
        <button disabled={saving} className="text-sm font-semibold px-4 py-2 rounded-full bg-violet text-white disabled:opacity-60">
          {saving ? "Saving…" : "Save city"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold px-4 py-2 rounded-full bg-ink/10 text-ink/70">
          Cancel
        </button>
      </div>
    </form>
  );
}

function CityRow({ city, onUpdate, onDelete }) {
  return (
    <div className="border border-ink/10 rounded-card p-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="font-semibold text-ink">{city.name}{city.state ? `, ${city.state}` : ""}</div>
        <div className="text-sm text-ink/50">{city.agent_count} partner(s) · {city.interest_count} waitlist requests</div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${city.is_live ? "bg-violet/15 text-magenta" : "bg-ink/10 text-ink/50"}`}>
          {city.is_live ? "Live" : "Inactive"}
        </span>
        <button
          onClick={() => onUpdate(city.id, { is_live: !city.is_live })}
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-ink/10 text-ink/60"
        >
          {city.is_live ? "Mark inactive" : "Mark live"}
        </button>
        <button onClick={() => onDelete(city.id)} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-clay/15 text-clay">
          Delete
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Team: add form + row with active toggle + delete
// ---------------------------------------------------------------------------

function AddTeamMemberForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", password: "", role: "support" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onAdd(form);
      setForm({ full_name: "", phone: "", email: "", password: "", role: "support" });
      setOpen(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not add team member.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm font-semibold px-4 py-2 rounded-full bg-violet text-white">
        + Add team member
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="border border-ink/10 rounded-card p-5 grid sm:grid-cols-2 gap-3">
      <Input label="Full name" value={form.full_name} onChange={set("full_name")} required />
      <Input label="Phone number" value={form.phone} onChange={set("phone")} required />
      <Input label="Email (optional)" value={form.email} onChange={set("email")} />
      <Input label="Temporary password" type="password" value={form.password} onChange={set("password")} required />
      <label className="text-sm text-ink/70">
        Role
        <select value={form.role} onChange={set("role")} className="mt-1 w-full text-sm border border-ink/15 rounded-lg px-3 py-2 bg-white">
          <option value="support">Support (limited access)</option>
          <option value="admin">Admin (full access)</option>
        </select>
      </label>
      {error && <p className="sm:col-span-2 text-sm text-clay">{error}</p>}
      <div className="sm:col-span-2 flex gap-2">
        <button disabled={saving} className="text-sm font-semibold px-4 py-2 rounded-full bg-violet text-white disabled:opacity-60">
          {saving ? "Saving…" : "Add member"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold px-4 py-2 rounded-full bg-ink/10 text-ink/70">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Customers: read-only list + inline edit (name/phone/email/language) and
// an activate/deactivate toggle, via PATCH /admin/customers/{id}.
// ---------------------------------------------------------------------------

function CustomerRow({ customer: c, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(c.full_name);
  const [phone, setPhone] = useState(c.phone);
  const [email, setEmail] = useState(c.email || "");
  const [language, setLanguage] = useState(c.preferred_language);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onUpdate(c.id, {
        full_name: fullName,
        phone,
        email: email === "" ? null : email,
        preferred_language: language,
      });
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive() {
    await onUpdate(c.id, { is_active: !c.is_active });
  }

  function startEditing() {
    // Reset fields to the current customer values every time editing opens —
    // otherwise a previous edit that was Cancelled (never saved) would leave
    // its stale, unsaved text sitting in the form the next time it's opened.
    setFullName(c.full_name);
    setPhone(c.phone);
    setEmail(c.email || "");
    setLanguage(c.preferred_language);
    setError("");
    setEditing(true);
  }

  if (editing) {
    return (
      <tr className="border-t border-ink/5 bg-parchment/60">
        <td colSpan={6} className="p-4">
          <form onSubmit={save} className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 items-start">
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="border border-ink/15 rounded-lg px-3 py-2 text-sm" required />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="border border-ink/15 rounded-lg px-3 py-2 text-sm" required />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" className="border border-ink/15 rounded-lg px-3 py-2 text-sm" />
            <input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="Preferred language" className="border border-ink/15 rounded-lg px-3 py-2 text-sm" required />
            {error && <p className="text-clay text-xs md:col-span-4">{error}</p>}
            <div className="flex gap-2 md:col-span-4">
              <button type="submit" disabled={saving} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-magenta text-white disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-ink/10 text-ink/60">
                Cancel
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-ink/5">
      <Td className="font-semibold text-ink">{c.full_name}</Td>
      <Td>{c.phone}</Td>
      <Td>{c.email || "—"}</Td>
      <Td>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.is_active ? "bg-violet/15 text-magenta" : "bg-ink/10 text-ink/50"}`}>
          {c.is_active ? "Active" : "Inactive"}
        </span>
      </Td>
      <Td>{new Date(c.created_at).toLocaleDateString()}</Td>
      <Td>
        <div className="flex gap-2 justify-end">
          <button onClick={startEditing} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-ink/10 text-ink/60">
            Edit
          </button>
          <button onClick={toggleActive} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-ink/10 text-ink/60">
            {c.is_active ? "Deactivate" : "Activate"}
          </button>
        </div>
      </Td>
    </tr>
  );
}

function TeamRow({ member, isSelf, onUpdate, onDelete }) {
  return (
    <div className="border border-ink/10 rounded-card p-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="font-semibold text-ink">{member.full_name}{isSelf ? " (you)" : ""}</div>
        <div className="text-sm text-ink/50">{member.phone} · {member.email || "no email"} · <span className="capitalize">{member.role}</span></div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${member.is_active ? "bg-violet/15 text-magenta" : "bg-ink/10 text-ink/50"}`}>
          {member.is_active ? "Active" : "Inactive"}
        </span>
        {!isSelf && (
          <button
            onClick={() => onUpdate(member.id, { is_active: !member.is_active })}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-ink/10 text-ink/60"
          >
            {member.is_active ? "Deactivate" : "Activate"}
          </button>
        )}
        {!isSelf && (
          <button onClick={() => onDelete(member.id)} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-clay/15 text-clay">
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Partners: add form (used at top of the Partners tab)
// ---------------------------------------------------------------------------

function PartnerCard({ a, onToggleCheck, onSetStatus, onUpdate, onDelete }) {
  const [editingRates, setEditingRates] = useState(false);
  const [monthlyBase, setMonthlyBase] = useState(a.monthly_base_pay ?? "");
  const [hospitalDailyRate, setHospitalDailyRate] = useState(a.hospital_daily_rate ?? "");
  const [saving, setSaving] = useState(false);

  async function toggleAvailable() {
    setSaving(true);
    try {
      await onUpdate(a.id, { is_available: !a.is_available });
    } finally {
      setSaving(false);
    }
  }

  async function saveRates(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdate(a.id, {
        monthly_base_pay: monthlyBase === "" ? null : Number(monthlyBase),
        hospital_daily_rate: hospitalDailyRate === "" ? null : Number(hospitalDailyRate),
      });
      setEditingRates(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-ink/10 rounded-card p-5">
      <div className="flex justify-between items-center mb-3 gap-3 flex-wrap">
        <div>
          <div className="font-semibold text-ink">{a.full_name}</div>
          <div className="text-sm text-ink/50">{a.phone} · {a.status} · {a.verification_progress}/6 checks</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${a.is_fully_verified ? "bg-violet/15 text-magenta" : "bg-flare/20 text-ink"}`}>
            {a.is_fully_verified ? "Fully verified" : "In progress"}
          </span>
          {/* A real toggle now — previously is_available only ever flipped to
              false automatically on suspend, and nothing enforced it anyway.
              The Hospital Program's assign flow now blocks (softly) on this. */}
          <button
            onClick={toggleAvailable}
            disabled={saving}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full disabled:opacity-50 ${a.is_available ? "bg-violet/15 text-magenta" : "bg-clay/15 text-clay"}`}
          >
            {a.is_available ? "Available" : "Marked unavailable"}
          </button>
          {a.status === "suspended" ? (
            <button
              onClick={() => onSetStatus(a.id, "active")}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-violet/15 text-magenta"
            >
              Activate
            </button>
          ) : (
            <button
              onClick={() => onSetStatus(a.id, "suspended")}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-ink/10 text-ink/60"
            >
              Deactivate
            </button>
          )}
          <button
            onClick={() => onDelete(a.id)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-clay/15 text-clay"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
        {CHECK_FIELDS.map(([field, label]) => (
          <label key={field} className="flex items-center gap-2 text-sm text-ink/70 bg-parchment rounded-lg px-3 py-2 border border-ink/5">
            <input
              type="checkbox"
              checked={a[field] ?? false}
              onChange={(e) => onToggleCheck(a.id, field, e.target.checked)}
            />
            {label}
          </label>
        ))}
      </div>

      {!editingRates ? (
        <div className="flex flex-wrap items-center gap-3 text-xs text-ink/50 pt-3 border-t border-ink/10">
          <span>Monthly base: {a.monthly_base_pay != null ? `₹${a.monthly_base_pay}` : "—"}</span>
          <span>Hospital day-rate: {a.hospital_daily_rate != null ? `₹${a.hospital_daily_rate}` : "not set — payout can't be estimated"}</span>
          <button onClick={() => setEditingRates(true)} className="font-semibold text-violet hover:underline">
            Edit rates
          </button>
        </div>
      ) : (
        <form onSubmit={saveRates} className="flex flex-wrap items-end gap-2 pt-3 border-t border-ink/10">
          <label className="text-xs text-ink/50">
            Monthly base (₹)
            <input type="number" value={monthlyBase} onChange={(e) => setMonthlyBase(e.target.value)} className="block mt-1 text-sm border border-ink/15 rounded-lg px-2 py-1.5 w-24" />
          </label>
          <label className="text-xs text-ink/50">
            Hospital day-rate (₹)
            <input type="number" value={hospitalDailyRate} onChange={(e) => setHospitalDailyRate(e.target.value)} className="block mt-1 text-sm border border-ink/15 rounded-lg px-2 py-1.5 w-28" placeholder="e.g. 400" />
          </label>
          <button disabled={saving} className="text-xs font-semibold px-3 py-2 rounded-full bg-violet text-white disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={() => setEditingRates(false)} className="text-xs font-semibold px-3 py-2 rounded-full bg-ink/10 text-ink/60">
            Cancel
          </button>
          <p className="w-full text-[10px] text-ink/40">
            Hospital day-rate is what ROSKYRO pays THIS officer per day of Patient Concierge Program coverage.
          </p>
        </form>
      )}
    </div>
  );
}

function AddPartnerForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", status: "applied" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onAdd(form);
      setForm({ full_name: "", phone: "", email: "", status: "applied" });
      setOpen(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not add partner.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm font-semibold px-4 py-2 rounded-full bg-violet text-white">
        + Add partner
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="border border-ink/10 rounded-card p-5 grid sm:grid-cols-2 gap-3">
      <Input label="Full name" value={form.full_name} onChange={set("full_name")} required />
      <Input label="Phone number" value={form.phone} onChange={set("phone")} required />
      <Input label="Email (optional)" value={form.email} onChange={set("email")} />
      <label className="text-sm text-ink/70">
        Starting status
        <select value={form.status} onChange={set("status")} className="mt-1 w-full text-sm border border-ink/15 rounded-lg px-3 py-2 bg-white">
          <option value="applied">Applied (goes through verification)</option>
          <option value="active">Active (already vetted)</option>
        </select>
      </label>
      {error && <p className="sm:col-span-2 text-sm text-clay">{error}</p>}
      <div className="sm:col-span-2 flex gap-2">
        <button disabled={saving} className="text-sm font-semibold px-4 py-2 rounded-full bg-violet text-white disabled:opacity-60">
          {saving ? "Saving…" : "Add partner"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold px-4 py-2 rounded-full bg-ink/10 text-ink/70">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="text-sm text-ink/70 block">
      {label}
      <input {...props} className="mt-1 w-full text-sm border border-ink/15 rounded-lg px-3 py-2" />
    </label>
  );
}

function QuickAddPartnerForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    partner_type: "doctor", name: "", city: "", area: "", contact_number: "",
    whatsapp: "", specialty: "", departments: "", consultation_fee: "", priority_fee: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onAdd({
        ...form,
        consultation_fee: form.consultation_fee ? Number(form.consultation_fee) : null,
        priority_fee: form.priority_fee ? Number(form.priority_fee) : null,
      });
      setForm({ partner_type: "doctor", name: "", city: "", area: "", contact_number: "", whatsapp: "", specialty: "", departments: "", consultation_fee: "", priority_fee: "" });
      setOpen(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not add this partner.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="self-start text-sm font-semibold px-4 py-2 rounded-full bg-violet text-white">
        + Add Partner directly
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="border border-ink/10 rounded-card p-5 grid sm:grid-cols-2 gap-3 h-fit">
      <div className="sm:col-span-2 font-display text-base text-ink">Add Partner directly</div>
      <p className="sm:col-span-2 text-xs text-ink/50 -mt-2">For a doctor/hospital you already verified over WhatsApp or a call — goes live immediately, no application review needed.</p>
      <label className="text-sm text-ink/70 block">
        Type
        <select value={form.partner_type} onChange={set("partner_type")} className="mt-1 w-full text-sm border border-ink/15 rounded-lg px-3 py-2 bg-white">
          <option value="doctor">Doctor</option>
          <option value="hospital">Hospital</option>
        </select>
      </label>
      <Input label="Name" value={form.name} onChange={set("name")} required />
      <Input label="City" value={form.city} onChange={set("city")} required />
      <Input label="Area (optional)" value={form.area} onChange={set("area")} />
      <Input label="Contact number" value={form.contact_number} onChange={set("contact_number")} required />
      <Input label="WhatsApp (optional)" value={form.whatsapp} onChange={set("whatsapp")} />
      {form.partner_type === "doctor" ? (
        <Input label="Specialty" value={form.specialty} onChange={set("specialty")} />
      ) : (
        <Input label="Departments (comma-separated)" value={form.departments} onChange={set("departments")} />
      )}
      <Input label="Consultation fee (₹, optional)" type="number" value={form.consultation_fee} onChange={set("consultation_fee")} />
      <Input label="Priority fee (₹, optional)" type="number" value={form.priority_fee} onChange={set("priority_fee")} />
      {error && <p className="sm:col-span-2 text-sm text-clay">{error}</p>}
      <div className="sm:col-span-2 flex gap-2">
        <button disabled={saving} className="text-sm font-semibold px-4 py-2 rounded-full bg-violet text-white disabled:opacity-60">
          {saving ? "Saving…" : "Add & publish"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold px-4 py-2 rounded-full bg-ink/10 text-ink/70">
          Cancel
        </button>
      </div>
    </form>
  );
}

function QuickAddAppointmentForm({ partners, onAdd }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    partner_id: "", patient_name: "", patient_phone: "", preferred_time: "",
    status: "confirmed", concierge_notes: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onAdd({ ...form, partner_id: Number(form.partner_id) });
      setForm({ partner_id: "", patient_name: "", patient_phone: "", preferred_time: "", status: "confirmed", concierge_notes: "" });
      setOpen(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not log this appointment request.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="self-start text-sm font-semibold px-4 py-2 rounded-full bg-violet text-white">
        + Log Appointment Request
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="border border-ink/10 rounded-card p-5 grid sm:grid-cols-2 gap-3 h-fit">
      <div className="sm:col-span-2 font-display text-base text-ink">Log Appointment Request</div>
      <p className="sm:col-span-2 text-xs text-ink/50 -mt-2">For a patient who requested this over WhatsApp/call — tracked here even without a site login.</p>
      <label className="sm:col-span-2 text-sm text-ink/70 block">
        Partner
        <select value={form.partner_id} onChange={set("partner_id")} required className="mt-1 w-full text-sm border border-ink/15 rounded-lg px-3 py-2 bg-white">
          <option value="">Select partner...</option>
          {partners.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.city}</option>)}
        </select>
      </label>
      <Input label="Patient name" value={form.patient_name} onChange={set("patient_name")} required />
      <Input label="Patient phone" value={form.patient_phone} onChange={set("patient_phone")} required />
      <Input label="Preferred time" value={form.preferred_time} onChange={set("preferred_time")} placeholder="e.g. Tomorrow morning" />
      <label className="text-sm text-ink/70 block">
        Status
        <select value={form.status} onChange={set("status")} className="mt-1 w-full text-sm border border-ink/15 rounded-lg px-3 py-2 bg-white">
          <option value="requested">Requested (not yet confirmed)</option>
          <option value="confirmed">Confirmed</option>
        </select>
      </label>
      <label className="sm:col-span-2 text-sm text-ink/70 block">
        Concierge notes (fee, confirmed slot, etc.)
        <textarea value={form.concierge_notes} onChange={set("concierge_notes")} className="mt-1 w-full text-sm border border-ink/15 rounded-lg px-3 py-2" />
      </label>
      {error && <p className="sm:col-span-2 text-sm text-clay">{error}</p>}
      <div className="sm:col-span-2 flex gap-2">
        <button disabled={saving} className="text-sm font-semibold px-4 py-2 rounded-full bg-violet text-white disabled:opacity-60">
          {saving ? "Saving…" : "Log request"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold px-4 py-2 rounded-full bg-ink/10 text-ink/70">
          Cancel
        </button>
      </div>
    </form>
  );
}

function QuickAddMembershipForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", plan: "doctor_concierge", annual_price: "", mark_as_paid: true });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    setResult(null);
    try {
      const data = await onAdd({ ...form, annual_price: Number(form.annual_price) });
      setResult(data);
      setForm({ full_name: "", phone: "", plan: "doctor_concierge", annual_price: "", mark_as_paid: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Could not add this membership.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="self-start text-sm font-semibold px-4 py-2 rounded-full bg-violet text-white">
        + Add Membership directly
      </button>
    );
  }

  return (
    <div className="max-w-lg">
      <form onSubmit={submit} className="border border-ink/10 rounded-card p-5 grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2 font-display text-base text-ink">Add Membership directly</div>
        <p className="sm:col-span-2 text-xs text-ink/50 -mt-2">For a member who enquired and was called back. There's no fixed fee — enter whatever annual price was agreed with them on the call, based on the doctor/specialization and care needs discussed. If they don't have a site account yet, one is created with a temporary password.</p>
        <Input label="Full name" value={form.full_name} onChange={set("full_name")} required />
        <Input label="Phone number" value={form.phone} onChange={set("phone")} required />
        <label className="text-sm text-ink/70 block">
          Plan
          <select value={form.plan} onChange={set("plan")} className="mt-1 w-full text-sm border border-ink/15 rounded-lg px-3 py-2 bg-white">
            <option value="doctor_concierge">Doctor + Healthcare Concierge</option>
          </select>
        </label>
        <Input label="Annual price agreed (₹)" type="number" min="1" value={form.annual_price} onChange={set("annual_price")} required />
        <label className="flex items-center gap-2 text-sm text-ink/70 mt-6">
          <input type="checkbox" checked={form.mark_as_paid} onChange={(e) => setForm((f) => ({ ...f, mark_as_paid: e.target.checked }))} />
          Payment already confirmed (via WhatsApp/UPI)
        </label>
        {error && <p className="sm:col-span-2 text-sm text-clay">{error}</p>}
        <div className="sm:col-span-2 flex gap-2">
          <button disabled={saving} className="text-sm font-semibold px-4 py-2 rounded-full bg-violet text-white disabled:opacity-60">
            {saving ? "Saving…" : "Add member"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold px-4 py-2 rounded-full bg-ink/10 text-ink/70">
            Close
          </button>
        </div>
      </form>
      {result?.account_created && (
        <div className="mt-3 bg-mist rounded-lg p-4 text-sm text-ink/70">
          New account created. Share this temporary password with the member so they can log in:{" "}
          <strong className="text-ink">{result.temp_password}</strong>
        </div>
      )}
    </div>
  );
}
