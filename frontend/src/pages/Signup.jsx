// Signup page with frontend validation and Google sign-up option.
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import GoogleAuthButton from "../components/GoogleAuthButton";
import { loginFailure, loginStart, loginSuccess } from "../store/authSlice";
import axios from "../api/axios";
import "./Auth.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// At least 8 chars with uppercase + lowercase + number + special char.
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+[\]{};:'",.<>/\\|`~]).{8,}$/;

const mapAuthErrorMessage = (message) => {
  // Keep backend auth errors readable in UI.
  return message || "Signup failed";
};

function Signup() {
  // Controlled form values.
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  // Show/hide toggles for password fields.
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    // Generic handler for all inputs.
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    // Return field errors object; empty object means valid.
    const next = {};

    if (!form.fullName.trim()) next.fullName = "Name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!emailRegex.test(form.email.trim())) next.email = "Invalid email format";

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
    // Run frontend validation before sending request.
    e.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    try {
      dispatch(loginStart());
      const { data } = await axios.post("/auth/register", {
        name: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      dispatch(loginSuccess(data));
      navigate("/", { replace: true });
    } catch (err) {
      const rawMessage = err.response?.data?.message;
      const message = mapAuthErrorMessage(rawMessage);
      dispatch(loginFailure(message));
      setErrors({ api: message });
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>Create account</h1>

        {/* Signup form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
            />
            {errors.fullName && <span className="error">{errors.fullName}</span>}
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </label>

          <label>
            Password
            {/* Password input with visibility toggle */}
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
            {/* Confirm input with separate visibility toggle */}
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
              {loading ? "Creating account..." : "Sign up"}
            </button>
            {/* Divider + social auth option */}
            <div className="auth-divider">or</div>
            <GoogleAuthButton text="Sign up with Google" />
          </div>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
}

export default Signup;
