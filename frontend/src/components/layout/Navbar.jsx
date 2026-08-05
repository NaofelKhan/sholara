import { useState, useEffect } from "react";
import { search as searchApi } from "../../api/auth";

export function Navbar() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState({
    users: [],
    skills: [],
    requests: [],
  });

useEffect(() => {
  const timer = setTimeout(async () => {
    if (!search.trim()) {
      setResults({
        users: [],
        skills: [],
        requests: [],
      });
      return;
    }

    try {
      const data = await searchApi(search);

      console.log("Users:", data.users);
      console.log("Skills:", data.skills);
      console.log("Requests:", data.requests);

      setResults(data);
    } catch (err) {
      console.error("Search failed:", err);
    }
  }, 300);

  return () => clearTimeout(timer);
}, [search]);

  const hasResults =
    results.users.length ||
    results.skills.length ||
    results.requests.length;

  return (
    <header className="flex justify-between items-center w-full px-8 py-3 h-16 bg-white border-b border-[#c4c6cf] sticky top-0 z-40">
      <div className="flex items-center gap-8">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#43474e]">
            search
          </span>

          <input
            type="text"
            placeholder="Search courses, mentors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search"
            className="pl-10 pr-4 py-2 w-64 bg-[#f1f5f9] rounded-lg border-none focus:ring-2 focus:ring-[#002045] outline-none text-sm"
          />

          {search && hasResults > 0 && (
            <div className="absolute top-12 left-0 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">

              {results.users.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                    Users
                  </div>

                  {results.users.map((user) => (
                    <div
                      key={user._id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      👤 {user.fullName}
                    </div>
                  ))}
                </>
              )}

              {results.skills.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                    Skills
                  </div>

                  {results.skills.map((skill) => (
                    <div
                      key={skill._id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      📚 {skill.title}
                    </div>
                  ))}
                </>
              )}

              {results.requests.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                    Requests
                  </div>

                  {results.requests.map((request) => (
                    <div
                      key={request._id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
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
          <a
            href="#"
            data-testid="link-my-courses"
            className="text-sm font-medium text-[#43474e] hover:text-[#002045]"
          >
            My Courses
          </a>

          <a
            href="#"
            data-testid="link-skill-requests"
            className="text-sm font-medium text-[#43474e] hover:text-[#002045]"
          >
            Skill Requests
          </a>

          <a
            href="#"
            data-testid="link-tutors"
            className="text-sm font-medium text-[#43474e] hover:text-[#002045]"
          >
            Tutors
          </a>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button
          data-testid="button-create-new"
          className="bg-[#002045] text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-[#1a365d] transition"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Create New
        </button>

        <button
          data-testid="button-notifications"
          className="relative p-2 rounded-lg text-[#43474e] hover:bg-[#eaedff]"
        >
          <span className="material-symbols-outlined">
            notifications
          </span>

          <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full" />
        </button>

        <button
          data-testid="button-chat"
          className="p-2 rounded-lg text-[#43474e] hover:bg-[#eaedff]"
        >
          <span className="material-symbols-outlined">
            chat_bubble
          </span>
        </button>
      </div>
    </header>
  );
}