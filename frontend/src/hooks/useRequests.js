import { useState, useEffect } from "react";
import axios from "axios";
import C from "../constants/colors";

const FALLBACK_REQUESTS = [
  {
    _id: "react",
    icon: "code",
    iconBg: C.primaryFixedDim,
    iconColor: C.primary,
    title: "Looking for: React.js Fundamentals",
    poster: "Jordan K.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    budget: "৳ 2,000",
    btnLabel: "Help Jordan",
  },
  {
    _id: "mandarin",
    icon: "translate",
    iconBg: C.tertiaryFixed,
    iconColor: C.tertiary,
    title: "Looking for: Conversational Mandarin",
    poster: "Wei L.",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    budget: "Skill Swap",
    btnLabel: "Help Wei",
  },
];

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;

  return `${Math.floor(diff / 86400)} days ago`;
}

export default function useRequests() {
  const [requests, setRequests] = useState(FALLBACK_REQUESTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/requests")
      .then((res) => {
        console.log("Requests API:", res.data);

        const data = res.data.data || res.data;

        if (Array.isArray(data) && data.length > 0) {
          // MongoDB has requests
          setRequests(data);
        } else {
          // MongoDB empty -> keep dummy requests
          setRequests(FALLBACK_REQUESTS);
        }
      })
      .catch(() => {
        // Backend unavailable -> keep dummy requests
        setRequests(FALLBACK_REQUESTS);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return {
    requests: requests.map((r) => ({
      ...r,
      time: timeAgo(r.createdAt),
    })),
    loading,
  };
}
