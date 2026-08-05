import { Link, useNavigate } from "react-router-dom";
import {
  FaBrain,
  FaHome,
  FaUserCircle,
  FaSignOutAlt,
  FaClock,
  FaChartLine,
  FaUserFriends,
  FaMoon,
  FaSun,
} from "react-icons/fa";

import { useAuthStore } from "../../store/useAuthStore";
import { useTheme } from "../../context/ThemeContext";

export default function Navbar() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <FaBrain className="navbar-icon" />
        <div>
          <h1>Intelligent Cognitive Alarm</h1>
          <p>Wake Smarter. Think Faster.</p>
        </div>
      </div>

      <nav className="navbar-links">
        <Link to="/dashboard" className="navbar-link">
          <FaHome /> Dashboard
        </Link>

        <Link to="/alarms" className="navbar-link">
          <FaClock /> Alarms
        </Link>

        <Link to="/practice" className="navbar-link">
          <FaBrain /> Practice
        </Link>

        <Link to="/analytics" className="navbar-link">
          <FaChartLine /> Analytics
        </Link>

        <Link to="/coach" className="navbar-link">
          <FaUserFriends /> Coach
        </Link>

        <Link to="/profile" className="navbar-link">
          <FaUserCircle /> Profile
        </Link>

        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
        >
          {theme === "dark" ? <FaSun /> : <FaMoon />}
        </button>

        <button
          type="button"
          className="navbar-logout"
          onClick={handleLogout}
        >
          <FaSignOutAlt /> Logout
        </button>
      </nav>
    </header>
  );
}