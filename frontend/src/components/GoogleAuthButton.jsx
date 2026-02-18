// Reusable Google auth button (stub click handler for now).
import "./GoogleAuthButton.css";

function GoogleAuthButton({text = 'Continue with Google'}) {
  return (
    <button
      type="button"
      className="google-auth-btn"
      onClick={() => {
        // Stub handler for now (real Google OAuth wiring comes later).
        console.log("Google auth clicked");
      }}
    >
      {/* Google brand icon */}
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="Google"
      />
      {/* Button text changes based on page (Login / Signup) */}
      <span>{text}</span>
    </button>
  );
}

export default GoogleAuthButton;
