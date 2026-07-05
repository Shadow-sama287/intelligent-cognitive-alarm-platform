// Mock auth service — no backend, just localStorage.
// Swap the internals of these three functions for real API calls later;
// the shape (throws on failure, resolves on success) stays the same.

const USERS_KEY = "ica_users";
const SESSION_KEY = "ica_session";

const readUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
const writeUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));
const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  async register({ username, email, password }) {
    await delay();
    const users = readUsers();

    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("An account with this email already exists.");
    }

    users.push({ username, email, password });
    writeUsers(users);
    return { username, email };
  },

  async login({ email, password }) {
    await delay();
    const users = readUsers();
    const match = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!match) {
      throw new Error("Incorrect email or password.");
    }

    const session = { username: match.username, email: match.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser() {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem(SESSION_KEY);
  },
};