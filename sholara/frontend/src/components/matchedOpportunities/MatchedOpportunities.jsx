import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/auth";
import { getMarketplaceSkills } from "../../api/marketplaceSkill";
import SkillDetailsModal from "../SkillDetailsModal";
import C from "../../constants/colors";

export default function MatchedOpportunities({ onSelectSkill, onBookSkill }) {
const { user } = useAuth();

const [matches, setMatches] = useState([]);
const [loading, setLoading] = useState(true);
const [selectedSkill, setSelectedSkill] = useState(null);

useEffect(() => {
const findMatches = async () => {
const currentUserId = user?._id || user?.id;

  if (!currentUserId) {
    setMatches([]);
    setLoading(false);
    return;
  }

  try {
    const requestResponse = await api.get("/skill-requests");

    const requestData =
      requestResponse.data?.data || requestResponse.data || [];

    console.log("Current User:", user);
    console.log("All Skill Requests:", requestData);

    const userRequests = Array.isArray(requestData)
      ? requestData.filter(
          (request) =>
            String(request.userId?._id || request.userId) ===
            String(currentUserId)
        )
      : [];

    console.log("Current User Requests:", userRequests);

    const marketplaceSkills = await getMarketplaceSkills();

    console.log("Marketplace Skills:", marketplaceSkills);

    const availableSkills = Array.isArray(marketplaceSkills)
      ? marketplaceSkills.filter(
          (skill) =>
            String(skill.mentor?._id || skill.mentor) !==
            String(currentUserId)
        )
      : [];

    const matchedSkills = [];

    userRequests.forEach((request) => {
      availableSkills.forEach((skill) => {
        let score = 0;

        const requestTitle = (
          request.skillTitle || ""
        ).toLowerCase();

        const skillTitle = (
          skill.title || ""
        ).toLowerCase();

        const requestCategory = (
          request.skillCategory || ""
        ).toLowerCase();

        const skillCategory = (
          skill.category || ""
        ).toLowerCase();

        const requestWords = requestTitle
          .split(/\s+/)
          .filter((word) => word.length > 2);

        const skillWords = skillTitle
          .split(/\s+/)
          .filter((word) => word.length > 2);

        const titleMatches = requestWords.filter((word) =>
          skillWords.some(
            (skillWord) =>
              skillWord.includes(word) ||
              word.includes(skillWord)
          )
        );

        const relatedKeywords = {
          react: [
            "react",
            "reactjs",
            "frontend",
            "front-end",
            "web",
            "javascript",
            "js",
          ],

          javascript: [
            "javascript",
            "js",
            "react",
            "reactjs",
            "frontend",
            "web",
          ],

          python: [
            "python",
            "django",
            "flask",
            "data",
            "backend",
            "machine",
          ],

          frontend: [
            "frontend",
            "front-end",
            "react",
            "reactjs",
            "javascript",
            "js",
            "web",
            "ui",
          ],

          backend: [
            "backend",
            "back-end",
            "node",
            "nodejs",
            "express",
            "api",
            "server",
            "database",
          ],

          web: [
            "web",
            "website",
            "frontend",
            "backend",
            "react",
            "javascript",
            "html",
            "css",
          ],

          design: [
            "design",
            "ui",
            "ux",
            "figma",
            "graphic",
            "visual",
          ],

          ui: [
            "ui",
            "ux",
            "design",
            "figma",
            "interface",
          ],

          ux: [
            "ux",
            "ui",
            "design",
            "figma",
            "user",
          ],

          mathematics: [
            "mathematics",
            "math",
            "calculus",
            "algebra",
            "statistics",
          ],

          math: [
            "math",
            "mathematics",
            "calculus",
            "algebra",
            "statistics",
          ],

          statistics: [
            "statistics",
            "statistical",
            "data",
            "analysis",
            "math",
          ],

          programming: [
            "programming",
            "coding",
            "software",
            "development",
            "developer",
            "computer",
          ],
        };

        let relatedTitleMatch = false;

        requestWords.forEach((word) => {
          const relatedWords = relatedKeywords[word] || [word];

          skillWords.forEach((skillWord) => {
            if (
              relatedWords.some(
                (relatedWord) =>
                  skillWord.includes(relatedWord) ||
                  relatedWord.includes(skillWord)
              )
            ) {
              relatedTitleMatch = true;
            }
          });
        });

        if (titleMatches.length > 0) {
          score += 60;
        } else if (relatedTitleMatch) {
          score += 50;
        }

        if (!titleMatches.length && !relatedTitleMatch) {
          return;
        }

        if (
          requestCategory &&
          skillCategory &&
          requestCategory === skillCategory
        ) {
          score += 15;
        }

        if (
          request.difficultyLevel &&
          skill.difficultyLevel &&
          request.difficultyLevel.toLowerCase() ===
            skill.difficultyLevel.toLowerCase()
        ) {
          score += 10;
        }

        if (
          request.estimatedBudget !== undefined &&
          request.estimatedBudget !== null &&
          Number(request.estimatedBudget) > 0
        ) {
          if (
            skill.pricingModel === "Free" ||
            Number(skill.price || 0) <=
              Number(request.estimatedBudget)
          ) {
            score += 10;
          }
        } else {
          score += 10;
        }

        if (
          Array.isArray(request.availability) &&
          Array.isArray(skill.availabilityDays) &&
          request.availability.length > 0 &&
          skill.availabilityDays.length > 0
        ) {
          const hasAvailabilityMatch =
            request.availability.some((day) =>
              skill.availabilityDays.includes(day)
            );

          if (hasAvailabilityMatch) {
            score += 5;
          }
        } else {
          score += 5;
        }

        matchedSkills.push({
          ...skill,
          matchScore: Math.min(score, 100),
          matchedRequest: request,
        });
      });
    });

    const uniqueMatches = Array.from(
      new Map(
        matchedSkills.map((skill) => [skill._id, skill])
      ).values()
    );

    uniqueMatches.sort(
      (a, b) => b.matchScore - a.matchScore
    );

    console.log(
      "Matched Opportunities:",
      uniqueMatches
    );

    setMatches(uniqueMatches);
  } catch (error) {
    console.error(
      "Matched Opportunities error:",
      error
    );

    setMatches([]);
  } finally {
    setLoading(false);
  }
};

findMatches();

}, [user]);

return (
<>
<section className="mt-16">
<div className="mb-6">
<h2
className="text-2xl font-bold"
style={{ color: C.onSurface }}
>
Matched Opportunities
</h2>

      <p
        className="mt-1 text-sm"
        style={{ color: C.onSurfaceVariant }}
      >
        Skill offers that match the skills you requested.
      </p>
    </div>

    {loading ? (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-xl h-56 animate-pulse"
            style={{
              background: C.surfaceContainerHigh,
            }}
          />
        ))}
      </div>
    ) : matches.length === 0 ? (
      <div
        className="rounded-xl p-8 text-center"
        style={{
          background: C.surface,
          color: C.onSurfaceVariant,
        }}
      >
        <p className="font-medium">
          No matched opportunities yet.
        </p>

        <p className="text-sm mt-2">
          Request a skill to discover relevant skill offers.
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {matches.map((skill) => (
          <div
            key={skill._id}
            className="rounded-xl p-5 shadow-sm border"
            style={{
              background: C.surface,
              borderColor: C.outlineVariant,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  className="text-lg font-bold"
                  style={{ color: C.onSurface }}
                >
                  {skill.title}
                </h3>

                <p
                  className="text-sm mt-1"
                  style={{
                    color: C.onSurfaceVariant,
                  }}
                >
                  {skill.category}
                </p>
              </div>

              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: C.primaryFixedDim,
                  color: C.primary,
                }}
              >
                {skill.matchScore}% Match
              </span>
            </div>

            <p
              className="text-sm mt-4 line-clamp-2"
              style={{
                color: C.onSurfaceVariant,
              }}
            >
              {skill.description}
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <p>
                <strong>Difficulty:</strong>{" "}
                {skill.difficultyLevel}
              </p>

              <p>
                <strong>Price:</strong>{" "}
                {skill.pricingModel === "Free"
                  ? "Free"
                  : `৳ ${skill.price}`}
              </p>

              <p>
                <strong>Delivery:</strong>{" "}
                {skill.deliveryMethod}
              </p>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => {
                  if (onSelectSkill) {
                    onSelectSkill(skill);
                  } else {
                    setSelectedSkill(skill);
                  }
                }}
                className="w-full rounded-lg px-4 py-2 font-semibold"
                style={{
                  background: C.primary,
                  color: C.onPrimary,
                }}
              >
                View Opportunity
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>

  {selectedSkill && (
    <SkillDetailsModal
      skill={selectedSkill}
      onClose={() => setSelectedSkill(null)}
      onBook={onBookSkill}
    />
  )}
</>

);
}