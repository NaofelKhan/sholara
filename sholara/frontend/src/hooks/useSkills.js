import { useState, useEffect } from "react";
import { getMarketplaceSkills } from "../api/marketplaceSkill";


export default function useSkills(category) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

getMarketplaceSkills()
  .then((data) => {
    const marketplaceSkills = Array.isArray(data) ? data : [];

    const filteredSkills =
      category && category !== "All Skills"
        ? marketplaceSkills.filter(
            (skill) => skill.category === category
          )
        : marketplaceSkills;

    setSkills(filteredSkills);
  })
  .catch(() => {
    setSkills([]);
    setError("Failed to load marketplace skills.");
  })
  .finally(() => {
    setLoading(false);
  });
  }, [category]);

  return {
    skills,
    loading,
    error,
  };
}