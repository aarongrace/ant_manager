import { create } from "zustand";
import { useUserStore } from "./userStore";

type ProfileData = {
  id: string;
  name: string;
  email: string;
  clan: string;
  role: string;
  picture: string;
}

type ProfileStore = {
  id: string;
  name: string;
  email: string;
  clan: string;
  role: string;
  picture: string;
  fetchProfileInfo: () => Promise<void>;
  updateProfile: (profile: Partial<ProfileData>)=> Promise<void>;
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

  updateProfile: async (profileData: Partial<ProfileData>) => {
    console.log("Updating profile with data:", profileData);

    const userID = useUserStore.getState().userID;
    try {
      const response = await fetch(`http://localhost:8000/profiles/${userID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Network response was not ok");
      }

      const data = await response.json();
      console.log("Profile updated successfully:", data);

    } catch (error) {
      if (error instanceof Error) {
        console.error("Error saving profile:", error.message);
      } else {
        console.error("Error saving profile:", error);
      }
    }
  },

}));