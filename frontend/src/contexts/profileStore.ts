import { create } from "zustand";
import { useUserStore } from "./userStore";

type ProfileStore = {
  id: string;
  name: string;
  email: string;
  clan: string;
  role: string;
  picture: string;
  fetchProfileInfo: () => Promise<void>;
};

export const useProfileStore = create<ProfileStore>((set) => ({
  id: "",
  name: "",
  email: "",
  clan: "",
  role: "user",
  picture: "",

  // Fetch a profile from the backend
  fetchProfileInfo: async () => {
    const userID = useUserStore.getState().userID; // Access userID dynamically
    if (!userID) {
      throw new Error("User ID is not set");
    }

    const response = await fetch(`http://localhost:8000/profiles/${userID}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("Profile data:", data);
    set({
      id: data.id,
      name: data.name,
      email: data.email,
      clan: data.clan,
      role: data.role,
      picture: data.picture,
    });
  },
}));