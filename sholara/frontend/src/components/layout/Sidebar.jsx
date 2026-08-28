import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateProfilePicture } from "../../api/auth";

const DUMMY_AVATAR =
  "https://media.istockphoto.com/id/1288129985/tr/vekt%C3%B6r/bir-ki%C5%9Finin-yer-tutucunun-eksik-g%C3%B6r%C3%BCnt%C3%BCs%C3%BC.jpg";

function SidebarItem({ icon, text, href, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      data-testid={`link-nav-${text.toLowerCase().replace(/\s+/g, "-")}`}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? "text-[#002045] bg-[#d6e3ff] border-r-4 border-[#002045] rounded-r-none"
          : "text-[#43474e] hover:bg-[#eaedff]"
      }`}
    >
      <span className="material-symbols-outlined text-[22px]">
        {icon}
      </span>
      {text}
    </Link>
  );
}

export function Sidebar({ profile }) {
  const [location, navigate] = useLocation();
  const { logout, setUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const [previewImage, setPreviewImage] = useState(DUMMY_AVATAR);

  useEffect(() => {
    if (profile?.profilePicture) {
      setPreviewImage(profile.profilePicture);
    } else {
      setPreviewImage(DUMMY_AVATAR);
    }
  }, [profile?.profilePicture]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleProfileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setPreviewImage(localPreview);

    try {
      const response = await updateProfilePicture(file);
      setPreviewImage(response.profilePicture);
      setUser((prev) => ({
        ...prev,
        profilePicture: response.profilePicture,
      }));
    } catch (error) {
      console.error("Profile picture upload failed:", error);
    }
  };

  const formatRoleLabel = (role) => {
    if (!role) return "Student";
    const lower = role.toLowerCase();
    if (lower === "ta") return "Teaching Assistant";
    if (lower === "faculty" || lower === "teacher") return "Faculty";
    if (lower === "admin") return "Administrator";
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  const getRoleBadgeStyle = (role) => {
    const lower = (role || "").toLowerCase();
    if (lower === "admin") return "bg-purple-100 text-purple-800 border-purple-300";
    if (lower === "faculty" || lower === "teacher") return "bg-blue-100 text-blue-800 border-blue-300";
    if (lower === "ta") return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-emerald-100 text-emerald-800 border-emerald-300";
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#faf8ff] border-b border-[#c4c6cf] px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-[#002045]">Scholara</h1>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getRoleBadgeStyle(profile?.role)}`}>
            {formatRoleLabel(profile?.role)}
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-[#002045] rounded-lg hover:bg-[#eaedff]"
          aria-label="Toggle navigation"
        >
          <span className="material-symbols-outlined text-2xl">
            {isOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`h-screen w-64 fixed left-0 top-0 bg-[#faf8ff] border-r border-[#c4c6cf] flex flex-col py-6 px-4 z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="mb-6 px-2 flex items-center justify-between">
          <h1
            className="text-2xl font-bold text-[#002045]"
            data-testid="text-app-name"
          >
            Scholara
          </h1>
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getRoleBadgeStyle(profile?.role)}`}>
            {formatRoleLabel(profile?.role)}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-6 px-2">
          <label htmlFor="profile-upload">
            <img
              src={previewImage}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#d6e3ff] cursor-pointer hover:opacity-90 transition"
              data-testid="img-avatar-current-user"
            />
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfileUpload}
            />
          </label>

          <div className="overflow-hidden">
            <p
              className="font-semibold text-[#131b2e] text-sm truncate"
              data-testid="text-user-name"
            >
              {profile?.fullName ?? "Loading..."}
            </p>
            <p
              className="text-xs text-[#43474e] truncate"
              data-testid="text-user-role"
            >
              {profile ? `${profile.department || "Department"}` : "Student"}
            </p>
          </div>
        </div>

        <nav className="flex-grow space-y-1 overflow-y-auto">
          <SidebarItem
            icon="dashboard"
            text="Dashboard"
            href="/dashboard"
            active={location === "/dashboard"}
            onClick={() => setIsOpen(false)}
          />

          <SidebarItem
            icon="school"
            text="Course Workspaces"
            href="/courses"
            active={location.startsWith("/courses") || location === "/academic-hub"}
            onClick={() => setIsOpen(false)}
          />

          <SidebarItem
            icon="handshake"
            text="Skill Exchange"
            href="/skill-exchange"
            active={location === "/skill-exchange"}
            onClick={() => setIsOpen(false)}
          />

          <SidebarItem
            icon="event"
            text="My Sessions"
            href="/my-sessions"
            active={location === "/my-sessions"}
            onClick={() => setIsOpen(false)}
          />

          <SidebarItem
            icon="chat"
            text="Direct Messages"
            href="/messages"
            active={location.startsWith("/messages") || location.startsWith("/direct-messages")}
            onClick={() => setIsOpen(false)}
          />

          <SidebarItem
            icon="workspace_premium"
            text="Certificates"
            href="/certificates"
            active={location === "/certificates"}
            onClick={() => setIsOpen(false)}
          />

          <SidebarItem
            icon="calendar_today"
            text="Calendar"
            href="/calendar"
            active={location === "/calendar"}
            onClick={() => setIsOpen(false)}
          />

          <SidebarItem
            icon="campaign"
            text="Notice Board"
            href="/notice-board"
            active={location === "/notice-board"}
            onClick={() => setIsOpen(false)}
          />

          <SidebarItem
            icon="domain"
            text="Dept Channels"
            href="/department-channels"
            active={location === "/department-channels"}
            onClick={() => setIsOpen(false)}
          />

          <SidebarItem
            icon="groups"
            text="Study Groups"
            href="/study-groups"
            active={location.startsWith("/study-groups") || location === "/community"}
            onClick={() => setIsOpen(false)}
          />

          {/* Admin Control Panel Route */}
          {profile?.role === "admin" && (
            <SidebarItem
              icon="admin_panel_settings"
              text="Admin Portal"
              href="/admin"
              active={location.startsWith("/admin")}
              onClick={() => setIsOpen(false)}
            />
          )}
        </nav>

        <div className="border-t border-[#c4c6cf] pt-4 mt-auto">
          <SidebarItem
            icon="settings"
            text="Settings"
            href="/settings"
            active={location === "/settings"}
            onClick={() => setIsOpen(false)}
          />

          <SidebarItem
            icon="help"
            text="Help"
            href="/help"
            active={location === "/help"}
            onClick={() => setIsOpen(false)}
          />

          <button
            onClick={handleLogout}
            data-testid="button-logout"
            className="w-full mt-3 bg-[#002045] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#1a365d] transition flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}
