import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import C from "../constants/colors";
import MI from "../components/MI";

// ─── Mock Data ──────────────────────────────────────────────────────────────

const COURSES = [
  { id: "CSE470", name: "Software Engineering", faculty: "Dr. Rahman", credits: 3, color: "#1a365d" },
  { id: "CSE460", name: "Artificial Intelligence", faculty: "Prof. Hossain", credits: 3, color: "#006b5f" },
  { id: "CSE450", name: "Computer Networks", faculty: "Dr. Islam", credits: 3, color: "#311c00" },
];

const ANNOUNCEMENTS_DATA = [
  {
    id: 1,
    courseId: "CSE470",
    title: "Mid-term Exam Schedule Released",
    body: "The mid-term exam for CSE470 will be held on August 20, 2026 from 9:00 AM – 11:00 AM in Room 301. Please bring your student ID.",
    faculty: "Dr. Rahman",
    postedAt: "2026-08-04T10:00:00Z",
    pinned: true,
    type: "exam",
  },
  {
    id: 2,
    courseId: "CSE460",
    title: "Lab Report Submission Reminder",
    body: "Lab Report #3 (Neural Networks) must be submitted via the portal by August 10. Late submissions will incur a 10% deduction per day.",
    faculty: "Prof. Hossain",
    postedAt: "2026-08-03T14:30:00Z",
    pinned: false,
    type: "reminder",
  },
  {
    id: 3,
    courseId: "CSE470",
    title: "Guest Lecture: Agile Methodologies",
    body: "A guest lecture by Mr. Tanvir Ahmed (Senior SWE, BJIT) on Agile & Scrum practices will be held on August 12 at 2:00 PM. Attendance is mandatory.",
    faculty: "Dr. Rahman",
    postedAt: "2026-08-02T09:00:00Z",
    pinned: false,
    type: "event",
  },
  {
    id: 4,
    courseId: "CSE450",
    title: "Assignment 2 Graded – Check Feedback",
    body: "Assignment 2 has been graded. Please log in to review your marks and faculty feedback. Recheck requests must be submitted within 3 days.",
    faculty: "Dr. Islam",
    postedAt: "2026-08-01T16:00:00Z",
    pinned: false,
    type: "grade",
  },
];

const ASSIGNMENTS_DATA = [
  {
    id: 1,
    courseId: "CSE470",
    title: "Requirement Analysis Report",
    description: "Conduct a full requirement analysis for your assigned project. Deliverables: SRS document (IEEE format), Use Case diagrams, and a 5-min presentation.",
    dueDate: "2026-08-15",
    totalMarks: 20,
    status: "pending",
    submittedAt: null,
    grade: null,
    feedback: null,
  },
  {
    id: 2,
    courseId: "CSE460",
    title: "Minimax Algorithm Implementation",
    description: "Implement the Minimax algorithm with Alpha-Beta pruning for a Tic-Tac-Toe game. Submit Python source code and a report.",
    dueDate: "2026-08-10",
    totalMarks: 15,
    status: "submitted",
    submittedAt: "2026-08-08T20:45:00Z",
    grade: null,
    feedback: null,
  },
  {
    id: 3,
    courseId: "CSE450",
    title: "TCP/IP Protocol Analysis",
    description: "Use Wireshark to capture and analyze TCP/IP packets. Document findings and explain the 3-way handshake with annotated screenshots.",
    dueDate: "2026-07-30",
    totalMarks: 25,
    status: "graded",
    submittedAt: "2026-07-29T18:00:00Z",
    grade: 22,
    feedback: "Excellent analysis. Diagrams were clear and well-annotated. Minor issue with the conclusion section.",
  },
  {
    id: 4,
    courseId: "CSE470",
    title: "Design Patterns Case Study",
    description: "Identify and document 5 design patterns used in an open-source project of your choice. Include UML diagrams and code snippets.",
    dueDate: "2026-08-25",
    totalMarks: 20,
    status: "pending",
    submittedAt: null,
    grade: null,
    feedback: null,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysUntil(dateStr) {
  const due = new Date(dateStr);
  const now = new Date();
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatDateTime(isoStr) {
  return new Date(isoStr).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

const ANNOUNCE_TYPE_STYLE = {
  exam:     { bg: "#fce4e4", text: "#ba1a1a", icon: "quiz" },
  reminder: { bg: "#ffddb8", text: "#7a4600", icon: "notifications" },
  event:    { bg: "#d6e3ff", text: "#1a365d", icon: "event" },
  grade:    { bg: "#b2f5ea", text: "#006b5f", icon: "grade" },
};

function statusBadge(status, daysLeft) {
  if (status === "graded")    return { bg: "#b2f5ea", text: "#006b5f", label: "Graded" };
  if (status === "submitted") return { bg: "#d6e3ff", text: "#1a365d", label: "Submitted" };
  if (daysLeft < 0)           return { bg: "#fce4e4", text: "#ba1a1a", label: "Overdue" };
  if (daysLeft <= 3)          return { bg: "#ffddb8", text: "#7a4600", label: `Due in ${daysLeft}d` };
  return { bg: "#eaedff", text: "#43474e", label: `Due in ${daysLeft}d` };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MyCourses() {
  const { user } = useAuth();
  const isFaculty = user?.role === "faculty" || user?.role === "teacher";

  const profile = {
    fullName: user?.fullName,
    firstName: user?.fullName?.split(" ")[0],
    profilePicture: user?.profilePicture,
    department: user?.department,
    role: user?.role,
  };

  const [activeCourse, setActiveCourse] = useState("all");
  const [activeTab, setActiveTab] = useState("announcements"); // "announcements" | "assignments"
  const [toast, setToast] = useState(null);

  // Announcements state
  const [announcements, setAnnouncements] = useState(ANNOUNCEMENTS_DATA);
  const [showCreateAnnounce, setShowCreateAnnounce] = useState(false);
  const [newAnnounce, setNewAnnounce] = useState({ courseId: "CSE470", title: "", body: "", type: "reminder" });
  const [expandedAnnounce, setExpandedAnnounce] = useState(null);

  // Assignments state
  const [assignments, setAssignments] = useState(ASSIGNMENTS_DATA);
  const [showCreateAssign, setShowCreateAssign] = useState(false);
  const [newAssign, setNewAssign] = useState({ courseId: "CSE470", title: "", description: "", dueDate: "", totalMarks: 20 });
  const [gradingAssign, setGradingAssign] = useState(null);
  const [gradeInput, setGradeInput] = useState({ grade: "", feedback: "" });
  const [expandedAssign, setExpandedAssign] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const filteredAnnouncements = announcements.filter(
    a => activeCourse === "all" || a.courseId === activeCourse
  ).sort((a, b) => b.pinned - a.pinned || new Date(b.postedAt) - new Date(a.postedAt));

  const filteredAssignments = assignments.filter(
    a => activeCourse === "all" || a.courseId === activeCourse
  ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const courseOf = (id) => COURSES.find(c => c.id === id);

  return (
    <DashboardLayout profile={profile}>
      <main className="p-10" style={{ background: C.background, minHeight: "100vh" }}>
        <div className="max-w-6xl mx-auto">

          {/* ── Header ── */}
          <div
            className="rounded-2xl p-8 mb-8 flex flex-wrap items-center justify-between gap-4"
            style={{ background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryContainer} 100%)` }}
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MI name="menu_book" size={32} fill={1} />
                <h1 className="text-3xl font-bold" style={{ color: C.onPrimary }}>My Courses</h1>
              </div>
              <p style={{ color: C.primaryFixedDim }}>
                Course announcements, assignments, deadlines, and grading — all in one place.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {isFaculty && activeTab === "announcements" && (
                <button
                  onClick={() => setShowCreateAnnounce(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: C.onPrimary, color: C.primary }}
                >
                  <MI name="add" size={20} /> Post Announcement
                </button>
              )}
              {isFaculty && activeTab === "assignments" && (
                <button
                  onClick={() => setShowCreateAssign(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: C.onPrimary, color: C.primary }}
                >
                  <MI name="add" size={20} /> Create Assignment
                </button>
              )}
            </div>
          </div>

          {/* ── Course Filter Pills ── */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveCourse("all")}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition"
              style={{
                background: activeCourse === "all" ? C.primary : C.surfaceContainerLowest,
                color: activeCourse === "all" ? C.onPrimary : C.onSurfaceVariant,
                border: `1px solid ${activeCourse === "all" ? C.primary : C.outlineVariant}`,
              }}
            >All Courses</button>
            {COURSES.map(c => (
              <button key={c.id} onClick={() => setActiveCourse(c.id)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition"
                style={{
                  background: activeCourse === c.id ? c.color : C.surfaceContainerLowest,
                  color: activeCourse === c.id ? "#fff" : C.onSurfaceVariant,
                  border: `1px solid ${activeCourse === c.id ? c.color : C.outlineVariant}`,
                }}
              >{c.id} – {c.name}</button>
            ))}
          </div>

          {/* ── Tabs ── */}
          <div className="flex gap-2 mb-7">
            {[
              { key: "announcements", icon: "campaign", label: "Course Announcements" },
              { key: "assignments",   icon: "assignment", label: "Assignment Management" },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition"
                style={{
                  background: activeTab === tab.key ? C.primary : C.surfaceContainerLowest,
                  color: activeTab === tab.key ? C.onPrimary : C.onSurfaceVariant,
                  border: `1px solid ${activeTab === tab.key ? C.primary : C.outlineVariant}`,
                }}
              >
                <MI name={tab.icon} size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* ════════════════ ANNOUNCEMENTS TAB ════════════════ */}
          {activeTab === "announcements" && (
            <section>
              {filteredAnnouncements.length === 0 ? (
                <div className="text-center py-20 rounded-2xl"
                  style={{ background: C.surfaceContainerLowest, border: `1px dashed ${C.outlineVariant}` }}>
                  <MI name="campaign" size={48} />
                  <p className="mt-4 font-medium" style={{ color: C.onSurfaceVariant }}>No announcements yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredAnnouncements.map(a => {
                    const style = ANNOUNCE_TYPE_STYLE[a.type] || ANNOUNCE_TYPE_STYLE.reminder;
                    const course = courseOf(a.courseId);
                    const isExpanded = expandedAnnounce === a.id;
                    return (
                      <div key={a.id}
                        className="rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md"
                        style={{
                          background: C.surfaceContainerLowest,
                          border: `1.5px solid ${a.pinned ? C.primary + "55" : C.outlineVariant}`,
                        }}
                        onClick={() => setExpandedAnnounce(isExpanded ? null : a.id)}
                      >
                        <div className="flex items-start gap-4">
                          {/* Type icon */}
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: style.bg }}>
                            <MI name={style.icon} size={20} fill={1} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              {a.pinned && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                                  style={{ background: C.primaryFixed, color: C.primary }}>
                                  <MI name="push_pin" size={12} fill={1} /> Pinned
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                                style={{ background: style.bg, color: style.text }}>{a.type}</span>
                              {course && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                  style={{ background: course.color + "18", color: course.color }}>
                                  {course.id}
                                </span>
                              )}
                            </div>
                            <p className="font-bold text-sm" style={{ color: C.onSurface }}>{a.title}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: C.onSurfaceVariant }}>
                              <span className="flex items-center gap-1"><MI name="person" size={13} />{a.faculty}</span>
                              <span className="flex items-center gap-1"><MI name="schedule" size={13} />{formatDateTime(a.postedAt)}</span>
                            </div>
                          </div>

                          <MI name={isExpanded ? "expand_less" : "expand_more"} size={22} />
                        </div>

                        {isExpanded && (
                          <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${C.outlineVariant}` }}>
                            <p className="text-sm leading-relaxed" style={{ color: C.onSurface }}>{a.body}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* ════════════════ ASSIGNMENTS TAB ════════════════ */}
          {activeTab === "assignments" && (
            <section>
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
                {[
                  { label: "Total", value: filteredAssignments.length, icon: "assignment", color: C.primary },
                  { label: "Pending", value: filteredAssignments.filter(a => a.status === "pending").length, icon: "pending", color: "#7a4600" },
                  { label: "Submitted", value: filteredAssignments.filter(a => a.status === "submitted").length, icon: "task_alt", color: "#1a365d" },
                  { label: "Graded", value: filteredAssignments.filter(a => a.status === "graded").length, icon: "grade", color: "#006b5f" },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-4 flex items-center gap-3"
                    style={{ background: C.surfaceContainerLowest, border: `1px solid ${C.outlineVariant}` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: s.color + "18" }}>
                      <MI name={s.icon} size={22} fill={1} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-xs" style={{ color: C.onSurfaceVariant }}>{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {filteredAssignments.length === 0 ? (
                <div className="text-center py-20 rounded-2xl"
                  style={{ background: C.surfaceContainerLowest, border: `1px dashed ${C.outlineVariant}` }}>
                  <MI name="assignment" size={48} />
                  <p className="mt-4 font-medium" style={{ color: C.onSurfaceVariant }}>No assignments yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredAssignments.map(a => {
                    const daysLeft = daysUntil(a.dueDate);
                    const badge = statusBadge(a.status, daysLeft);
                    const course = courseOf(a.courseId);
                    const isExpanded = expandedAssign === a.id;
                    return (
                      <div key={a.id} className="rounded-2xl overflow-hidden"
                        style={{ border: `1.5px solid ${C.outlineVariant}`, background: C.surfaceContainerLowest }}>

                        {/* Card header — always visible */}
                        <div className="p-5 cursor-pointer flex items-start gap-4"
                          onClick={() => setExpandedAssign(isExpanded ? null : a.id)}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: (course?.color || C.primary) + "18" }}>
                            <MI name="assignment" size={22} fill={1} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                style={{ background: badge.bg, color: badge.text }}>{badge.label}</span>
                              {course && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                  style={{ background: course.color + "18", color: course.color }}>{course.id}</span>
                              )}
                            </div>
                            <p className="font-bold text-sm" style={{ color: C.onSurface }}>{a.title}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs" style={{ color: C.onSurfaceVariant }}>
                              <span className="flex items-center gap-1"><MI name="event" size={13} />Due: {formatDate(a.dueDate)}</span>
                              <span className="flex items-center gap-1"><MI name="grade" size={13} />Marks: {a.totalMarks}</span>
                              {a.status === "graded" && (
                                <span className="flex items-center gap-1 font-semibold" style={{ color: "#006b5f" }}>
                                  <MI name="check_circle" size={13} />Score: {a.grade}/{a.totalMarks}
                                </span>
                              )}
                            </div>
                          </div>
                          <MI name={isExpanded ? "expand_less" : "expand_more"} size={22} />
                        </div>

                        {/* Expanded detail */}
                        {isExpanded && (
                          <div className="px-5 pb-5 flex flex-col gap-4"
                            style={{ borderTop: `1px solid ${C.outlineVariant}` }}>
                            <p className="text-sm leading-relaxed mt-4" style={{ color: C.onSurface }}>
                              {a.description}
                            </p>

                            {/* Submission info */}
                            {a.submittedAt && (
                              <div className="flex items-center gap-2 text-xs p-3 rounded-xl"
                                style={{ background: "#d6e3ff", color: "#1a365d" }}>
                                <MI name="task_alt" size={16} fill={1} />
                                Submitted on {formatDateTime(a.submittedAt)}
                              </div>
                            )}

                            {/* Feedback */}
                            {a.feedback && (
                              <div className="p-4 rounded-xl"
                                style={{ background: "#b2f5ea20", border: "1px solid #b2f5ea" }}>
                                <p className="text-xs font-semibold mb-1" style={{ color: "#006b5f" }}>
                                  Faculty Feedback
                                </p>
                                <p className="text-sm" style={{ color: C.onSurface }}>{a.feedback}</p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 pt-1">
                              {/* Student: Submit */}
                              {!isFaculty && a.status === "pending" && (
                                <button
                                  onClick={() => {
                                    setAssignments(prev => prev.map(x => x.id === a.id
                                      ? { ...x, status: "submitted", submittedAt: new Date().toISOString() }
                                      : x
                                    ));
                                    showToast(`"${a.title}" submitted! ✅`);
                                  }}
                                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold"
                                  style={{ background: C.primary, color: C.onPrimary }}
                                >
                                  <MI name="upload_file" size={18} /> Submit Assignment
                                </button>
                              )}

                              {/* Faculty: Grade */}
                              {isFaculty && a.status === "submitted" && (
                                <button
                                  onClick={() => { setGradingAssign(a); setGradeInput({ grade: "", feedback: "" }); }}
                                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold"
                                  style={{ background: "#006b5f", color: "#fff" }}
                                >
                                  <MI name="grade" size={18} /> Grade Submission
                                </button>
                              )}

                              <button
                                onClick={() => showToast("Downloading assignment brief...")}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                                style={{ background: C.surfaceContainerHigh, color: C.onSurface }}
                              >
                                <MI name="download" size={18} /> Download Brief
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* ═══ Create Announcement Modal ═══ */}
      {showCreateAnnounce && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setShowCreateAnnounce(false)}>
          <div className="w-full max-w-lg rounded-2xl p-7 flex flex-col gap-5"
            style={{ background: C.surfaceContainerLowest }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold" style={{ color: C.onSurface }}>Post Announcement</h3>
              <button onClick={() => setShowCreateAnnounce(false)} style={{ color: C.outline }}><MI name="close" size={22} /></button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: C.onSurfaceVariant }}>Course</label>
                <select value={newAnnounce.courseId} onChange={e => setNewAnnounce(p => ({ ...p, courseId: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                  style={{ background: C.surfaceContainerLow, borderColor: C.outlineVariant, color: C.onSurface }}>
                  {COURSES.map(c => <option key={c.id} value={c.id}>{c.id} – {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: C.onSurfaceVariant }}>Type</label>
                <select value={newAnnounce.type} onChange={e => setNewAnnounce(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                  style={{ background: C.surfaceContainerLow, borderColor: C.outlineVariant, color: C.onSurface }}>
                  {["reminder","exam","event","grade"].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: C.onSurfaceVariant }}>Title</label>
                <input type="text" placeholder="Announcement title"
                  value={newAnnounce.title} onChange={e => setNewAnnounce(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                  style={{ background: C.surfaceContainerLow, borderColor: C.outlineVariant, color: C.onSurface }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: C.onSurfaceVariant }}>Message</label>
                <textarea rows={4} placeholder="Write your announcement..."
                  value={newAnnounce.body} onChange={e => setNewAnnounce(p => ({ ...p, body: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border resize-none"
                  style={{ background: C.surfaceContainerLow, borderColor: C.outlineVariant, color: C.onSurface }} />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowCreateAnnounce(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: C.surfaceContainerHigh, color: C.onSurface }}>Cancel</button>
              <button
                onClick={() => {
                  if (!newAnnounce.title.trim() || !newAnnounce.body.trim()) { showToast("Please fill all fields."); return; }
                  setAnnouncements(prev => [{
                    id: Date.now(), courseId: newAnnounce.courseId, title: newAnnounce.title,
                    body: newAnnounce.body, faculty: profile.fullName || "Faculty",
                    postedAt: new Date().toISOString(), pinned: false, type: newAnnounce.type,
                  }, ...prev]);
                  setNewAnnounce({ courseId: "CSE470", title: "", body: "", type: "reminder" });
                  setShowCreateAnnounce(false);
                  showToast("Announcement posted! 📢");
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: C.primary, color: C.onPrimary }}>Post</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Create Assignment Modal ═══ */}
      {showCreateAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setShowCreateAssign(false)}>
          <div className="w-full max-w-lg rounded-2xl p-7 flex flex-col gap-5"
            style={{ background: C.surfaceContainerLowest }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold" style={{ color: C.onSurface }}>Create Assignment</h3>
              <button onClick={() => setShowCreateAssign(false)} style={{ color: C.outline }}><MI name="close" size={22} /></button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: C.onSurfaceVariant }}>Course</label>
                <select value={newAssign.courseId} onChange={e => setNewAssign(p => ({ ...p, courseId: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                  style={{ background: C.surfaceContainerLow, borderColor: C.outlineVariant, color: C.onSurface }}>
                  {COURSES.map(c => <option key={c.id} value={c.id}>{c.id} – {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: C.onSurfaceVariant }}>Title</label>
                <input type="text" placeholder="Assignment title"
                  value={newAssign.title} onChange={e => setNewAssign(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                  style={{ background: C.surfaceContainerLow, borderColor: C.outlineVariant, color: C.onSurface }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: C.onSurfaceVariant }}>Description</label>
                <textarea rows={3} placeholder="Describe the assignment task..."
                  value={newAssign.description} onChange={e => setNewAssign(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border resize-none"
                  style={{ background: C.surfaceContainerLow, borderColor: C.outlineVariant, color: C.onSurface }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: C.onSurfaceVariant }}>Due Date</label>
                  <input type="date" value={newAssign.dueDate}
                    onChange={e => setNewAssign(p => ({ ...p, dueDate: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                    style={{ background: C.surfaceContainerLow, borderColor: C.outlineVariant, color: C.onSurface }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: C.onSurfaceVariant }}>Total Marks</label>
                  <input type="number" min={1} max={100} value={newAssign.totalMarks}
                    onChange={e => setNewAssign(p => ({ ...p, totalMarks: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                    style={{ background: C.surfaceContainerLow, borderColor: C.outlineVariant, color: C.onSurface }} />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowCreateAssign(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: C.surfaceContainerHigh, color: C.onSurface }}>Cancel</button>
              <button
                onClick={() => {
                  if (!newAssign.title.trim() || !newAssign.dueDate) { showToast("Please fill all fields."); return; }
                  setAssignments(prev => [{
                    id: Date.now(), courseId: newAssign.courseId, title: newAssign.title,
                    description: newAssign.description, dueDate: newAssign.dueDate,
                    totalMarks: newAssign.totalMarks, status: "pending",
                    submittedAt: null, grade: null, feedback: null,
                  }, ...prev]);
                  setNewAssign({ courseId: "CSE470", title: "", description: "", dueDate: "", totalMarks: 20 });
                  setShowCreateAssign(false);
                  showToast("Assignment created! 📋");
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: C.primary, color: C.onPrimary }}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Grade Assignment Modal ═══ */}
      {gradingAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setGradingAssign(null)}>
          <div className="w-full max-w-md rounded-2xl p-7 flex flex-col gap-5"
            style={{ background: C.surfaceContainerLowest }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold" style={{ color: C.onSurface }}>Grade Assignment</h3>
              <button onClick={() => setGradingAssign(null)} style={{ color: C.outline }}><MI name="close" size={22} /></button>
            </div>
            <p className="text-sm font-semibold" style={{ color: C.onSurfaceVariant }}>{gradingAssign.title}</p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: C.onSurfaceVariant }}>
                  Score (out of {gradingAssign.totalMarks})
                </label>
                <input type="number" min={0} max={gradingAssign.totalMarks}
                  placeholder={`0 – ${gradingAssign.totalMarks}`}
                  value={gradeInput.grade}
                  onChange={e => setGradeInput(p => ({ ...p, grade: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                  style={{ background: C.surfaceContainerLow, borderColor: C.outlineVariant, color: C.onSurface }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: C.onSurfaceVariant }}>Feedback</label>
                <textarea rows={4} placeholder="Write feedback for the student..."
                  value={gradeInput.feedback}
                  onChange={e => setGradeInput(p => ({ ...p, feedback: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border resize-none"
                  style={{ background: C.surfaceContainerLow, borderColor: C.outlineVariant, color: C.onSurface }} />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setGradingAssign(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: C.surfaceContainerHigh, color: C.onSurface }}>Cancel</button>
              <button
                onClick={() => {
                  if (gradeInput.grade === "") { showToast("Please enter a score."); return; }
                  setAssignments(prev => prev.map(x => x.id === gradingAssign.id
                    ? { ...x, status: "graded", grade: Number(gradeInput.grade), feedback: gradeInput.feedback }
                    : x
                  ));
                  setGradingAssign(null);
                  showToast(`Graded "${gradingAssign.title}" — ${gradeInput.grade}/${gradingAssign.totalMarks} ✅`);
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "#006b5f", color: "#fff" }}>Submit Grade</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[70] px-5 py-3 rounded-xl text-sm font-semibold shadow-lg"
          style={{ background: C.primary, color: C.onPrimary }}>
          {toast}
        </div>
      )}
    </DashboardLayout>
  );
}
