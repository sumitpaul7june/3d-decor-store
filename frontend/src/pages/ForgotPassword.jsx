// Forgot password page: send reset email to the user's inbox.
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import "./Auth.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPassword() {
  // Controlled email field + page UI states.
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    // Return first validation message; empty string means valid.
    if (!email.trim()) return "Email is required";
    if (!emailRegex.test(email.trim())) return "Invalid email format";
    return "";
  };

  const handleSubmit = async (e) => {
    // Prevent full page reload and validate before API call.
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const { data } = await axios.post("/auth/forgot-password", {
        email: email.trim().toLowerCase()
      });

      setSuccess(data?.message || "Reset link sent to your email");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="auth-kicker">QALARAHI</p>
        <h1>Forgot password</h1>

        <p className="auth-helper-text">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          {error && <span className="error">{error}</span>}
          {success && <span className="success-message">{success}</span>}

          <div className="auth-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </div>
        </form>

        <p className="auth-switch">
          Remembered your password? <Link to="/login">Back to login</Link>
        </p>
      </div>
    </section>
  );
}

export default ForgotPassword;
