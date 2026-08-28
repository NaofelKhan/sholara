import { useState, useEffect } from "react";
import MI from "./MI";
import C from "../constants/colors";
import SkillCard from "./SkillCard";
import { getRecommendedSkills, getRecommendedRequests } from "../api/recommendation";

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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MI name="auto_awesome" size={22} />
              <h2
                className="text-2xl font-semibold tracking-tight"
                style={{ fontFamily: "Hanken Grotesk, sans-serif", color: C.onSurface }}
              >
                Recommended For You
              </h2>
            </div>
            <span className="text-xs font-semibold" style={{ color: C.onSurfaceVariant }}>
              {basedOnActivity ? "Based on your activity" : "Popular on Scholara"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {skills.map((skill) => (
              <div key={skill._id} onClick={() => onSelectSkill?.(skill)} className="cursor-pointer">
                <SkillCard skill={skill} onBook={onBookSkill} />
              </div>
            ))}
          </div>
        </section>
      )}

      {requests.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <MI name="handshake" size={22} />
            <h2
              className="text-2xl font-semibold tracking-tight"
              style={{ fontFamily: "Hanken Grotesk, sans-serif", color: C.onSurface }}
            >
              Requests You Could Fulfill
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {requests.map((req) => (
              <div
                key={req._id}
                className="flex flex-wrap items-center justify-between gap-5 rounded-xl p-5 transition-colors"
                style={{ background: C.surface, border: `1px solid ${C.outlineVariant}` }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C.surfaceContainer; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = C.surface; }}
              >
                <div className="flex items-center gap-5">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: C.primaryFixedDim, color: C.primary }}
                  >
                    <MI name="code" size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm" style={{ color: C.onSurface }}>
                      Looking for: {req.skillTitle}
                    </h4>
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
                    <p className="font-bold" style={{ color: C.secondary }}>
                      {req.estimatedBudget ? `৳${req.estimatedBudget}` : "Skill Swap"}
                    </p>
                  </div>
                  <button
                    className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{ border: `1px solid ${C.primary}`, color: C.primary, background: "transparent" }}
                    onClick={() => setSelectedRequest(req)}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
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