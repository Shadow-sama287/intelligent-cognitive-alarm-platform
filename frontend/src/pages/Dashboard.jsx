import { useEffect, useState } from "react";
import {
  FaPlus,
  FaBell,
  FaBrain,
  FaClock,
  FaCalendarAlt,
  FaCalculator,
  FaPuzzlePiece,
  FaQuestionCircle,
  FaChevronRight,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { apiClient } from "../api/client";

const statusLabel = {
  true: "Active",
  false: "Inactive",
};

const getCategoryIcon = (category) => {
  switch (category?.toLowerCase()) {
    case "math":
      return FaCalculator;
    case "memory":
      return FaPuzzlePiece;
    case "logic":
    default:
      return FaQuestionCircle;
  }
};

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const [alarms, setAlarms] = useState([]);

  useEffect(() => {
    const fetchAlarms = async () => {
      try {
        const res = await apiClient.get("/alarms");
        setAlarms(res.data.data);
      } catch (err) {
        console.error("Failed to fetch alarms", err);
      }
    };
    fetchAlarms();
  }, []);

  const activeAlarmsCount = alarms.filter((a) => a.is_active).length;
  const nextAlarm = alarms
    .filter((a) => a.is_active)
    .sort((a, b) => a.alarm_time.localeCompare(b.alarm_time))[0];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            {greeting}, {user?.username || "there"}! 👋
          </h1>
          <p className="text-slate-500 text-sm">
            Manage your cognitive alarms effortlessly.
          </p>
        </div>
        <Link
          to="/alarms"
          className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-md font-semibold flex items-center gap-2 transition-colors shadow-sm w-fit"
        >
          <FaPlus /> New Alarm
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Active Alarms */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Active Alarms
          </p>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-bold text-slate-900">{activeAlarmsCount}</span>
            <span className="text-slate-500 text-sm mb-1">alarms</span>
          </div>
          <p className="text-xs text-slate-500">
            You have {activeAlarmsCount} active alarm{activeAlarmsCount !== 1 ? "s" : ""} set
          </p>
          <div className="mt-4 w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <FaBell className="text-indigo-500" />
          </div>
        </div>

        {/* Habit Score */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Habit Score
          </p>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-bold text-slate-900">88</span>
            <span className="text-slate-500 text-sm mb-1">%</span>
          </div>
          <p className="text-xs text-slate-500">Great consistency!</p>
          <div className="mt-4">
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: "88%" }} />
            </div>
          </div>
        </div>

        {/* Next Alarm */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Next Alarm
          </p>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-bold text-slate-900">
              {nextAlarm ? nextAlarm.alarm_time : "--:--"}
            </span>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <FaClock className="text-amber-500" />
            {nextAlarm ? "Scheduled today" : "No active alarms"}
          </p>
          <div className="mt-4 w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <FaClock className="text-amber-500" />
          </div>
        </div>
      </div>

      {/* Upcoming Alarms */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-5">
          <FaCalendarAlt className="text-slate-400" /> Upcoming Alarms
        </h2>
        <div className="space-y-3">
          {alarms.length > 0 ? (
            alarms.map((alarm) => {
              const Icon = getCategoryIcon(alarm.challenge_category);
              const isActive = alarm.is_active;
              return (
                <div
                  key={alarm.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? "bg-indigo-50 text-indigo-500" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Icon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900">{alarm.alarm_time}</h4>
                    <p className="text-xs text-slate-500 capitalize">{alarm.challenge_category} Challenge</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {statusLabel[isActive]}
                  </span>
                  <FaChevronRight className="text-slate-300 text-xs shrink-0 group-hover:text-slate-500 transition-colors" />
                </div>
              );
            })
          ) : (
            <p className="text-slate-500 text-sm text-center py-6">
              No alarms found.{" "}
              <Link to="/alarms" className="text-indigo-500 font-semibold hover:underline">
                Create one!
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 flex items-center justify-center gap-2 py-4">
        <FaBrain className="text-slate-400" />
        © 2026 Intelligent Cognitive Alarm Platform
      </footer>
    </div>
  );
}
