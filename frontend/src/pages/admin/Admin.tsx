import React, { useState } from "react";
import { Link } from "react-router-dom";
import { updateUserRole } from "./admin.services";
import "./admin.css";

const Admin: React.FC = () => {
  const [username, setUsername] = useState("");

  const handleRoleChange = (newRole: string) => async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }
    try {
      const updatedUser = await updateUserRole(username, newRole);
      alert(`User "${updatedUser.name}" updated to role "${updatedUser.role}"`);
    } catch (error: any) {
      console.error("Error updating role:", error);
      alert(error.message || "Error updating role");
    }
  };

  const roleButtons = [
    { label: "Promote", role: "admin" },
    { label: "Demote", role: "user" },
    { label: "Ban", role: "banned" },
    { label: "Unban", role: "user" },
  ];

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Panel</h1>
      <p className="admin-description">
        Manage players with one convenient interface.
      </p>
      <form className="admin-form">
        <input
          type="text"
          placeholder="Player Username"
          className="admin-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <div className="admin-buttons">
          {roleButtons.map(({ label, role }) => (
            <button
              key={`${role}-${label}`}
              onClick={handleRoleChange(role)}
              className="admin-submit"
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </form>
      <Link to="/dashboard" className="admin-back-button">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default Admin;
