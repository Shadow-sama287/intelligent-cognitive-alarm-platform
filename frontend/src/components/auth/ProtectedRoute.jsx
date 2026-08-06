import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

// Wraps protected routes. If there's no session, bounce to /login.
export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated ? (
    <div className="theme-web min-h-screen bg-background text-on-background transition-colors">
      <Outlet />
    </div>
  ) : <Navigate to="/login" replace />;
}