import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserID, setUserID } from "../../contexts/userStore";
import "./welcome.css"; // Updated CSS file name

const Welcome = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [isLoggingIn, setIsLoggingIn] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();


  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const { username, password } = formData;
    const res = await fetch(`http://localhost:8000/profiles/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      console.log("User Registered", data);
      console.log("User ID:", data.userId);
      setUserID(data.userId);

      navigate('/dashboard');
    } else {
      console.error("Error registering user", data);
      setError(data.detail);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { username, password } = formData;
    const res = await fetch(`http://localhost:8000/profiles/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      console.log("User Logged In", data);
      setUserID(data.userId);
      console.log("User ID:", data.userId);
      console.log(getUserID());

      navigate('/dashboard');
    } else {
      console.error("Error logging in", data);
      setError(data.detail);
    }
  }

  const handlePlayAsGuest = () => {
    // Placeholder logic for playing as a guest
    console.log("Playing as guest...");
    setUserID("guest");

    navigate("/dashboard");
  };

  return (
    <div className="welcome-container">
      <img src="/logo.png" alt="Logo" className="welcome-logo" />
      <form className="log-in-form" onSubmit={isLoggingIn ? handleLogin : handleSignUp}>
        <input
          type="text"
          placeholder="Username"
          className="log-in-input"
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="log-in-input"
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
        <button type="submit" className="log-in-submit">
          {isLoggingIn ? 'Login' : 'Sign Up'}
        </button>
      </form>
        {isLoggingIn ? (
          <p className="disclaimer">
            Don't have an account? <span onClick={() => setIsLoggingIn(false)} className="disclaimer-link">Sign Up</span>
          </p>
        ) : (
          <p className="disclaimer">
            Already have an account? <span onClick={() => setIsLoggingIn(true)} className="disclaimer-link">Login</span>
          </p>
        )}
        <p onClick={handlePlayAsGuest} className="disclaimer">
          Or if you want to then <span className="disclaimer-link">Play as Guest</span>
        </p>
        {error && <p className="error-message">{error}</p>}
        {/* <button onClick={handlePlayAsGuest} className="welcome-button guest">
          <p className="guest-text">Play as Guest</p>
          <CircleHelp size={20} />
        </button> */}
    </div>
  );
};

export default Welcome;