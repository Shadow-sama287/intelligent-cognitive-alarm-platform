import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Practice from "./pages/Practice";
import { AlarmsPage } from "./pages/Alarms";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import { AnalyticsPage } from "./pages/Analytics";
import CoachDashboard from "./pages/CoachDashboard";

import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useAuthStore } from "./store/useAuthStore";

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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authReady = useAuthStore((state) => state.authReady);
  const init = useAuthStore((state) => state.init);

  useEffect(() => {
    init();
  }, [init]);

  if (!authReady) {
    return null;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register />
            )
          }
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />} />

          <Route
            path="/practice"
            element={
              <>
                <Navbar />
                <Practice />
              </>
            }
          />

          <Route
            path="/alarms"
            element={
              <>
                <Navbar />
                <div className="max-w-7xl mx-auto p-4">
                  <AlarmsPage />
                </div>
              </>
            }
          />

          <Route
            path="/analytics"
            element={
              <>
                <Navbar />
                <div className="max-w-7xl mx-auto p-4">
                  <AnalyticsPage />
                </div>
              </>
            }
          />

          <Route
            path="/coach"
            element={
              <>
                <Navbar />
                <div className="max-w-7xl mx-auto p-4">
                  <CoachDashboard />
                </div>
              </>
            }
          />

          <Route
            path="/profile"
            element={
              <>
                <Navbar />
                <div className="max-w-7xl mx-auto p-4">
                  <Profile />
                </div>
              </>
            }
          />

          <Route
            path="/admin"
            element={
              <>
                <Navbar />
                <div className="max-w-7xl mx-auto p-4">
                  <Admin />
                </div>
              </>
            }
          />
        </Route>

        {/* Fallback Route */}
        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? "/dashboard" : "/login"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;