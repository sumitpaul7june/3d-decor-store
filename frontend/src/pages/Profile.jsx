// Profile page showing account details and quick actions.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import "./Profile.css";

function Profile() {
  // Profile loading states.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch current user profile from backend.
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await axios.get("/users/profile");
        setUser(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <section className="profile-page">
        <div className="profile-card">
          <h1>My profile</h1>
          <p>Loading profile...</p>
        </div>
      </section>
    );
  }

  if (error || !user) {
    return (
      <section className="profile-page">
        <div className="profile-card">
          <h1>My profile</h1>
          <p>{error || "Unable to load profile"}</p>
        </div>
      </section>
    );
  }

  // Display account creation date in a human-readable format.
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : "-";

  return (
    <section className="profile-page">
      <div className="profile-shell">
        {/* Left: user identity card */}
        <aside className="profile-hero-card">
          <div className="profile-avatar">
            {user.name?.trim()?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <h1>{user.name}</h1>
          <p>{user.email}</p>
        </aside>

        {/* Right: account details and quick links */}
        <div className="profile-main">
          <article className="profile-card">
            <div className="profile-card-head">
              <h2>Account Information</h2>
            </div>

            <div className="profile-grid">
              <div className="profile-row">
                <span>Name</span>
                <strong>{user.name}</strong>
              </div>

              <div className="profile-row">
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>

              <div className="profile-row">
                <span>Role</span>
                <strong>{user.role || "customer"}</strong>
              </div>

              <div className="profile-row">
                <span>Member since</span>
                <strong>{memberSince}</strong>
              </div>
            </div>
          </article>

          {/* Helpful shortcut actions */}
          <article className="profile-card">
            <div className="profile-card-head">
              <h2>Quick Actions</h2>
            </div>

            <div className="profile-actions">
              <Link to="/orders/my" className="profile-action-btn">
                View My Orders
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default Profile;
