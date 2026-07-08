import { Link, useNavigate } from "react-router-dom";
import { FaBrain, FaHome, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useAuthStore } from "../../store/useAuthStore";

export default function Navbar() {
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);

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
        <Link to="/profile" className="navbar-link">
          <FaUserCircle /> Profile
        </Link>
        <button type="button" className="navbar-logout" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </nav>
    </header>
  );
}