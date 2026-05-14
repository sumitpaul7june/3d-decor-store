// Profile page showing account details and quick actions.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import ProductCard from "../components/ProductCard";
import "./Profile.css";

function Profile() {
  const [activeTab, setActiveTab] = useState("account");
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

  const renderAccount = () => (
    <section className="profile-page">
      <div className="profile-page-head">
        <p className="profile-kicker">Account</p>
        <h1>My Profile</h1>
        <p className="profile-subtitle">
          Manage your details, review account information, and jump into your orders.
        </p>
      </div>

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
                <span>Member since</span>
                <strong>{memberSince}</strong>
              </div>
            </div>
          </article>

          <article className="profile-card">
            <div className="profile-card-head">
              <h2>Quick Actions</h2>
            </div>
            <div className="profile-actions">
              <Link to="/orders/my" className="profile-action-btn">
                View My Orders
              </Link>
              <Link to="/track-order" className="profile-action-btn secondary">
                Track Order
              </Link>
              <button 
                onClick={() => setActiveTab("wishlist")} 
                className="profile-action-btn secondary"
              >
                View Wishlist
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );

  const renderWishlist = () => (
    <section className="profile-page">
      <div className="profile-page-head">
        <p className="profile-kicker">Account</p>
        <h1>My Wishlist</h1>
        <p className="profile-subtitle">
          Pieces you've saved for later.
        </p>
        <button onClick={() => setActiveTab("account")} className="profile-back-btn mt-4">
          ← Back to Account
        </button>
      </div>
      
      {(!user.wishlist || user.wishlist.length === 0) ? (
        <div className="profile-empty-state">
          <div className="profile-empty-icon">♡</div>
          <h2>Your wishlist is empty</h2>
          <p>Explore our catalog to find pieces you love.</p>
          <Link to="/products" className="profile-action-btn mt-4">Browse Products</Link>
        </div>
      ) : (
        <div className="profile-wishlist-grid">
          {user.wishlist.map(product => (
            <ProductCard key={product._id} product={product} variant="catalog" />
          ))}
        </div>
      )}
    </section>
  );

  if (activeTab === "wishlist") return renderWishlist();

  return renderAccount();
}

export default Profile;
