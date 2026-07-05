auth-api
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { authService } from "./services/authService";
import "./index.css";
import "./App.css";
main

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
auth-api
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
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
main
    </BrowserRouter>
  );
}

export default App;