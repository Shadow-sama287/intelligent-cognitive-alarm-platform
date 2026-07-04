import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { authService } from "./services/authService";
import "./index.css";
import "./App.css";

function DashboardLayout() {
  return (
    <>
      <Navbar />
      <Dashboard />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={authService.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={authService.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Register />}
        />

        {/* Protected area */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />} />
        </Route>

        {/* Fallback: send authenticated users home, everyone else to login */}
        <Route
          path="*"
          element={<Navigate to={authService.isAuthenticated() ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;