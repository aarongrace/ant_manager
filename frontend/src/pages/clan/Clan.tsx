import { useState, useEffect } from "react";
import { useProfileStore } from '../../contexts/profileStore';
import "./clan.css";

const BACKEND_URL = "http://localhost:8000/clan";

const Clan = () => {
  const { clan, fetchProfileInfo } = useProfileStore();
  const [clans, setClans] = useState<any[]>([]);
  const [newClanName, setNewClanName] = useState("");
  const [newClanDescription, setNewClanDescription] = useState("");
  const [userClan, setUserClan] = useState<any>(null);

  useEffect(() => {
    const initialize = async () => {
      await fetchProfileInfo();
      if (useProfileStore.getState().clan) {
        const clanId = useProfileStore.getState().clan;
        try {
          const response = await fetch(`${BACKEND_URL}/${clanId}`, { credentials: "include" });
          const data = await response.json();
          setUserClan(data);
        } catch (error) {
          console.error("Error fetching user's clan:", error);
        }
      }
      await fetchClans();
    };
    initialize();
  }, []);

  const fetchClans = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/all`, { credentials: "include" });
      const data = await response.json();
      setClans(data);
    } catch (error) {
      console.error("Error fetching clans:", error);
    }
  };

  const handleCreateClan = async () => {
    if (!newClanName.trim()) return;
    try {
      const payload = { name: newClanName, max_size: 50, description: newClanDescription };
      await fetch(`${BACKEND_URL}/create`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await fetchClans();
      await fetchProfileInfo();
      setNewClanName("");
      setNewClanDescription("");
    } catch (error) {
      console.error("Error creating clan:", error);
    }
  };

  const handleJoinClan = async (id: string) => {
    try {
      await fetch(`${BACKEND_URL}/${id}/join`, { method: "POST", credentials: "include" });
      await fetchClans();
      await fetchProfileInfo();
    } catch (error) {
      console.error("Error joining clan:", error);
    }
  };

  const handleLeaveClan = async () => {
    if (!userClan) return;
    try {
      await fetch(`${BACKEND_URL}/${userClan.id}/leave`, { method: "POST", credentials: "include" });
      await fetchProfileInfo();
      setUserClan(null);
      await fetchClans();
    } catch (error) {
      console.error("Error leaving clan:", error);
    }
  };

  return (
    <div className="clan-container">
      <h1 className="clan-header">Clans</h1>
      <p className="clan-description">
        Clans are great ways to interact with other players. You can trade resources, share strategies, and build a community.
      </p>

      {userClan ? (
        <div className="clan-section">
          <h2 className="clan-subtitle">Your Clan</h2>
          <strong>{userClan.name}</strong>
          <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>{userClan.description}</p>
          <p style={{ marginTop: "10px" }}>Members: {userClan.members.length}</p>
          <button className="clan-btn" onClick={handleLeaveClan} style={{ marginTop: "15px" }}>
            Leave Clan
          </button>
        </div>
      ) : (
        <>
          <div className="clan-section">
            <h2 className="clan-subtitle">Create a Clan</h2>
            <div className="clan-custom-input">
              <input
                type="text"
                placeholder="Clan Name"
                className="clan-input"
                value={newClanName}
                onChange={(e) => setNewClanName(e.target.value)}
              />
            </div>

            <div className="clan-custom-input">
              <input
                type="text"
                placeholder="Clan Description"
                className="clan-input"
                value={newClanDescription}
                onChange={(e) => setNewClanDescription(e.target.value)}
              />
            </div>

            <button className="clan-btn" onClick={handleCreateClan}>
              Create Clan
            </button>
          </div>

          <div className="clan-section">
            <h2 className="clan-subtitle">Join an Existing Clan</h2>
            <div className="clan-list">
              {clans.length === 0 ? (
                <p className="clan-empty">No clans available. Be the first one!</p>
              ) : (
                clans.map((c) => (
                  <div key={c.id} className="clan-card">
                    <div className="clan-info">
                      <strong>{c.name}</strong> — {c.members.length} members
                      <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>{c.description}</p>
                    </div>
                    <button className="clan-join-btn" onClick={() => handleJoinClan(c['_id'])}>
                      Join
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Clan;
