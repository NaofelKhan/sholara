import { useState, useEffect } from "react";
import {
  getMarketplaceSkills,
  deleteMarketplaceSkill,
} from "../api/marketplaceSkill";

export default function useSkills(category) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getMarketplaceSkills();

      const marketplaceSkills = Array.isArray(data) ? data : [];

      const filteredSkills =
        category && category !== "All Skills"
          ? marketplaceSkills.filter(
              (skill) => skill.category === category
            )
          : marketplaceSkills;

      setSkills(filteredSkills);
    } catch (err) {
      setSkills([]);
      setError("Failed to load marketplace skills.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [category]);

  const deleteSkill = async (skillId) => {
    try {
      await deleteMarketplaceSkill(skillId);

      setSkills((currentSkills) =>
        currentSkills.filter((skill) => skill._id !== skillId)
      );

      return true;
    } catch (err) {
      throw err;
    }
  };

  return {
    skills,
    loading,
    error,
    deleteSkill,
  };
}