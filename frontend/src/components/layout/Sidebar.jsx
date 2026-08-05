import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateProfilePicture } from "../../api/auth";

const DUMMY_AVATAR =
  "https://media.istockphoto.com/id/1288129985/tr/vekt%C3%B6r/bir-ki%C5%9Finin-yer-tutucunun-eksik-g%C3%B6r%C3%BCnt%C3%BCs%C3%BC.jpg";

function SidebarItem({ icon, text, href, active }) {
  return (
    <Link
      href={href}
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

    // Show image immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewImage(localPreview);

    try {
      const response = await updateProfilePicture(file);

      // Replace preview with Cloudinary URL
      setPreviewImage(response.profilePicture);

      // Update logged-in user
      setUser((prev) => ({
        ...prev,
        profilePicture: response.profilePicture,
      }));
    } catch (error) {
      console.error("Profile picture upload failed:", error);
    }
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-[#faf8ff] border-r border-[#c4c6cf] flex flex-col py-6 px-4 z-50">
      <div className="mb-10 px-2">
        <h1
          className="text-2xl font-bold text-[#002045]"
          data-testid="text-app-name"
        >
          Scholara
        </h1>
      </div>

      <div className="flex items-center gap-3 mb-8 px-2">
        <label htmlFor="profile-upload">
          <img
            src={previewImage}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover ring-2 ring-[#d6e3ff] cursor-pointer"
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

        <div>
          <p
            className="font-semibold text-[#131b2e] text-sm"
            data-testid="text-user-name"
          >
            {profile?.fullName ?? "Loading..."}
          </p>

          <p
            className="text-xs text-[#43474e]"
            data-testid="text-user-role"
          >
            {profile
              ? `${profile.department || "Department"}, ${
                  profile.role
                    ? profile.role.charAt(0).toUpperCase() +
                      profile.role.slice(1)
                    : "Student"
                }`
              : "Student"}
          </p>
        </div>
      </div>

      <nav className="flex-grow space-y-2">
        <SidebarItem
          icon="dashboard"
          text="Dashboard"
          href="/dashboard"
          active={location === "/dashboard"}
        />

        <SidebarItem
          icon="school"
          text="Academic Hub"
          href="/academic-hub"
          active={location === "/academic-hub"}
        />

        <SidebarItem
          icon="handshake"
          text="Skill Exchange"
          href="/skill-exchange"
          active={location === "/skill-exchange"}
        />

        <SidebarItem
          icon="event"
          text="My Sessions"
          href="/my-sessions"
          active={location === "/my-sessions"}
        />

        <SidebarItem
          icon="calendar_today"
          text="Calendar"
          href="/calendar"
          active={location === "/calendar"}
        />
        <SidebarItem
          icon="campaign"
          text="Notice Board"
          href="/notice-board"
          active={
            location === "/notice-board" || location === "/academic-hub"
          }
        />

        <SidebarItem
          icon="groups"
          text="Community"
          href="/community"
          active={location === "/community"}
        />
      </nav>

      <div className="border-t border-[#c4c6cf] pt-4">
        <SidebarItem
          icon="settings"
          text="Settings"
          href="/settings"
          active={location === "/settings"}
        />

        <SidebarItem
          icon="help"
          text="Help"
          href="/help"
          active={location === "/help"}
        />

        <button
          onClick={handleLogout}
          data-testid="button-logout"
          className="w-full mt-4 bg-[#002045] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#1a365d] transition"
        >
          Log Out
        </button>
      </div>
    </aside>
  );
}
