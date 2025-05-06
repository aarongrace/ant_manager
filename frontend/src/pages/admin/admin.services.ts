import { useProfileStore } from "../../contexts/profileStore";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  clan: string;
  role: string;
  picture: string;
}

export const saveProfile = async (profileData: UserProfile): Promise<UserProfile> => {
  console.log("Saving profile...", profileData);
  const { updateProfile } = useProfileStore.getState();
  updateProfile(profileData);
  return profileData;
};

export const updateUserRole = async (
  username: string,
  newRole: string
): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/profiles/update-role/${username}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role: newRole }),
  });

  if (!response.ok) {
    let errorMsg = "Error updating role";
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorMsg;
    } catch (err) {
      console.error("Failed to parse error response", err);
    }
    throw new Error(errorMsg);
  }

  const updatedProfile: UserProfile = await response.json();

  return updatedProfile;
};

export const deleteUserProfile = async (
  username: string
): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/profiles/delete/${username}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMsg = "Error deleting profile";
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorMsg;
    } catch (err) {
      console.error("Failed to parse error response", err);
    }
    throw new Error(errorMsg);
  }

  const result = await response.json();
  return result;
};


export const getData = async (username: string): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/profiles/get-data/${username}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMsg = "Error getting profile";
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorMsg;
    } catch (err) {
      console.error("Failed to parse error response", err);
    }
    throw new Error(errorMsg);
  }

  const result = await response.json();
  const stringResult = "Username: " + JSON.stringify(result.name) +
                  "\nRole: " + JSON.stringify(result.role) +
                  "\nCreation Date: " + JSON.stringify(result.createdDate).split("T")[0] + '"' + 
                  "\nClan ID: " + JSON.stringify(result.clan) + 
                  "\nEmail: " + JSON.stringify(result.email) + 
                  "\nLast Login: " + JSON.stringify(result.lastLoggedIn).split("T")[0] + '"';
  return stringResult;
};


export const getColony = async (username: string): Promise<string> => {

  const idResponse = await fetch(`${API_BASE_URL}/profiles/get-id/${username}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const idData = await idResponse.json();
  const userId = idData.id;

  const colonyResponse = await fetch(`${API_BASE_URL}/colonies/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!colonyResponse.ok) {
    let errorMsg = "Error getting colony";
    try {
      const errorData = await colonyResponse.json();
      errorMsg = errorData.detail || errorMsg;
    } catch (err) {
      console.error("Failed to parse error response", err);
    }
    throw new Error(errorMsg);
  }
  
  const result = await colonyResponse.json();

  let perks = "";
  for (let i = 0; i < 6; i++) {
    if (result.perks[i]) {
      perks += "\n";
      perks += result.perks[i].name + " tier " + result.perks[i].timesUpgraded;
    }
  }
                
  const stringResult = "Username: " + JSON.stringify(username) +
  "\nEggs: " + JSON.stringify(result.eggs) +
  "\nFood: " + JSON.stringify(result.food) + 
  "\nChitin: " + JSON.stringify(result.chitin) + 
  "\nAge: " + JSON.stringify(result.age) + 
  "\nPerks: " + perks;
  return stringResult;
};

export const getTrades = async (username: string): Promise<any> => {

  const idResponse = await fetch(`${API_BASE_URL}/profiles/get-id/${username}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const idData = await idResponse.json();
  const userId = idData.id;

  const colonyResponse = await fetch(`${API_BASE_URL}/trades/sentPending/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!colonyResponse.ok) {
    let errorMsg = "Error getting trades";
    try {
      const errorData = await colonyResponse.json();
      errorMsg = errorData.detail || errorMsg;
    } catch (err) {
      console.error("Failed to parse error response", err);
    }
    throw new Error(errorMsg);
  }
  
  const result = await colonyResponse.json();

  const colonyResponse2 = await fetch(`${API_BASE_URL}/trades/pending/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!colonyResponse2.ok) {
    let errorMsg = "Error getting trades";
    try {
      const errorData = await colonyResponse2.json();
      errorMsg = errorData.detail || errorMsg;
    } catch (err) {
      console.error("Failed to parse error response", err);
    }
    throw new Error(errorMsg);
  }
  
  const result2 = await colonyResponse2.json();

  return "to: " + JSON.stringify(result, null, 2) + "\nfrom: " + JSON.stringify(result2, null, 2);
};

export const modifyResource = async (
  name: string,
  num: number,
  mat: string
): Promise<void> => {
  
  const idResponse = await fetch(`${API_BASE_URL}/profiles/get-id/${name}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const idData = await idResponse.json();
  const id = idData.id;

  const colonyResponse = await fetch(`${API_BASE_URL}/colonies/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!colonyResponse.ok) {
    let errorMsg = "Error getting colony";
    try {
      const errorData = await colonyResponse.json();
      errorMsg = errorData.detail || errorMsg;
    } catch (err) {
      console.error("Failed to parse error response", err);
    }
    throw new Error(errorMsg);
  }
  
  const Colony = await colonyResponse.json();
  Colony[mat] = num;
  
  const response = await fetch(`${API_BASE_URL}/colonies/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Colony)
  });

  if (!response.ok) {
    let errorMsg = "Error updating role";
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorMsg;
    } catch (err) {
      console.error("Failed to parse error response", err);
    }
    throw new Error(errorMsg);
  }

 await response.json();
};
