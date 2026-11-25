import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLoginPage() {
  const { isAdmin, login } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) navigate("/admin", { replace: true });
  }, [isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <span className="admin-lock-icon">🔒</span>
          <h1>Admin Login</h1>
          <p>Sign in to manage products, images, and filter tags.</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <label className="form-label" htmlFor="admin-password">
            Admin Password
          </label>
          <input
            id="admin-password"
            type="password"
            className="form-input"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
