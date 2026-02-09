// Login page with basic validation and mock authentication.
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import GoogleAuthButton from "../components/GoogleAuthButton";
import { loginStart, loginSuccess } from "../store/authSlice";
import "./Auth.css";

function Login() {
  // Local form state
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

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
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");

    dispatch(loginStart());

    setTimeout(() => {
      dispatch(
        loginSuccess({
          id: Date.now(),
          name: "Demo User",
          email: form.email,
          role : "admin"
        })
      );

      navigate(redirectTo, { replace: true });
    }, 500);
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
            />
          </label>

          {error && <span className="error">{error}</span>}

          <div className="auth-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

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
