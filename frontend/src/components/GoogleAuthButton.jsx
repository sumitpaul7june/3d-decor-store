import "./GoogleAuthButton.css";

function GoogleAuthButton({text = 'Continue with Google'}) {
  return (
    <button
      type="button"
      className="google-auth-btn"
      onClick={() => {
        console.log("Google auth clicked");
      }}
    >
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="Google"
      />
      <span>{text}</span>
    </button>
  );
}

export default GoogleAuthButton;
