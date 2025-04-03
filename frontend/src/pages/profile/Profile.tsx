import React from 'react';
import './Profile.css';

const Profile: React.FC = () => {
  return (
    <div className="profile-container">
      <h1 className="profile-header">Ant Colony Profile</h1>
      <form className="profile-form">
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" name="username" placeholder="Enter your username" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" placeholder="Enter your password" />
        </div>
        <button type="button" className="profile-button">Save</button>
      </form>
    </div>
  );
};

export default Profile;