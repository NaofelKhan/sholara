import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import NotificationDropdown from "../notifications/NotificationDropdown";
import { getUnreadCount } from "../../api/notification";
import { getUnreadTotal } from "../../api/directMessage";
import { search as searchApi } from "../../api/auth";

export function Navbar() {
  const [, navigate] = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMsgs, setUnreadMsgs] = useState(0);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState({
    users: [],
    skills: [],
    requests: [],
    courses: [],
  });

  const fetchCounts = async () => {
    try {
      const [notifRes, msgRes] = await Promise.allSettled([
        getUnreadCount(),
        getUnreadTotal(),
      ]);

      if (notifRes.status === "fulfilled") {
        setUnreadNotifs(notifRes.value?.unreadCount || 0);
      }
      if (msgRes.status === "fulfilled") {
        setUnreadMsgs(msgRes.value?.unreadTotal || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!search.trim()) {
        setResults({
          users: [],
          skills: [],
          requests: [],
          courses: [],
        });
        return;
      }

      try {
        const data = await searchApi(search);
        setResults(data || { users: [], skills: [], requests: [], courses: [] });
      } catch (err) {
        console.error("Search failed:", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const hasResults =
    (results.skills?.length || 0) > 0 || 
    (results.requests?.length || 0) > 0 || 
    (results.courses?.length || 0) > 0;

  const goToSkillExchange = () => {
    setSearch("");
    setResults({
      users: [],
      skills: [],
      requests: [],
      courses: [],
    });
    navigate("/skill-exchange");
  };

  const goToCourse = (courseId) => {
    setSearch("");
    setResults({
      users: [],
      skills: [],
      requests: [],
      courses: [],
    });
    navigate(`/courses/${courseId}`);
  };

  return (
    <header className="flex justify-between items-center w-full px-8 py-3 h-16 bg-white border-b border-[#c4c6cf] sticky top-0 z-40">
      <div className="flex items-center gap-8">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#43474e]">
            search
          </span>
          <input
            type="text"
            placeholder="Search courses, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search"
            className="pl-10 pr-4 py-2 w-64 bg-[#f1f5f9] rounded-lg border-none focus:ring-2 focus:ring-[#002045] outline-none text-sm"
          />

          {search && hasResults && (
            <div className="absolute top-12 left-0 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
              {results.courses?.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                    Courses
                  </div>
                  {results.courses.map((course) => (
                    <div
                      key={course._id}
                      onClick={() => goToCourse(course._id)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-800"
                    >
                      📖 {course.title} <span className="text-xs text-gray-500">({course.code})</span>
                    </div>
                  ))}
                </>
              )}

              {results.skills?.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                    Skills
                  </div>
                  {results.skills.map((skill) => (
                    <div
                      key={skill._id}
                      onClick={goToSkillExchange}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-800"
                    >
                      📚 {skill.title}
                    </div>
                  ))}
                </>
              )}

              {results.requests?.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                    Skill Requests
                  </div>
                  {results.requests.map((request) => (
                    <div
                      key={request._id}
                      onClick={goToSkillExchange}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-800"
                    >
                      🎯 {request.skillTitle}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <nav className="hidden lg:flex gap-6">
          <Link
            href="/courses"
            data-testid="link-my-courses"
            className="text-sm font-medium text-[#43474e] hover:text-[#002045]"
          >
            My Courses
          </Link>
          <Link
            href="/skill-exchange"
            data-testid="link-skill-requests"
            className="text-sm font-medium text-[#43474e] hover:text-[#002045]"
          >
            Skill Exchange
          </Link>
          <Link
            href="/certificates"
            data-testid="link-certificates"
            className="text-sm font-medium text-[#43474e] hover:text-[#002045]"
          >
            Certificates
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4 relative">
        <Link
          href="/edit-profile"
          data-testid="button-edit-profile"
          className="bg-[#002045] text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-[#1a365d] transition"
        >
          <span className="material-symbols-outlined text-[20px]">edit</span>
          Edit Profile
        </Link>

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            data-testid="button-notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) fetchCounts();
            }}
            className={`relative p-2 rounded-lg transition ${
              showNotifications
                ? "bg-[#d6e3ff] text-[#002045]"
                : "text-[#43474e] hover:bg-[#eaedff]"
            }`}
            title="Notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadNotifs > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#ba1a1a] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
                {unreadNotifs > 99 ? "99+" : unreadNotifs}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={showNotifications}
            onClose={() => {
              setShowNotifications(false);
              fetchCounts();
            }}
          />
        </div>

        {/* Direct Messages Button */}
        <button
          data-testid="button-chat"
          onClick={() => navigate("/messages")}
          className="relative p-2 rounded-lg text-[#43474e] hover:bg-[#eaedff] transition"
          title="Direct Messages"
        >
          <span className="material-symbols-outlined">chat_bubble</span>
          {unreadMsgs > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#7c3aed] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
              {unreadMsgs > 99 ? "99+" : unreadMsgs}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
