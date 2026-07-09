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
  const user = useAuthStore(state => state.user);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const [alarms, setAlarms] = useState([]);

  useEffect(() => {
    const fetchAlarms = async () => {
      try {
        const res = await apiClient.get('/alarms');
        setAlarms(res.data.data);
      } catch (err) {
        console.error("Failed to fetch alarms", err);
      }
    };
    fetchAlarms();
  }, []);

  const activeAlarmsCount = alarms.filter(a => a.is_active).length;
  const nextAlarm = alarms.filter(a => a.is_active).sort((a, b) => a.alarm_time.localeCompare(b.alarm_time))[0];

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <div>
          <h2>
            {greeting}, {user?.username || "there"}! 👋
          </h2>
          <p>Manage your cognitive alarms effortlessly.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/practice" className="btn-gradient btn-inline">
            <FaBrain /> Practice
          </Link>
          <Link to="/alarms" className="btn-gradient btn-inline">
            <FaPlus /> New Alarm
          </Link>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <FaBell />
          </div>
          <div>
            <p className="stat-label">Active Alarms</p>
            <h3>{activeAlarmsCount}</h3>
            <p className="stat-sub">You have {activeAlarmsCount} active alarms set</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <FaBrain />
          </div>
          <div>
            <p className="stat-label">Habit Score</p>
            <h3>88%</h3>
            <p className="stat-sub">Great consistency!</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon lavender">
            <FaClock />
          </div>
          <div>
            <p className="stat-label">Next Alarm</p>
            <h3>{nextAlarm ? nextAlarm.alarm_time : "--:--"}</h3>
            <p className="stat-sub">{nextAlarm ? "Scheduled" : "No active alarms"}</p>
          </div>
        </div>
      </div>

      <div className="upcoming-section">
        <h3>
          <FaCalendarAlt /> Upcoming Alarms
        </h3>
        <div className="alarm-list">
          {alarms.length > 0 ? alarms.map((alarm) => {
            const Icon = getCategoryIcon(alarm.challenge_category);
            const statusKey = alarm.is_active ? "active" : "inactive";
            return (
              <div className="alarm-item" key={alarm.id}>
                <div className={`alarm-icon ${statusKey}`}>
                  <Icon />
                </div>
                <div className="alarm-info">
                  <h4>{alarm.alarm_time}</h4>
                  <p className="capitalize">{alarm.challenge_category} Challenge</p>
                </div>
                <span className={`alarm-status ${statusKey}`}>{statusLabel[alarm.is_active]}</span>
                <FaChevronRight className="alarm-chevron" />
              </div>
            );
          }) : <p>No alarms found. Create one!</p>}
        </div>
      </div>

      <footer className="dashboard-footer">
        <FaBrain /> © 2026 Intelligent Cognitive Alarm Platform
      </footer>
    </div>
  );
}