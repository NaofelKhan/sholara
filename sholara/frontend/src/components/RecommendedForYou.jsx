import { useState, useEffect } from "react";
import MI from "./MI";
import C from "../constants/colors";
import SkillCard from "./SkillCard";
import { getRecommendedSkills, getRecommendedRequests } from "../api/recommendation";

// Shared "recommendation engine" identity colors — kept identical to the
// Dashboard's Skill Recommendations widget so the feature reads as one
// consistent system wherever it appears, and visually separate from the
// plain marketplace grid / ActiveRequests list on this same page.
const SKILL_ACCENT = {
  strip: "linear-gradient(to right, #0f6e56, #5dcaa5)",
  chipBg: "#e1f5ee",
  chipText: "#0f6e56",
  ribbonBg: "#0f6e56",
  ring: "#5dcaa5",
};

const MENTOR_ACCENT = {
  strip: "linear-gradient(to right, #854f0b, #ef9f27)",
  chipBg: "#faeeda",
  chipText: "#854f0b",
  ribbonBg: "#ba7517",
  ring: "#ef9f27",
};

export default function RecommendedForYou({ onSelectSkill, onBookSkill }) {
  const [skills, setSkills] = useState([]);
  const [basedOnActivity, setBasedOnActivity] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    Promise.all([getRecommendedSkills(), getRecommendedRequests()])
      .then(([skillsRes, requestsRes]) => {
        setSkills(skillsRes?.skills || []);
        setBasedOnActivity(!!skillsRes?.basedOnActivity);
        setRequests(requestsRes?.requests || []);
      })
      .catch(() => {
        setSkills([]);
        setRequests([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="mb-16">
        <h2
          className="text-2xl font-semibold mb-6"
          style={{ fontFamily: "Hanken Grotesk, sans-serif", color: C.onSurface }}
        >
          Recommended For You
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-xl h-72 animate-pulse" style={{ background: C.surfaceContainerHigh }} />
          ))}
        </div>
      </section>
    );
  }

  if (skills.length === 0 && requests.length === 0) {
    return null;
  }

  return (
    <>
      {skills.length > 0 && (
        <section className="mb-16">
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{ background: "#f2fbf8", border: "1px solid #c7ede4" }}
          >
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: SKILL_ACCENT.strip }} />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: SKILL_ACCENT.chipBg, color: SKILL_ACCENT.chipText }}
                >
                  <MI name="handshake" size={18} />
                </span>
                <h2
                  className="text-2xl font-semibold tracking-tight"
                  style={{ fontFamily: "Hanken Grotesk, sans-serif", color: C.onSurface }}
                >
                  Recommended For You
                </h2>
              </div>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: SKILL_ACCENT.chipBg, color: SKILL_ACCENT.chipText }}
              >
                {basedOnActivity ? "Based on your activity" : "Popular on Scholara"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {skills.map((skill) => (
                <div
                  key={skill._id}
                  onClick={() => onSelectSkill?.(skill)}
                  className="cursor-pointer relative rounded-xl"
                  style={{ boxShadow: `0 0 0 2px ${SKILL_ACCENT.ring}` }}
                >
                  <div
                    className="absolute top-3 left-3 z-10 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                    style={{ background: SKILL_ACCENT.ribbonBg, color: "#fff" }}
                  >
                    <MI name="bolt" size={11} />
                    Match
                  </div>
                  <SkillCard skill={skill} onBook={onBookSkill} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {requests.length > 0 && (
        <section className="mb-16">
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{ background: "#fdf8f0", border: "1px solid #f5dfb3" }}
          >
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: MENTOR_ACCENT.strip }} />

            <div className="flex items-center gap-2 mb-6">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: MENTOR_ACCENT.chipBg, color: MENTOR_ACCENT.chipText }}
              >
                <MI name="school" size={18} />
              </span>
              <h2
                className="text-2xl font-semibold tracking-tight"
                style={{ fontFamily: "Hanken Grotesk, sans-serif", color: C.onSurface }}
              >
                Requests You Could Fulfill
              </h2>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full ml-auto"
                style={{ background: MENTOR_ACCENT.chipBg, color: MENTOR_ACCENT.chipText }}
              >
                Matches your offered skills
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {requests.map((req) => (
                <div
                  key={req._id}
                  className="flex flex-wrap items-center justify-between gap-5 rounded-xl p-5 transition-colors"
                  style={{ background: C.surface, border: `1px solid ${MENTOR_ACCENT.ring}` }}
                >
                  <div className="flex items-center gap-5">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: MENTOR_ACCENT.chipBg, color: MENTOR_ACCENT.chipText }}
                    >
                      <MI name="code" size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm" style={{ color: C.onSurface }}>
                          Looking for: {req.skillTitle}
                        </h4>
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                          style={{ background: MENTOR_ACCENT.chipBg, color: MENTOR_ACCENT.chipText }}
                        >
                          Mentor Match
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
                        Posted by {req.userId?.fullName || "A student"} • {req.skillCategory}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.onSurfaceVariant }}>
                        Budget
                      </p>
                      <p className="font-bold" style={{ color: MENTOR_ACCENT.chipText }}>
                        {req.estimatedBudget ? `৳${req.estimatedBudget}` : "Skill Swap"}
                      </p>
                    </div>
                    <button
                      className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{ border: `1px solid ${MENTOR_ACCENT.chipText}`, color: MENTOR_ACCENT.chipText, background: "transparent" }}
                      onClick={() => setSelectedRequest(req)}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="rounded-xl p-6 w-[500px]" style={{ background: C.surface }}>
            <h2 className="text-xl font-bold mb-4">{selectedRequest.skillTitle}</h2>
            <p>
              <strong>Learning Objectives:</strong>
              <br />
              {selectedRequest.learningObjectives || "No learning objectives provided"}
            </p>
            <p className="mt-3">
              <strong>Category:</strong> {selectedRequest.skillCategory || "Not specified"}
            </p>
            <p>
              <strong>Difficulty:</strong> {selectedRequest.difficultyLevel || "Not specified"}
            </p>
            <p>
              <strong>Availability:</strong> {selectedRequest.availability?.join(", ") || "Not specified"}
            </p>
            <p>
              <strong>Budget:</strong> ৳{selectedRequest.estimatedBudget || 0}
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button className="px-4 py-2 rounded-lg" onClick={() => setSelectedRequest(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}