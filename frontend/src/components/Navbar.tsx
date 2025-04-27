import { CircleHelp } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useProfileStore } from '../contexts/profileStore';
import "./navbar.css";

const Navbar = () => {
  const role = useProfileStore((state) => state.role);

  const location = useLocation();
  // Hide navbar on the root path
  if (location.pathname === "/") {
    return null;
  }

  console.log("Navbar role:", role);
  console.log("nav", role === "admin");

  return (
    <header className="App-header">
      <img src="/ant.png" className="App-logo" alt="logo" />
      <nav className="nav-links">
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/profile" className="nav-link">Profile</Link>
        <Link to="/ants" className="nav-link">Ants</Link>
        <Link to="/clan" className="nav-link">Clan</Link>
        <Link to="/store" className="nav-link">Store</Link>
        {role === "admin" && (<Link to="/admin" className="nav-link">Admin</Link>)}
        <Link to="/guide" className="nav-link">
          <CircleHelp size={20} />
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
