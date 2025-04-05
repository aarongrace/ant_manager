import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { CircleHelp } from "lucide-react";
import "./welcome.css"; // Updated CSS file name
import { setUserID } from "../../contexts/userStore";

const Welcome = () => {
  const navigate = useNavigate();


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder logic for log in
    navigate("/dashboard");

  };

  const handlePlayAsGuest = () => {
    // Placeholder logic for playing as a guest
    console.log("Playing as guest...");
    setUserID("guest");

    navigate("/dashboard");
  };

  return (
    <div className="welcome-container">
      <img src="/logo.png" alt="Logo" className="welcome-logo" />
      <form className="log-in-form" onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          className="log-in-input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="log-in-input"
          required
        />
        <button type="submit" className="log-in-submit">
          Log In
        </button>
      </form>
      <div className="welcome-buttons">
        <Link to="/dashboard" className="welcome-button sign-up">
          <p>Sign Up</p>
        </Link>
        <button onClick={handlePlayAsGuest} className="welcome-button guest">
          <p className="guest-text">Play as Guest</p>
          <CircleHelp size={20} />
        </button>
      </div>
    </div>
  );
};

export default Welcome;