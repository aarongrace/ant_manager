import React, { useEffect, useState } from 'react';
import './Profile.css';
import { useProfileStore } from '../../contexts/profileStore';
import { saveProfile } from './profile.services';

const Profile: React.FC = () => {
  const { id, name, email, clan, role, picture, fetchProfileInfo } = useProfileStore();
  const [clanName, setClanName] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    clan: '',
    role: '',
    picture: '',
  });

  useEffect(() => {
    fetchProfileInfo().then(async () => {
      setFormData({
        name: name,
        email: email,
        clan: clan,
        role: role,
        picture: picture,
      });
  
      if (clan) {
        try {
          const res = await fetch(`http://localhost:8000/clan/${clan}`, {
            credentials: "include",
          });
          const data = await res.json();
          setClanName(data.name);
        } catch (error) {
          console.error("Error fetching clan name:", error);
        }
      } else {
        setClanName(""); 
      }
    });
  }, [fetchProfileInfo, name, email, clan, role, picture]);

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
      <h1 className="profile-header">{name} Profile</h1>
      <form className="profile-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            className="profile-input"
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
            className="profile-input"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="user@email.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="clan">Clan:</label>
          <input
            type="text"
            id="clan"
            name="clan"
            className="profile-input"
            value={clan ? clanName : "No Clan"}
            onChange={handleInputChange}
            disabled // cant edit clan either must go to /clan to handle that stuff
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role:</label>
          <input
            type="text"
            id="role"
            name="role"
            className="profile-input"
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
            className="profile-input"
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