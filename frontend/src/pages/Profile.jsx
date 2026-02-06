import "./Profile.css";

function Profile() {
  const user = {
    name: "Sumit Paul",
    email: "sumit@example.com",
    provider: "Email & Password",
  };

  return (
    <section className="profile-page">
      <div className="profile-card">
        <h1>My profile</h1>

        <div className="profile-row">
          <span>Name</span>
          <strong>{user.name}</strong>
        </div>

        <div className="profile-row">
          <span>Email</span>
          <strong>{user.email}</strong>
        </div>

        <div className="profile-row">
          <span>Signed in with</span>
          <strong>{user.provider}</strong>
        </div>
      </div>
    </section>
  );
}

export default Profile;
