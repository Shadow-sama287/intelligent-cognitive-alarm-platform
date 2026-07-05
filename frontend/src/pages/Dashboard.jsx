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
import { authService } from "../services/authService";

// Mock data — swap for a real fetch once the backend is ready.
const alarms = [
  { id: 1, time: "06:30 AM", task: "Math Challenge", status: "active", icon: FaCalculator },
  { id: 2, time: "08:00 AM", task: "Memory Puzzle", status: "tomorrow", icon: FaPuzzlePiece },
  { id: 3, time: "09:30 PM", task: "Logic Quiz", status: "inactive", icon: FaQuestionCircle },
];

const statusLabel = {
  active: "Active",
  tomorrow: "Tomorrow",
  inactive: "Inactive",
};

export default function Dashboard() {
  const user = authService.getCurrentUser();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <div>
          <h2>
            {greeting}, {user?.username || "there"}! 👋
          </h2>
          <p>Manage your cognitive alarms effortlessly.</p>
        </div>
        <button type="button" className="btn-gradient btn-inline">
          <FaPlus /> New Alarm
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <FaBell />
          </div>
          <div>
            <p className="stat-label">Active Alarms</p>
            <h3>3</h3>
            <p className="stat-sub">You have 3 alarms set</p>
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
            <h3>06:30 AM</h3>
            <p className="stat-sub">In 2h 15m</p>
          </div>
        </div>
      </div>

      <div className="upcoming-section">
        <h3>
          <FaCalendarAlt /> Upcoming Alarms
        </h3>
        <div className="alarm-list">
          {alarms.map(({ id, time, task, status, icon: Icon }) => (
            <div className="alarm-item" key={id}>
              <div className={`alarm-icon ${status}`}>
                <Icon />
              </div>
              <div className="alarm-info">
                <h4>{time}</h4>
                <p>{task}</p>
              </div>
              <span className={`alarm-status ${status}`}>{statusLabel[status]}</span>
              <FaChevronRight className="alarm-chevron" />
            </div>
          ))}
        </div>
      </div>

      <footer className="dashboard-footer">
        <FaBrain /> © 2026 Intelligent Cognitive Alarm Platform
      </footer>
    </div>
  );
}