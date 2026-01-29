import "./Auth.css";

function Login() {
  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>Welcome</h1>

        <form className="auth-form">
          <label>
            Email
            <input type="email" />
          </label>

          <label>
            Password
            <input type="password" />
          </label>

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
