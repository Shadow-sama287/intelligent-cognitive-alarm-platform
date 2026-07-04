import { Link, useNavigate } from "react-router-dom";
import { FaBrain, FaHome, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { authService } from "../../services/authService";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
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
        <button type="button" className="navbar-link navbar-link-btn">
          <FaUserCircle /> Profile
        </button>
        <button type="button" className="navbar-logout" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </nav>
    </header>
  );
}