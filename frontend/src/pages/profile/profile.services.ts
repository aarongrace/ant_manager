import { useColonyStore } from "../../contexts/colonyStore";
import { useProfileStore } from "../../contexts/profileStore";

export const saveProfile = async (formData: {
    name: string;
    email: string;
    clan: string;
    role: string;
    picture: string;
}) => {
    console.log("Saving profile...", formData);
    const { updateProfile } = useProfileStore.getState();
    updateProfile(formData);
};

export const handleDownloadColonyData = async () => {
    const { generateColonyData } = useColonyStore.getState();
    const colonyData = generateColonyData();

    const blob = new Blob([JSON.stringify(colonyData)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;

    a.download = "colonyData.json";
    a.click();
    URL.revokeObjectURL(url);

}

export const handleRestoreColonyData = async () => {

}