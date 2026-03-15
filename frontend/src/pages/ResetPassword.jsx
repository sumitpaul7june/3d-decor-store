// Reset password page: accepts token from email link and sets a new password.
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";
import "./Auth.css";

// At least 8 chars with uppercase + lowercase + number + special char.
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+[\]{};:'",.<>/\\|`~]).{8,}$/;

function ResetPassword() {
  // Reset token comes from backend email link.
  const { token } = useParams();
  const navigate = useNavigate();

  // Controlled password form state.
  const [form, setForm] = useState({
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    // Update the changed field in form state.
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    // Return field errors object; empty object means valid.
    const next = {};

    if (!form.password) next.password = "Password is required";
    else if (!passwordRegex.test(form.password)) {
      next.password =
        "Min 8 chars, include uppercase, lowercase, number, and special character";
    }

    if (!form.confirmPassword) next.confirmPassword = "Confirm your password";
    else if (form.confirmPassword !== form.password) {
      next.confirmPassword = "Passwords do not match";
    }

    return next;
  };

  const handleSubmit = async (e) => {
    // Run validation before sending the reset request.
    e.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const { data } = await axios.put(`/auth/reset-password/${token}`, {
        password: form.password
      });

      navigate("/login", {
        replace: true,
        state: {
          message: data?.message || "Password reset successful. Please login."
        }
      });
    } catch (err) {
      setErrors({
        api: err.response?.data?.message || "Failed to reset password"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>Reset password</h1>

        <p className="auth-helper-text">
          Set a new password for your account.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            New Password
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <span className="error">{errors.password}</span>}
          </label>

          <label>
            Confirm Password
            <div className="password-field">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error">{errors.confirmPassword}</span>
            )}
          </label>

          {errors.api && <span className="error">{errors.api}</span>}

          <div className="auth-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </div>
        </form>

        <p className="auth-switch">
          Back to <Link to="/login">login</Link>
        </p>
      </div>
    </section>
  );
}

export default ResetPassword;
