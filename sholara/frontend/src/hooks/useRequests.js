import { useState, useEffect } from "react";
import axios from "axios";
import C from "../constants/colors";

function timeAgo(iso) {
  if (!iso) return "";

  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;

  return `${Math.floor(diff / 86400)} days ago`;
}

export default function useRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/skill-requests")
      .then((res) => {
        console.log("Requests API:", res.data);

        const data = res.data.data || res.data;

        if (Array.isArray(data) && data.length > 0) {
          const formattedRequests = data.map((req) => ({
            ...req,

            // Keep the same card appearance
            icon: "code",
            iconBg: C.primaryFixedDim,
            iconColor: C.primary,

            title: `Looking for: ${req.skillTitle}`,

            // Full name from MongoDB
            poster: req.userId?.fullName || "Unknown User",

            budget: req.estimatedBudget
              ? `৳ ${req.estimatedBudget}`
              : "Skill Swap",

            btnLabel: "Help",
          }));

          setRequests(formattedRequests);
        } else {
          // No requests in database
          setRequests([]);
        }
      })
      .catch((err) => {
        console.error(err);

        // API unavailable
        setRequests([]);
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