import "./Auth.css"


function Signup() {
  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>Create account</h1>

        <form className="auth-form">
          <label>
            Name
            <input type="text" />
          </label>

          <label>
            Email
            <input type="email" />
          </label>

          <label>
            Password
            <input type="password" />
          </label>

          <button type="submit">Sign up</button>
        </form>

        <p className="auth-switch">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </section>
  );
}

export default Signup;
