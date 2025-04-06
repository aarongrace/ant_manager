import React from "react";
import { CircleHelp, CogIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import "./navbar.css"; 

const Navbar = () => {
  const location = useLocation();
  // Hide navbar on the root path
  if (location.pathname === "/") {
    return null;
  } 
  return (
    <header className="App-header">
      <div className="game-title">Clash of Colonies</div>
      <nav className="nav-links">
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/profile" className="nav-link">Profile</Link>
        <Link to="/ants" className="nav-link">Ants</Link>
        <Link to="/clan" className="nav-link">Clan</Link>
        <Link to="/store" className="nav-link">Store</Link>
        <Link to="/admin" className="nav-link">Admin</Link>
        <Link to="/guide" className="nav-link">
          <CircleHelp size={20} />
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;