import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import C from "../constants/colors";
import MI from "../components/MI";

const RESOURCES = [
  {
    id: 1,
    title: "Data Structures & Algorithms",
    department: "CSE",
    type: "Lecture Notes",
    semester: "3rd",
    icon: "account_tree",
    color: "#1a365d",
    uploader: "Dr. Rahman",
    uploadedAt: "2026-07-28",
    downloads: 142,
  },
  {
    id: 2,
    title: "Digital Logic Design",
    department: "CSE",
    type: "Past Paper",
    semester: "2nd",
    icon: "memory",
    color: "#006b5f",
    uploader: "Faisal Ahmed",
    uploadedAt: "2026-07-20",
    downloads: 98,
  },
  {
    id: 3,
    title: "Engineering Mathematics II",
    department: "EEE",
    type: "Study Guide",
    semester: "2nd",
    icon: "functions",
    color: "#311c00",
    uploader: "Prof. Akter",
    uploadedAt: "2026-07-15",
    downloads: 210,
  },
  {
    id: 4,
    title: "Object-Oriented Programming",
    department: "CSE",
    type: "Lecture Notes",
    semester: "2nd",
    icon: "code",
    color: "#1a365d",
    uploader: "Dr. Hossain",
    uploadedAt: "2026-07-10",
    downloads: 185,
  },
  {
    id: 5,
    title: "Database Systems",
    department: "CSE",
    type: "Slides",
    semester: "4th",
    icon: "storage",
    color: "#006b5f",
    uploader: "Ms. Nadia",
    uploadedAt: "2026-07-05",
    downloads: 76,
  },
  {
    id: 6,
    title: "Computer Networks",
    department: "CSE",
    type: "Past Paper",
    semester: "5th",
    icon: "lan",
    color: "#311c00",
    uploader: "Dr. Islam",
    uploadedAt: "2026-06-30",
    downloads: 134,
  },
];

const TOOLS = [
  { name: "GPA Calculator", icon: "calculate", color: "#1a365d", desc: "Calculate your semester GPA instantly." },
  { name: "Course Planner", icon: "event_note", color: "#006b5f", desc: "Plan your course load for upcoming semesters." },
  { name: "Citation Generator", icon: "format_quote", color: "#311c00", desc: "APA, MLA, and IEEE citations in seconds." },
  { name: "Study Timer", icon: "timer", color: "#1a365d", desc: "Pomodoro-style focus sessions for deeper study." },
];

const STUDY_GROUPS = [
  {
    id: 1,
    name: "DSA Crunch Squad",
    subject: "Data Structures & Algorithms",
    department: "CSE",
    semester: "3rd",
    members: ["Ayesha", "Rahim", "Tanvir", "Sara"],
    maxMembers: 6,
    meetingTime: "Mon & Wed, 6:00 PM",
    mode: "Online",
    icon: "account_tree",
    color: "#1a365d",
    joined: false,
    owner: "Ayesha",
  },
  {
    id: 2,
    name: "Math Wizards",
    subject: "Engineering Mathematics II",
    department: "EEE",
    semester: "2nd",
    members: ["Nadia", "Farhan"],
    maxMembers: 5,
    meetingTime: "Sat, 10:00 AM",
    mode: "In-Person",
    icon: "functions",
    color: "#006b5f",
    joined: true,
    owner: "Nadia",
  },
  {
    id: 3,
    name: "DB Designers",
    subject: "Database Systems",
    department: "CSE",
    semester: "4th",
    members: ["Karim", "Lina", "Rafiq"],
    maxMembers: 4,
    meetingTime: "Fri, 3:00 PM",
    mode: "Hybrid",
    icon: "storage",
    color: "#311c00",
    joined: false,
    owner: "Karim",
  },
  {
    id: 4,
    name: "Network Ninjas",
    subject: "Computer Networks",
    department: "CSE",
    semester: "5th",
    members: ["Zara", "Bilal", "Meem", "Onik", "Sadia"],
    maxMembers: 5,
    meetingTime: "Tue & Thu, 7:00 PM",
    mode: "Online",
    icon: "lan",
    color: "#1a365d",
    joined: true,
    owner: "Zara",
  },
];

const TYPES = ["All", "Lecture Notes", "Past Paper", "Study Guide", "Slides"];
const DEPARTMENTS = ["All", "CSE", "EEE", "BBA", "ENG"];
const SEMESTERS = ["All", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

function typeColor(type) {
  const map = {
    "Lecture Notes": { bg: "#d6e3ff", text: "#1a365d" },
    "Past Paper":    { bg: "#b2f5ea", text: "#006b5f" },
    "Study Guide":   { bg: "#ffddb8", text: "#7a4600" },
    Slides:          { bg: "#f3e8ff", text: "#5b21b6" },
  };
  return map[type] || { bg: "#eaedff", text: "#43474e" };
}

export default function AcademicHub() {
  const { user } = useAuth();

  const profile = {
    fullName: user?.fullName,
    firstName: user?.fullName?.split(" ")[0],
    profilePicture: user?.profilePicture,
    department: user?.department,
    role: user?.role,
  };

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [semFilter, setSemFilter] = useState("All");
  const [toast, setToast] = useState(null);

  // Study Group state
  const [groups, setGroups] = useState(STUDY_GROUPS);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupTab, setGroupTab] = useState("all"); // "all" | "mine"
  const [newGroup, setNewGroup] = useState({
    name: "", subject: "", department: "CSE", semester: "1st",
    maxMembers: 5, meetingTime: "", mode: "Online",
  });

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = RESOURCES.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q || r.title.toLowerCase().includes(q) || r.uploader.toLowerCase().includes(q);
    const matchType = typeFilter === "All" || r.type === typeFilter;
    const matchDept = deptFilter === "All" || r.department === deptFilter;
    const matchSem = semFilter === "All" || r.semester === semFilter;
    return matchSearch && matchType && matchDept && matchSem;
  });

  return (
    <DashboardLayout profile={profile}>
      <main className="p-10" style={{ background: C.background, minHeight: "100vh" }}>
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div
            className="rounded-2xl p-8 mb-8 flex flex-wrap items-center justify-between gap-4"
            style={{
              background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryContainer} 100%)`,
            }}
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MI name="school" size={32} fill={1} />
                <h1 className="text-3xl font-bold" style={{ color: C.onPrimary }}>
                  Academic Hub
                </h1>
              </div>
              <p style={{ color: C.primaryFixedDim }}>
                Lecture notes, past papers, study guides, and academic tools — all in one place.
              </p>
            </div>
            <button
              onClick={() => showToast("Upload feature coming soon!")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: C.onPrimary, color: C.primary }}
            >
              <MI name="upload" size={20} />
              Upload Resource
            </button>
          </div>

          {/* Academic Tools */}
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-4" style={{ color: C.onSurface }}>
              Academic Tools
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TOOLS.map((tool) => (
                <button
                  key={tool.name}
                  onClick={() => showToast(`${tool.name} coming soon!`)}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl text-center transition-all hover:scale-[1.03] active:scale-[0.98]"
                  style={{
                    background: C.surfaceContainerLowest,
                    border: `1px solid ${C.outlineVariant}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: tool.color + "18" }}
                  >
                    <MI name={tool.icon} size={26} fill={1} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: C.onSurface }}>
                      {tool.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: C.onSurfaceVariant }}>
                      {tool.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Study Group Management */}
          <section className="mb-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-bold" style={{ color: C.onSurface }}>Study Group Management</h2>
                <p className="text-sm mt-0.5" style={{ color: C.onSurfaceVariant }}>
                  Create, join, and manage study groups for collaborative learning.
                </p>
              </div>
              <button
                onClick={() => setShowCreateGroup(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: C.primary, color: C.onPrimary }}
              >
                <MI name="group_add" size={20} />
                Create Group
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-5">
              {[{key:"all",label:"All Groups"},{key:"mine",label:"My Groups"}].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setGroupTab(tab.key)}
                  className="px-5 py-2 rounded-full text-sm font-semibold transition"
                  style={{
                    background: groupTab === tab.key ? C.primary : C.surfaceContainerLowest,
                    color: groupTab === tab.key ? C.onPrimary : C.onSurfaceVariant,
                    border: `1px solid ${groupTab === tab.key ? C.primary : C.outlineVariant}`,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Group Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {groups
                .filter(g => groupTab === "all" || g.joined)
                .map(g => {
                  const full = g.members.length >= g.maxMembers;
                  const isOwner = g.owner === profile.firstName;
                  return (
                    <div
                      key={g.id}
                      className="rounded-2xl p-5 flex flex-col gap-4"
                      style={{
                        background: g.joined
                          ? `linear-gradient(135deg, ${g.color}0d 0%, #fff 100%)`
                          : C.surfaceContainerLowest,
                        border: `1.5px solid ${g.joined ? g.color + "55" : C.outlineVariant}`,
                      }}
                    >
                      {/* Header */}
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: g.color + "18" }}
                        >
                          <MI name={g.icon} size={26} fill={1} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-sm" style={{ color: C.onSurface }}>{g.name}</p>
                            {g.joined && (
                              <span
                                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                style={{ background: "#b2f5ea", color: "#006b5f" }}
                              >
                                Joined
                              </span>
                            )}
                            {full && !g.joined && (
                              <span
                                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                style={{ background: "#fce4e4", color: "#ba1a1a" }}
                              >
                                Full
                              </span>
                            )}
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: C.onSurfaceVariant }}>
                            {g.subject}
                          </p>
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { icon: "group", label: `${g.members.length}/${g.maxMembers} members` },
                          { icon: "schedule", label: g.meetingTime },
                          { icon: "laptop_mac", label: g.mode },
                          { icon: "school", label: `${g.department} · ${g.semester} Sem` },
                        ].map(item => (
                          <div key={item.label} className="flex items-center gap-1.5">
                            <MI name={item.icon} size={14} />
                            <span className="text-xs" style={{ color: C.onSurfaceVariant }}>{item.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Members Avatars */}
                      <div className="flex items-center gap-1">
                        {g.members.slice(0, 4).map((m, i) => (
                          <div
                            key={i}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2"
                            style={{
                              background: ["#d6e3ff","#b2f5ea","#ffddb8","#f3e8ff"][i % 4],
                              color: ["#1a365d","#006b5f","#7a4600","#5b21b6"][i % 4],
                              borderColor: C.surfaceContainerLowest,
                              marginLeft: i > 0 ? "-6px" : 0,
                              zIndex: 4 - i,
                            }}
                          >
                            {m[0]}
                          </div>
                        ))}
                        {g.members.length > 4 && (
                          <span className="text-xs ml-2" style={{ color: C.onSurfaceVariant }}>
                            +{g.members.length - 4} more
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1" style={{ borderTop: `1px solid ${C.outlineVariant}` }}>
                        {g.joined ? (
                          <>
                            <button
                              onClick={() => showToast(`Opening ${g.name} group chat...`)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold"
                              style={{ background: g.color + "18", color: g.color }}
                            >
                              <MI name="chat" size={15} />
                              Group Chat
                            </button>
                            <button
                              onClick={() => showToast(`Opening ${g.name} resources...`)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold"
                              style={{ background: C.surfaceContainerHigh, color: C.onSurface }}
                            >
                              <MI name="folder_open" size={15} />
                              Resources
                            </button>
                            {!isOwner && (
                              <button
                                onClick={() => {
                                  setGroups(prev => prev.map(x => x.id === g.id
                                    ? { ...x, joined: false, members: x.members.filter(m => m !== profile.firstName) }
                                    : x
                                  ));
                                  showToast(`Left "${g.name}"`);
                                }}
                                className="ml-auto flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold"
                                style={{ background: "#fce4e4", color: C.error }}
                              >
                                <MI name="logout" size={15} />
                                Leave
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            disabled={full}
                            onClick={() => {
                              if (full) return;
                              setGroups(prev => prev.map(x => x.id === g.id
                                ? { ...x, joined: true, members: [...x.members, profile.firstName || "You"] }
                                : x
                              ));
                              showToast(`Joined "${g.name}"! 🎉`);
                            }}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold transition"
                            style={{
                              background: full ? C.surfaceContainerHigh : C.primary,
                              color: full ? C.outline : C.onPrimary,
                              cursor: full ? "not-allowed" : "pointer",
                            }}
                          >
                            <MI name="person_add" size={15} />
                            {full ? "Group Full" : "Join Group"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              }
            </div>

            {groupTab === "mine" && groups.filter(g => g.joined).length === 0 && (
              <div
                className="text-center py-16 rounded-2xl"
                style={{ background: C.surfaceContainerLowest, border: `1px dashed ${C.outlineVariant}` }}
              >
                <MI name="group" size={48} />
                <p className="mt-4 font-medium" style={{ color: C.onSurfaceVariant }}>You haven't joined any groups yet</p>
                <p className="text-sm mt-1" style={{ color: C.outline }}>Browse all groups and join one that fits your course.</p>
              </div>
            )}
          </section>

          {/* Create Group Modal */}
          {showCreateGroup && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: "rgba(0,0,0,0.45)" }}
              onClick={() => setShowCreateGroup(false)}
            >
              <div
                className="w-full max-w-lg rounded-2xl p-7 flex flex-col gap-5"
                style={{ background: C.surfaceContainerLowest }}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold" style={{ color: C.onSurface }}>Create Study Group</h3>
                  <button onClick={() => setShowCreateGroup(false)} style={{ color: C.outline }}>
                    <MI name="close" size={22} />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {[
                    { label: "Group Name", key: "name", type: "text", placeholder: "e.g. DSA Crunch Squad" },
                    { label: "Subject", key: "subject", type: "text", placeholder: "e.g. Data Structures" },
                    { label: "Meeting Time", key: "meetingTime", type: "text", placeholder: "e.g. Mon & Wed, 6:00 PM" },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-semibold mb-1" style={{ color: C.onSurfaceVariant }}>{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={newGroup[field.key]}
                        onChange={e => setNewGroup(p => ({ ...p, [field.key]: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                        style={{ background: C.surfaceContainerLow, borderColor: C.outlineVariant, color: C.onSurface }}
                      />
                    </div>
                  ))}

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: C.onSurfaceVariant }}>Department</label>
                      <select
                        value={newGroup.department}
                        onChange={e => setNewGroup(p => ({ ...p, department: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border"
                        style={{ background: C.surfaceContainerLow, borderColor: C.outlineVariant, color: C.onSurface }}
                      >
                        {["CSE","EEE","BBA","ENG"].map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: C.onSurfaceVariant }}>Semester</label>
                      <select
                        value={newGroup.semester}
                        onChange={e => setNewGroup(p => ({ ...p, semester: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border"
                        style={{ background: C.surfaceContainerLow, borderColor: C.outlineVariant, color: C.onSurface }}
                      >
                        {["1st","2nd","3rd","4th","5th","6th","7th","8th"].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: C.onSurfaceVariant }}>Mode</label>
                      <select
                        value={newGroup.mode}
                        onChange={e => setNewGroup(p => ({ ...p, mode: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border"
                        style={{ background: C.surfaceContainerLow, borderColor: C.outlineVariant, color: C.onSurface }}
                      >
                        {["Online","In-Person","Hybrid"].map(m => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: C.onSurfaceVariant }}>Max Members</label>
                    <input
                      type="number" min={2} max={20}
                      value={newGroup.maxMembers}
                      onChange={e => setNewGroup(p => ({ ...p, maxMembers: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                      style={{ background: C.surfaceContainerLow, borderColor: C.outlineVariant, color: C.onSurface }}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setShowCreateGroup(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: C.surfaceContainerHigh, color: C.onSurface }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!newGroup.name.trim() || !newGroup.subject.trim()) {
                        showToast("Please fill in Group Name and Subject.");
                        return;
                      }
                      const icons = ["groups","bookmark","star","local_library"];
                      const colors = ["#1a365d","#006b5f","#311c00"];
                      setGroups(prev => [{
                        id: Date.now(),
                        name: newGroup.name,
                        subject: newGroup.subject,
                        department: newGroup.department,
                        semester: newGroup.semester,
                        members: [profile.firstName || "You"],
                        maxMembers: newGroup.maxMembers,
                        meetingTime: newGroup.meetingTime || "TBD",
                        mode: newGroup.mode,
                        icon: icons[Math.floor(Math.random() * icons.length)],
                        color: colors[Math.floor(Math.random() * colors.length)],
                        joined: true,
                        owner: profile.firstName || "You",
                      }, ...prev]);
                      setNewGroup({ name:"", subject:"", department:"CSE", semester:"1st", maxMembers:5, meetingTime:"", mode:"Online" });
                      setShowCreateGroup(false);
                      showToast(`"${newGroup.name}" created! 🎉`);
                    }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: C.primary, color: C.onPrimary }}
                  >
                    Create Group
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Course Materials Repository */}
          <section>
            <h2 className="text-lg font-bold mb-4" style={{ color: C.onSurface }}>
              Course Materials Repository
            </h2>

            {/* Search */}
            <div className="relative mb-5">
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: C.outline }}
              >
                <MI name="search" size={20} />
              </span>
              <input
                type="text"
                placeholder="Search by title, uploader..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl text-sm outline-none border"
                style={{
                  background: C.surfaceContainerLowest,
                  borderColor: C.outlineVariant,
                  color: C.onSurface,
                }}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-7">
              {/* Type */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.outline }}>
                  Type
                </span>
                {TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className="px-3 py-1 rounded-full text-xs font-medium transition"
                    style={{
                      background: typeFilter === t ? C.primary : C.surfaceContainerLowest,
                      color: typeFilter === t ? C.onPrimary : C.onSurfaceVariant,
                      border: `1px solid ${typeFilter === t ? C.primary : C.outlineVariant}`,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Dept */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.outline }}>
                  Dept
                </span>
                {DEPARTMENTS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDeptFilter(d)}
                    className="px-3 py-1 rounded-full text-xs font-medium transition"
                    style={{
                      background: deptFilter === d ? C.secondary : C.surfaceContainerLowest,
                      color: deptFilter === d ? C.onSecondary : C.onSurfaceVariant,
                      border: `1px solid ${deptFilter === d ? C.secondary : C.outlineVariant}`,
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Semester */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.outline }}>
                  Semester
                </span>
                {SEMESTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSemFilter(s)}
                    className="px-3 py-1 rounded-full text-xs font-medium transition"
                    style={{
                      background: semFilter === s ? C.tertiary : C.surfaceContainerLowest,
                      color: semFilter === s ? "#fff" : C.onSurfaceVariant,
                      border: `1px solid ${semFilter === s ? C.tertiary : C.outlineVariant}`,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Resource Cards */}
            {filtered.length === 0 ? (
              <div
                className="text-center py-20 rounded-2xl"
                style={{
                  background: C.surfaceContainerLowest,
                  border: `1px dashed ${C.outlineVariant}`,
                }}
              >
                <MI name="search_off" size={48} />
                <p className="mt-4 font-medium" style={{ color: C.onSurfaceVariant }}>
                  No resources found
                </p>
                <p className="text-sm mt-1" style={{ color: C.outline }}>
                  Try adjusting your filters or search query.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((r) => {
                  const badge = typeColor(r.type);
                  return (
                    <div
                      key={r.id}
                      className="rounded-2xl p-5 flex flex-col gap-4 transition-all hover:shadow-md cursor-pointer"
                      style={{
                        background: C.surfaceContainerLowest,
                        border: `1px solid ${C.outlineVariant}`,
                      }}
                      onClick={() => showToast(`Opening "${r.title}"...`)}
                    >
                      {/* Top row */}
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: r.color + "18" }}
                        >
                          <MI name={r.icon} size={26} fill={1} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-semibold text-sm leading-snug line-clamp-2"
                            style={{ color: C.onSurface }}
                          >
                            {r.title}
                          </p>
                          <p className="text-xs mt-1" style={{ color: C.onSurfaceVariant }}>
                            {r.department} · {r.semester} Semester
                          </p>
                        </div>
                      </div>

                      {/* Type badge */}
                      <span
                        className="self-start px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ background: badge.bg, color: badge.text }}
                      >
                        {r.type}
                      </span>

                      {/* Footer */}
                      <div
                        className="flex items-center justify-between text-xs pt-3"
                        style={{
                          borderTop: `1px solid ${C.outlineVariant}`,
                          color: C.onSurfaceVariant,
                        }}
                      >
                        <span className="flex items-center gap-1">
                          <MI name="person" size={14} />
                          {r.uploader}
                        </span>
                        <span className="flex items-center gap-1">
                          <MI name="download" size={14} />
                          {r.downloads}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[70] px-5 py-3 rounded-xl text-sm font-semibold shadow-lg"
          style={{ background: C.primary, color: C.onPrimary }}
        >
          {toast}
        </div>
      )}
    </DashboardLayout>
  );
}
