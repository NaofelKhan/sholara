import { Link } from "wouter";

export function Navbar() {
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
            data-testid="input-search"
            className="pl-10 pr-4 py-2 w-64 bg-[#f1f5f9] rounded-lg border-none focus:ring-2 focus:ring-[#002045] outline-none text-sm"
          />
        </div>

        <nav className="hidden lg:flex gap-6">
          <Link href="/courses" data-testid="link-my-courses" className="text-sm font-medium text-[#43474e] hover:text-[#002045]">
            My Courses
          </Link>
          <a href="#" data-testid="link-skill-requests" className="text-sm font-medium text-[#43474e] hover:text-[#002045]">
            Skill Requests
          </a>
          <a href="#" data-testid="link-tutors" className="text-sm font-medium text-[#43474e] hover:text-[#002045]">
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
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full" />
        </button>

        <button data-testid="button-chat" className="p-2 rounded-lg text-[#43474e] hover:bg-[#eaedff]">
          <span className="material-symbols-outlined">chat_bubble</span>
        </button>
      </div>
    </header>
  );
}
