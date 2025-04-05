import React, { useEffect, useState } from 'react';
import './Profile.css';
import { useProfileStore } from '../../contexts/profileStore';
import { saveProfile } from './profile.services';

const Profile: React.FC = () => {
  const { id, name, email, clan, role, picture, fetchProfileInfo } = useProfileStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    clan: '',
    role: '',
    picture: '',
  });

  useEffect(() => {
    fetchProfileInfo().then(() => {
      setFormData({
        name: name,
        email: email,
        clan: clan,
        role: role,
        picture: picture,
      });
    });
  }, [ fetchProfileInfo, name, email, clan, role, picture ]); // rerender when any of these values change

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    console.log('Saving profile data:', formData);
    await saveProfile( formData );
  };

  return (
    <div className="profile-container">
      <h1 className="profile-header">Ant Colony Profile</h1>
      <form className="profile-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="clan">Clan:</label>
          <input
            type="text"
            id="clan"
            name="clan"
            value={formData.clan}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role:</label>
          <input
            type="text"
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            disabled // Role is typically not editable
          />
        </div>
        <div className="form-group">
          <label htmlFor="picture">Profile Picture URL:</label>
          <input
            type="text"
            id="picture"
            name="picture"
            value={formData.picture}
            onChange={handleInputChange}
          />
        </div>
        <button type="button" className="profile-button" onClick={handleSave}>
          Save
        </button>
      </form>
    </div>
  );
};

export default Profile;