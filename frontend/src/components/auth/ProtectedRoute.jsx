import { Navigate, Outlet } from "react-router-dom";
import { authService } from "../../services/authService";

// Wraps protected routes. If there's no session, bounce to /login.
// This is the piece that's usually missing when "dashboard doesn't show up" —
// either this guard isn't wired into the route tree, or login never calls navigate().
export default function ProtectedRoute() {
  return authService.isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}