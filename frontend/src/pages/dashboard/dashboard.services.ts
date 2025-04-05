import { useColonyStore } from "../../contexts/colonyStore";
import { useUserStore } from "../../contexts/userStore";

export const makeAnt = async () => {
    console.log("Making an ant...");
    const userID = useUserStore.getState().userID; // Access userID dynamically
    const { fetchColonyInfo } = useColonyStore.getState();

    if (!userID) {
        throw new Error("User ID is not set");
    }
    console.log("User ID:", userID);

    try {
        const response = await fetch(`http://localhost:8000/actions/makeAnt?id=${userID}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Network response was not ok");
        }

        const data = await response.json();
        console.log("Ant created successfully:", data);

        // Fetch updated colony info after making an ant
        await fetchColonyInfo();
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error creating ant:", error.message);
        } else {
            console.error("Error creating ant:", error);
        }
    }
};

