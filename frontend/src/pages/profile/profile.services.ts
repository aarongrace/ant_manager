import { useUserStore } from "../../contexts/userStore";

export const saveProfile = async (formData: {
    name: string;
    email: string;
    clan: string;
    role: string;
    picture: string;
}) => {
    console.log("Saving profile...", formData);

    const userID = useUserStore.getState().userID;

    try {
        const response = await fetch(`http://localhost:8000/profiles/${userID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
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
};