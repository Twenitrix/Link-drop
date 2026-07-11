// App.tsx — Root component. Sets up routing.
//
// Routes:
//   /           → redirect to /login or /dashboard
//   /login      → Login page (public)
//   /register   → Register page (public)
//   /dashboard  → Dashboard (protected — redirect to /login if not logged in)
//
// ProtectedRoute: checks for token in localStorage.
// This is a client-side check — the server ALSO validates the token on every request.
// The frontend check is just for UX (don't show dashboard UI if not logged in).

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

// Simple auth check: does a token exist in localStorage?
// The API client handles the case where the token is expired (auto-logout in interceptor)
function isLoggedIn(): boolean {
  return !!localStorage.getItem("access_token");
}

// Wrapper component for protected routes
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to dashboard or login */}
        <Route
          path="/"
          element={<Navigate to={isLoggedIn() ? "/dashboard" : "/login"} replace />}
        />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
