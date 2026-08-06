import { Link, useNavigate } from "react-router-dom";
import {
  FaBrain,
  FaHome,
  FaUserCircle,
  FaSignOutAlt,
  FaClock,
  FaChartLine,
  FaUserFriends,
} from "react-icons/fa";

import { useAuthStore } from "../../store/useAuthStore";

export default function Navbar() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

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

        {user?.role?.toLowerCase() === "coach" && (
          <Link to="/coach" className="navbar-link">
            <FaUserFriends /> Coach
          </Link>
        )}

        {(user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "administrator") && (
          <Link to="/admin" className="navbar-link">
            <FaUserCircle /> Admin
          </Link>
        )}

        <Link to="/profile" className="navbar-link">
          <FaUserCircle /> Profile
        </Link>

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