import { useState } from "react";
auth-api
import { loginUser } from "../api/auth";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaBrain } from "react-icons/fa";
import { authService } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  main

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
auth-api
    try {
      await loginUser(email, password);
      window.location.href = "/";
    } catch (err) {
      setError(err.message)
    setLoading(true);
    try {
      await authService.login(form);
      // This navigate() call is the piece that's easy to miss —
      // without it, a successful login has nowhere to send the user.
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
main
    }
  };

  return (
auth-api
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <form
        onSubmit={handleSubmit}
        className="glass-panel p-8 rounded-2xl w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold text-white">Login</h1>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-700"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-700"
          required
        />

        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
        >
          Log In
        </button>
      </form>
    </div>
  );
};

    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <FaBrain className="auth-brand-icon" />
          <h1>Intelligent Cognitive Alarm</h1>
          <p className="auth-tagline">Wake Smarter. Think Faster.</p>
        </div>

        <h2 className="auth-heading">Welcome Back</h2>
        <p className="auth-subheading">Sign in to continue your journey</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="email">Email</label>
          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <label htmlFor="password">Password</label>
          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-gradient btn-block" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
main
