import React, { useState } from "react";
import { Link } from "react-router-dom";
import { updateUserRole, deleteUserProfile, getData, getColony, getTrades, modifyResource } from "./admin.services";
import "./admin.css";

const Admin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [number, setNumber] = useState<number>(0);
  const [Option, setOption] = useState<string>("food");
  const [Option2, setOption2] = useState<string>("=");

  const handleRoleChange = (newRole: string) => async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (!username.trim()) {
      alert("Enter a username");
      return;
    }
    try {
      const updatedUser = await updateUserRole(username, newRole);
      alert(`User "${updatedUser.name}" updated to role "${updatedUser.role}"`);
    } catch (error: any) {
      console.error("Error updating role:", error);
      if (error.message.includes("Profile not found")) {
        alert("User with the entered name was not found.");
      } else {
        alert("Error updating role: " + error.message);
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!username.trim()) {
      alert("Enter a username");
      return;
    }
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this profile?"
      )
    ) {
      return;
    }
    try {
      const result = await deleteUserProfile(username);
      alert(result.message);
    } catch (error: any) {
      console.error("Error deleting profile:", error);
      if (error.message.includes("Profile not found")) {
        alert("User with the entered name was not found.");
      } else {
        alert("Error deleting profile: " + error.message);
      }
    }
  };

  const handleGetData = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }
    try {
      const Info = await getData(username);
      alert(Info);
    } catch (error: any) {
      console.error("Error displaying user info:", error);
      if (error.message.includes("Profile not found")) {
        alert("User with the entered name was not found.");
      } else {
        alert("Error getting profile data: " + error.message);
      }
    }
  };

  const handleGetColony = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }
    try {
      const Info = await getColony(username);
      alert(Info);
    } catch (error: any) {
      console.error("Error displaying user info:", error);
      if (error.message.includes("Profile not found")) {
        alert("User with the entered name was not found.");
      } else {
        alert("Error getting colony data: " + error.message);
      }
    }
  };

  const handleGetTrades = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }
    try {
      const Info = await getTrades(username);
      alert(Info);
    } catch (error: any) {
      console.error("Error displaying pending trades:", error);
      if (error.message.includes("Profile not found")) {
        alert("User with the entered name was not found.");
      } else {
        alert("Error getting trades: " + error.message);
      }
    }
  };

  const handleModifyResource = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!username.trim()||!Number.isInteger(number)) {
      alert("Enter a username and integer");
      return;
    }
    try {
      await modifyResource(username,number,Option,Option2);
    } catch (error: any) {
      console.error("Error displaying pending trades:", error);
      if (error.message.includes("Profile not found")) {
        alert("User with the entered name was not found.");
      } else {
        alert("Error modifying resource: " + error.message);
      }
    }
    alert(`Username: ${username} ${Option2} ${number} ${Option}`);
  };

  const roleButtons = [
    { label: "Make Admin", role: "admin" },
    { label: "Make User", role: "user" },
    { label: "Ban", role: "banned" },
  ];

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Panel</h1>
      <p className="admin-description">
        Enter a username to manage that user's account.
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
          <button onClick={handleDelete} className="admin-submit" type="button">
            Delete User
          </button>
          <div>
            <button onClick={handleGetData} className="admin-submit" type="button">
              Profile Data
            </button>
            <button onClick={handleGetColony} className="admin-submit" type="button">
              Colony Data
            </button>
            <button onClick={handleGetTrades} className="admin-submit" type="button">
              Pending trades
            </button>
          </div>
        </div>
        <div className="admin-inline">
        <select
            className="admin-input"
            value={Option2}
            onChange={(e) => setOption2(e.target.value)}
          >
            <option value="=">=</option>
            <option value="+">+</option>
            <option value="-">-</option>
          </select>
          <input
            type="number"
            placeholder="Integer value"
            className="admin-input"
            value={number}
            onChange={(e) => setNumber(parseInt(e.target.value, 10))}
            step="1"
          />
          <select
            className="admin-input"
            value={Option}
            onChange={(e) => setOption(e.target.value)}
          >
            <option value="eggs">Eggs</option>
            <option value="food">Food</option>
            <option value="chitin">Chitin</option>
          </select>
        </div>
        <button onClick={handleModifyResource} className="admin-submit" type="button">
          Execute
        </button>
      </form>
      <Link to="/dashboard" className="admin-back-button">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default Admin;
