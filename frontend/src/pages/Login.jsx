// Login page with basic validation and mock authentication.
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import GoogleAuthButton from "../components/GoogleAuthButton";
import { loginFailure, loginStart, loginSuccess } from "../store/authSlice";
import axios from "../api/axios";  
import "./Auth.css";

const mapAuthErrorMessage = (message) => {
  // Keep backend auth errors readable in UI.
  return message || "Login Failed";
};

function Login() {
  // Local form state
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  // Toggle plain-text password visibility.
  const [showPassword, setShowPassword] = useState(false);

  // Redux
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  // Router helpers
  const navigate = useNavigate();
  const location = useLocation();

  // Where to redirect after login (protected page or home).
  let redirectTo;

  if (location.state && location.state.from) {
    // 1. If there is a "saved location" (like Profile)
    redirectTo = location.state.from;
  } else {
    // 2. If not (user just clicked Login normally)
    redirectTo = "/"; // Go to Home
  }

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle login submit
  const validate = () => {
    // Return first validation error string (empty string means valid).
    if (!form.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return "Invalid email format";
    }
    if (!form.password) return "Password is required";
    return "";
  };

  const handleSubmit = async (e) => {
    // Stop full-page refresh and run client-side validation first.
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try{
      dispatch(loginStart());
      setError("");
      const {data} = await axios.post("/auth/login", {
        email : form.email.trim().toLowerCase(),
        password: form.password

      })

      dispatch(loginSuccess(data));
      navigate(redirectTo, { replace: true });

    }
    catch(err)
    {
      const rawMessage = err.response?.data?.message;
      const message = mapAuthErrorMessage(rawMessage);
      dispatch(loginFailure(message));
      setError(message);
    }
   
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>

        {/* Login form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Password
            {/* Password input + show/hide button */}
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {error && <span className="error">{error}</span>}

          <div className="auth-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Divider + social auth option */}
            <div className="auth-divider">or</div>

            <GoogleAuthButton text="Login with Google" />
          </div>
        </form>

        <p className="auth-switch">
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
