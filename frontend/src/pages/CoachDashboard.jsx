import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Send,
  CheckCircle2,
  X,
  AlarmClockOff,
  Activity,
  UserPlus,
  Trash2,
} from "lucide-react";
import { apiClient } from "../api/client";

const STATUS_STYLES = {
  Healthy: "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800",
  "Needs Attention": "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800",
  "High Snooze": "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 ring-1 ring-rose-200 dark:ring-rose-800",
  Improving: "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-800",
  "Pending Invite": "bg-yellow-100 dark:bg-yellow-950/80 text-yellow-800 dark:text-yellow-300 ring-1 ring-yellow-300 dark:ring-yellow-800",
  "Invite Declined": "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 ring-1 ring-gray-200 dark:ring-slate-700",
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 ring-1 ring-gray-200 dark:ring-slate-700";
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
}

function SummaryCard({ icon: Icon, label, value, accent }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800
                 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className={`absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-10 ${accent.bg}`} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent.bg} ${accent.text}
                      transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

export default function CoachDashboard() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, clientName: "" });
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [adviceSentToday, setAdviceSentToday] = useState(0);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/coach/clients");
      setClients(res.data.data || []);
      if (res.data.advice_sent_today !== undefined) {
        setAdviceSentToday(res.data.advice_sent_today);
      }
    } catch (err) {
      console.error("Failed to load coach clients", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const summary = useMemo(() => {
    const acceptedClients = clients.filter((c) => c.invitation_status === "accepted");
    const total = acceptedClients.length;
    const flagged = acceptedClients.filter(
      (c) => c.status === "Needs Attention" || c.status === "High Snooze"
    ).length;
    const avgHabitScore = total
      ? Math.round(acceptedClients.reduce((sum, c) => sum + (c.habitScore || 0), 0) / total)
      : 0;
    return { total, flagged, avgHabitScore, totalInvites: clients.length };
  }, [clients]);

  const flaggedClients = useMemo(
    () => clients.filter((c) => c.invitation_status === "accepted" && c.reasons && c.reasons.length > 0),
    [clients]
  );

  const [adviceModal, setAdviceModal] = useState({ open: false, client: null });
  const [adviceText, setAdviceText] = useState("");
  const [sendingAdvice, setSendingAdvice] = useState(false);

  const openAdviceModal = (client) => {
    setAdviceModal({ open: true, client });
    setAdviceText("");
  };

  const handleAdviceSubmit = async (e) => {
    e.preventDefault();
    if (!adviceText.trim() || !adviceModal.client) return;
    setSendingAdvice(true);
    try {
      await apiClient.post("/coach/advice", {
        client_id: adviceModal.client.client_id || adviceModal.client.id,
        message: adviceText.trim()
      });
      setAdviceSentToday((prev) => prev + 1);
      setModal({ open: true, clientName: adviceModal.client.name });
      setAdviceModal({ open: false, client: null });
      setAdviceText("");
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to send advice");
    } finally {
      setSendingAdvice(false);
    }
  };

  const handleSendAdvice = (client) => {
    openAdviceModal(client);
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setInviteError("");
    setInviteLoading(true);
    try {
      await apiClient.post("/coach/invite", { client_email: inviteEmail });
      setInviteEmail("");
      setInviteModalOpen(false);
      await fetchClients();
      alert("Invitation sent successfully! The user will see a banner to accept on their dashboard.");
    } catch (err) {
      setInviteError(err.response?.data?.detail || "Failed to send invite");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRevoke = async (clientId) => {
    if (!window.confirm("Are you sure you want to remove this client link?")) return;
    try {
      await apiClient.delete(`/coach/clients/${clientId}`);
      await fetchClients();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to remove link");
    }
  };

  const closeModal = () => setModal({ open: false, clientName: "" });

  const QUICK_SUGGESTIONS = [
    "Shift bedtime 30 minutes earlier to reduce snooze tendencies.",
    "Try solving 2 practice challenges before sleep to sharpen morning focus.",
    "Your wake consistency is outstanding this week! Keep it up!",
    "Avoid hitting snooze — progressive challenge difficulty is enabled."
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Wellness Coach Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400 sm:text-base">
              Monitor your clients' wake and habit patterns, invite new clients, and send personalized guidance.
            </p>
          </div>

          <button
            onClick={() => setInviteModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-700 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Invite New Client
          </button>
        </div>

        {/* Summary Cards */}
        <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={Users}
            label="Accepted Clients"
            value={summary.total}
            accent={{ bg: "bg-indigo-500", text: "text-indigo-600" }}
          />
          <SummaryCard
            icon={AlertTriangle}
            label="Flagged Clients"
            value={summary.flagged}
            accent={{ bg: "bg-rose-500", text: "text-rose-600" }}
          />
          <SummaryCard
            icon={TrendingUp}
            label="Average Habit Score"
            value={summary.avgHabitScore}
            accent={{ bg: "bg-emerald-500", text: "text-emerald-600" }}
          />
          <SummaryCard
            icon={Send}
            label="Advice Sent Today"
            value={adviceSentToday}
            accent={{ bg: "bg-purple-500", text: "text-purple-600" }}
          />
        </div>

        {/* Client Analytics Table */}
        <div className="mb-10 overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 px-6 py-5">
            <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Client Analytics & Invitations</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/80">
                <tr>
                  {["Client Name", "Email", "Habit Score", "Avg Snoozes", "Wake Consistency", "Status", "Action"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">
                      Loading clients…
                    </td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">
                      No clients or invites found. Click "Invite New Client" to start!
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr
                      key={client.id}
                      className="transition-colors duration-150 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                        {client.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {client.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {client.invitation_status === "accepted" ? client.habitScore : "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {client.invitation_status === "accepted" ? client.avgSnoozes : "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {client.invitation_status === "accepted" ? `${client.wakeConsistency}%` : "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <StatusBadge status={client.status} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          {client.invitation_status === "accepted" && (
                            <button
                              onClick={() => handleSendAdvice(client)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5
                                         text-xs font-semibold text-white shadow-sm transition-all duration-200
                                         hover:bg-indigo-700 hover:shadow-md active:scale-95 cursor-pointer"
                            >
                              <Send className="h-3.5 w-3.5" />
                              Send Advice
                            </button>
                          )}
                          <button
                            onClick={() => handleRevoke(client.client_id || client.id)}
                            title="Remove Client"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Flagged Clients Section */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <div className="mb-5 flex items-center gap-2">
            <AlarmClockOff className="h-5 w-5 text-rose-500" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Clients Requiring Attention</h2>
          </div>

          {flaggedClients.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No active clients currently need intervention. 🎉</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {flaggedClients.map((client) => (
                <div
                  key={client.id}
                  className="rounded-xl border border-rose-100 dark:border-rose-950/60 bg-rose-50/50 dark:bg-rose-950/20 p-5 transition-all
                             duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{client.name}</h3>
                    <StatusBadge status={client.status} />
                  </div>
                  <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                    Habit Score: <span className="font-semibold text-slate-700 dark:text-slate-200">{client.habitScore}</span>
                  </p>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Reason
                  </p>
                  <ul className="space-y-1">
                    {client.reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-rose-400" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSendAdvice(client)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg
                               bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-200 dark:ring-indigo-800
                               transition-all duration-200 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send Advice
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Send Advice Input Modal */}
      {adviceModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs px-4"
          onClick={() => setAdviceModal({ open: false, client: null })}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Send Guidance to {adviceModal.client?.name}
                </h3>
              </div>
              <button
                onClick={() => setAdviceModal({ open: false, client: null })}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
              Select a quick suggestion or type a custom guidance message for your client.
            </p>

            {/* Suggestion Chips */}
            <div className="mb-4 flex flex-wrap gap-2">
              {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAdviceText(suggestion)}
                  className="rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors text-left px-2.5 py-1 text-xs font-medium cursor-pointer"
                >
                  💡 {suggestion}
                </button>
              ))}
            </div>

            <form onSubmit={handleAdviceSubmit}>
              <textarea
                required
                rows={4}
                placeholder="Type personalized coaching guidance here..."
                value={adviceText}
                onChange={(e) => setAdviceText(e.target.value)}
                className="mb-4 w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAdviceModal({ open: false, client: null })}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingAdvice}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 cursor-pointer shadow-md"
                >
                  {sendingAdvice ? "Sending..." : "Send Guidance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs px-4"
          onClick={() => setInviteModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Invite Client to Coaching</h3>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
              Enter the registered user's email address. They will receive an invitation banner on their Dashboard to accept or decline.
            </p>
            {inviteError && <div className="mb-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 p-2.5 text-xs text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800">{inviteError}</div>}
            <form onSubmit={handleInviteSubmit}>
              <input
                type="email"
                required
                placeholder="client@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="mb-4 w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={inviteLoading}
                className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 cursor-pointer shadow-md"
              >
                {inviteLoading ? "Sending Invite..." : "Send Invitation"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Advice Sent Success Modal */}
      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs px-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Advice Sent</h3>
              </div>
              <button
                onClick={closeModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Advice sent successfully to <span className="font-semibold text-slate-900 dark:text-slate-100">{modal.clientName}</span>.
            </p>
            <button
              onClick={closeModal}
              className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white
                         transition-colors duration-200 hover:bg-indigo-700 cursor-pointer shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}