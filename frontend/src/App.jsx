import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { AlarmsPage } from "./pages/Alarms";
import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useAuthStore } from "./store/useAuthStore";
import "./index.css";
import "./App.css";
import Profile from "./pages/Profile";

function DashboardLayout() {
  return (
    <>
      <Navbar />
      <Dashboard />
    </>
  );
}

function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
        />

        {/* Protected area */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />} />
          <Route path="/alarms" element={<><Navbar /><div className="max-w-7xl mx-auto p-4"><AlarmsPage /></div></>} />
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
        </Route>
        {/* Fallback: send authenticated users home, everyone else to login */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;