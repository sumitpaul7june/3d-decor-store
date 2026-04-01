// Render the official Google Sign In button and surface the credential to parent pages.
import { useEffect, useRef, useState } from "react";
import "./GoogleAuthButton.css";

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let googleScriptPromise;

const loadGoogleScript = () => {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);

      if (existingScript) {
        existingScript.addEventListener("load", resolve, { once: true });
        existingScript.addEventListener(
          "error",
          () => reject(new Error("Failed to load Google Sign In")),
          { once: true },
        );
        return;
      }

      const script = document.createElement("script");
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Failed to load Google Sign In"));
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
};

const mapButtonText = (text) => {
  if (text.toLowerCase().includes("sign up")) {
    return "signup_with";
  }

  if (text.toLowerCase().includes("login")) {
    return "signin_with";
  }

  return "continue_with";
};

function GoogleAuthButton({
  text = "Continue with Google",
  onSuccess,
  onError,
  disabled = false,
}) {
  const buttonRef = useRef(null);
  const [renderError, setRenderError] = useState("");
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    let isMounted = true;

    if (disabled) {
      return undefined;
    }

    if (!clientId) {
      const message = "Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID to frontend env.";
      setRenderError(message);
      onError?.(message);
      return undefined;
    }

    const renderGoogleButton = async () => {
      try {
        await loadGoogleScript();

        if (!isMounted || !buttonRef.current || !window.google?.accounts?.id) {
          return;
        }

        setRenderError("");
        buttonRef.current.innerHTML = "";

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => {
            if (!credential) {
              const message = "Google did not return a sign-in credential.";
              setRenderError(message);
              onError?.(message);
              return;
            }

            onSuccess?.(credential);
          },
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: mapButtonText(text),
          shape: "rectangular",
          logo_alignment: "left",
          width: Math.max(buttonRef.current.offsetWidth || 0, 280),
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message = "Failed to load Google sign-in. Please try again.";
        setRenderError(message);
        onError?.(message);
      }
    };

    renderGoogleButton();

    return () => {
      isMounted = false;
    };
  }, [clientId, disabled, onError, onSuccess, text]);

  return (
    <div className="google-auth-wrapper">
      <div
        ref={buttonRef}
        className={`google-auth-btn ${disabled ? "is-disabled" : ""}`}
      />
      {renderError ? <p className="google-auth-error">{renderError}</p> : null}
    </div>
  );
}

export default GoogleAuthButton;
