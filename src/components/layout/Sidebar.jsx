const DUMMY_AVATAR =
  'https://media.istockphoto.com/id/1288129985/tr/vekt%C3%B6r/bir-ki%C5%9Finin-yer-tutucunun-eksik-g%C3%B6r%C3%BCnt%C3%BCs%C3%BC.jpg';

function SidebarItem({ icon, text, active }) {
  return (
    <a
      href="#"
      data-testid={`link-nav-${text.toLowerCase().replace(/\s+/g, '-')}`}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'text-[#002045] bg-[#d6e3ff] border-r-4 border-[#002045] rounded-r-none'
          : 'text-[#43474e] hover:bg-[#eaedff]'
      }`}
    >
      <span className="material-symbols-outlined text-[22px]">{icon}</span>
      {text}
    </a>
  );
}

export function Sidebar({ profile }) {
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-[#faf8ff] border-r border-[#c4c6cf] flex flex-col py-6 px-4 z-50">
      <div className="mb-10 px-2">
        <h1 className="text-2xl font-bold text-[#002045]" data-testid="text-app-name">
          Scholara
        </h1>
      </div>

      <div className="flex items-center gap-3 mb-8 px-2">
        <img
          src={profile?.avatarUrl || DUMMY_AVATAR}
          alt="Profile"
          className="w-12 h-12 rounded-full object-cover ring-2 ring-[#d6e3ff]"
          data-testid="img-avatar-current-user"
        />
        <div>
          <p className="font-semibold text-[#131b2e] text-sm" data-testid="text-user-name">
            {profile?.name ?? 'Loading...'}
          </p>
          <p className="text-xs text-[#43474e]" data-testid="text-user-role">
            {profile?.role ?? 'Student'}
          </p>
        </div>
      </div>

      <nav className="flex-grow space-y-2">
        <SidebarItem icon="dashboard" text="Dashboard" active />
        <SidebarItem icon="school" text="Academic Hub" />
        <SidebarItem icon="handshake" text="Skill Exchange" />
        <SidebarItem icon="calendar_today" text="Calendar" />
        <SidebarItem icon="groups" text="Community" />
      </nav>

      <div className="border-t border-[#c4c6cf] pt-4">
        <SidebarItem icon="settings" text="Settings" />
        <SidebarItem icon="help" text="Help" />
        <button
          data-testid="button-switch-mode"
          className="w-full mt-4 bg-[#002045] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#1a365d] transition"
        >
          Switch Mode
        </button>
      </div>
    </aside>
  );
}
