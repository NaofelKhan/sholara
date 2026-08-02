import { useState, useEffect } from 'react';
import axios from 'axios';
import C from '../constants/colors';

const FALLBACK_REQUESTS = [
  {
    _id: 'react',
    icon: 'code',
    iconBg: C.primaryFixedDim,
    iconColor: C.primary,
    title: 'Looking for: React.js Fundamentals',
    poster: 'Jordan K.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    budget: '20 Credits',
    btnLabel: 'Help Jordan',
  },
  {
    _id: 'mandarin',
    icon: 'translate',
    iconBg: C.tertiaryFixed,
    iconColor: C.tertiary,
    title: 'Looking for: Conversational Mandarin',
    poster: 'Wei L.',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    budget: 'Skill Swap',
    btnLabel: 'Help Wei',
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
  const [loading, setLoading]   = useState(true);

useEffect(() => {
  axios
    .get('/api/requests')
    .then((res) => {
      console.log(res.data);
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        setRequests(data);
      } else {
        throw new Error('API returned non-array data');
      }
    })
    .catch(() => setRequests(FALLBACK_REQUESTS)) // <--- Keeps fallback data on error!
    .finally(() => setLoading(false));           // <--- Keeps loading state update!
}, []);

  return { requests: requests.map((r) => ({ ...r, time: timeAgo(r.createdAt) })), loading };
}
