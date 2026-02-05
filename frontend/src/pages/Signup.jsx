import "./Auth.css";
import { useState } from "react";

function Signup() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Takes the old form and add the new input data --- the [name] searches the key ....if it's exist and update the value if it doesn't find then it would create the new key and value pair
    // setForm({ ...form, [name]: value });
    setForm((prevForm) => {
      return {
        ...prevForm,
        [name]: value,
      };
    });
    
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (form.fullName.trim().length < 2) {
      newErrors.fullName = "Please enter your full name";
    }

    if (!form.email.includes("@")) {
      newErrors.email = "Please enter a valid email";
    }

    if (form.password.length < 6) {
      newErrors.password = "Password must be atlease 6 characters";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Password do not match";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Signup data", form);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>Create account</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Full Name */}
          <label>
            Name
            <input
             type="text" 
             name="fullName"
             value={form.fullName}
             onChange={handleChange}
             
             />

             {errors.fullName && (<span className="error">{errors.fullName}</span>)}
          </label>


         {/* Email */}
          <label>
            Email
            <input 
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange} />

            {
              errors.email && (<span className="error">{errors.email}</span>)
            }
          </label>

          {/* Password */}
          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              />
              {errors.password && (
              <span className="error">{errors.password}</span>
            )}
          </label>

           {/* Confirm Password */}
           <label>
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <span className="error">{errors.confirmPassword}</span>
            )}
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
