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