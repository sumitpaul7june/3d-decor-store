import { useState } from "react";
import "./Auth.css";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
    console.log("Login data:", form);
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

          <button type="submit">Login</button>
        </form>

        <p className="auth-switch">
          Don’t have an account? <a href="/signup">Sign up</a>
        </p>
      </div>
    </section>
  );
}

export default Login;
