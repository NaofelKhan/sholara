import { useState, useEffect } from 'react';
import axios from 'axios';

// Fallback data shown if the API is unreachable (pure-frontend mode)
const FALLBACK_SKILLS = [
  {
    _id: 'uiux',
    title: 'UI/UX Design Mentorship',
    category: 'UI/UX Design',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5nLStLcXijKFc3YCApZTTX4yuF9NXEGUAEQJCeaSZ5NXSlHqR_qRLVSAmGWDtkQJzcU0ok4SKe6QECd9-mrjZ1WUAUuNZ-r9xHa4-3f4cdsB8n7pz7Pn20zCdRGIi35qYU8VTAD-LhDswI6QE5In2sTyuFVWdykYuNtSLJdo-CFaW1bNXLfA3_ZwnlaAunXqNELs3hxm3oBdVRKaJ8XkgYm11kAXyaxVL7DJ9_-cnJTOQC51qEaXdyusqAjXAs4oO1WL6U2Q4C-c',
    topRated: true,
    rating: 4.9,
    price: 'Free',
    tutor: { name: 'Sarah Jenkins', role: 'Senior Product Designer', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1Th79LpCGkSIlbG2qdyzJixU-FefaeVKVdASnEVOn7i0_2xwSZoZdMRGgroyLIbH3enHd5fP5M2stLTcUUPEHr9-SoB9tAALPgaVCea3Dy-3U9D9cmeUVw9ur23FKmqm71RGZtrfkNPnVuUaFh8xBFiE5GLNd5RGkT3mgCodhTFyWx4mpwsDBMVc4-M8rEBJ_IoWmmY5DF5QSEu9ppLjQx3Q_pkxxd9XveET_2IFBW-zpGrk5bIAfHHPA2bnuutrc8TP_XycEzf4' },
  },
  {
    _id: 'python',
    title: 'Advanced Python Tutoring',
    category: 'Python Tutoring',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTDY1MvEHK_lWKGammyXhVo1WgAk4emUfgQW26AFQP_Vuai8-vO1jIhUZ9apfPeLxdYJU0gZvQ7oP9xYpKXYnYGRwCb5IwC4Q8_bFLADjwjO-fMybppYHmnbAgI1vLRLEBJU3Zf7IQqNxpoPExeuln8XZE-PmGoK9BdnWYu8ZZSniyNTG5RE63wKzqIVGsgrXx9XRRLEVQ55TGenDvvaswUyTI42ctOtzqH-YqCkxRl4FbkWlE42u3afhDorwvm27dXaY_gT0htDI',
    topRated: false,
    rating: 5.0,
    price: '৳ 1,200/mo',
    tutor: { name: 'Marcus Thorne', role: 'Computer Science Senior', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgRu7nUYkh3HtKndb7C7rXbE3T-fJLnksWVcAa6YSjiQPHQSq49ifydlq8yAmTpuyWUtIrw9P17rqRf1NaKevEFf4wHVhUl2zDqxCISGnC6s92chLDawbzhWADjhrenimgi4xBCMpv5QA-TP4lKqEl0FrUD_LFM7-0DFxWgLviqP0rS4oh2I4ZkptKihiOi8jdvtlDCN5KGIVb-y61H_9aKOYOA_eAh4cbOAwMjFptrpndhadEnL5SA0JYu-JtJoV2lU8DN2UHW1A' },
  },
  {
    _id: 'speaking',
    title: 'Public Speaking Mastery',
    category: 'Public Speaking',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXHGTQvQ3PltIVtXdBYDUJ9BZAaF17B3kgnKdx__tSEnCH8FPtWwP7666YQMHJeQpJ8qsQymZPF_gb8Savz9TnmUMUcp4BcYBBqJDfl57hFmInC-DDa1wi9VisAlNEljqvLICBZB5oRRSRT-MLwbr5M1tu8hHRjCa3xv_ht0uVSIdwBp62B128YXiVNxt0yR54NzPG17FcPkEfd4a7ILX_zDorW_UykwZQbugtzBb4P-6uJXzhAxXkocVN6YY6BmHQb-gFQGMn_AE',
    topRated: false,
    rating: 4.8,
    price: 'Free',
    tutor: { name: 'Elena Rodriguez', role: 'TEDx Speaker • Mentor', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKw5rsEG1hDq9_s62KOeIr8YYeWj41MI1uuEIhkpRjeDhE98W-tngHinwRaCzygK6hL3r6-igPXHTLms0Ou0iDpO3KJ641chLm7fYMP5DpSQv7WmKSfo1jqpneBxEGyfpSD6Ny0zmofPP-SvUZ1l_UZtVmY_T49ixHrpVIWnu35-BXU-m8MUfMwGoaMBofgj5xJsAH2MNEdOXyOcvtFIwVeeFHiehYAjNy-lKMKFA-54L5x3O3cgiOwPDbA-kM2umguCc5O_qJdKQ' },
  },
];

export default function useSkills(category) {
  const [skills, setSkills]   = useState(FALLBACK_SKILLS);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const params = category && category !== 'All Skills' ? `?category=${encodeURIComponent(category)}` : '';
    axios
      .get(`/api/skills${params}`)
      .then((res) => {
        console.log(res.data);
        const data = res.data.data || res.data;
        if (Array.isArray(data)) {
          setSkills(data); // <--- Keeps your line!
        } else {
          throw new Error('API returned HTML or non-array data');
        }
      })
      .catch(() => {
        // API not available — keep showing fallback data
        if (category && category !== 'All Skills') {
          setSkills(FALLBACK_SKILLS.filter((s) => s.category === category));
        } else {
          setSkills(FALLBACK_SKILLS);
        }
        setError('Running in offline mode (API not connected)');
      })
      .finally(() => setLoading(false));
  }, [category]);

  return { skills, loading, error };
}
