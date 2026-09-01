import api from "./auth";

// Create a new marketplace skill
export const createMarketplaceSkill = async (formData) => {
  const { data } = await api.post(
    "/marketplace-skills",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};

// Get all published marketplace skills
export const getMarketplaceSkills = async () => {
  const { data } = await api.get("/marketplace-skills");
  return data.skills;
};

// Delete a marketplace skill
export const deleteMarketplaceSkill = async (skillId) => {
  const { data } = await api.delete(
    `/marketplace-skills/${skillId}`
  );

  return data;
};