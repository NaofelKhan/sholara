import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import NoticeCard from "../components/notice/NoticeCard";
import NoticeDetailModal from "../components/notice/NoticeDetailModal";
import CreateNoticeModal from "../components/notice/CreateNoticeModal";
import { getNotices, deleteNotice } from "../api/notice";
import C from "../constants/colors";
import MI from "../components/MI";

const CATEGORIES = [
  "All",
  "Announcement",
  "Event",
  "Competition",
  "Opportunity",
];

export default function NoticeBoard() {
  const { user } = useAuth();

  const profile = {
    fullName: user?.fullName,
    firstName: user?.fullName?.split(" ")[0],
    profilePicture: user?.profilePicture,
    department: user?.department,
    role: user?.role,
  };

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (category !== "All") params.category = category;
      if (search.trim()) params.search = search.trim();
      const data = await getNotices(params);
      setNotices(data.notices || []);
    } catch {
      setError("Failed to load notices.");
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    const t = setTimeout(fetchNotices, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchNotices, search]);

  const handleDelete = async (notice) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await deleteNotice(notice._id);
      setSelected(null);
      showToast("Notice deleted.");
      fetchNotices();
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed.", "error");
    }
  };

  return (
    <DashboardLayout profile={profile}>
      <main className="p-10" style={{ background: C.background }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
            <div>
              <h1
                className="text-3xl font-bold mb-1"
                style={{ color: C.onSurface }}
              >
                University Notice Board
              </h1>
              <p style={{ color: C.onSurfaceVariant }}>
                Announcements, events, competitions, and opportunities.
              </p>
            </div>

            {user && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: C.primary, color: C.onPrimary }}
              >
                <MI name="add" size={20} />
                Post Notice
              </button>
            )}
          </div>

          <div className="relative mb-5">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: C.outline }}
            >
              <MI name="search" size={20} />
            </span>
            <input
              type="text"
              placeholder="Search notices, tags, keywords..."
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

          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition"
                style={{
                  background:
                    category === cat ? C.primary : C.surfaceContainerLowest,
                  color:
                    category === cat ? C.onPrimary : C.onSurfaceVariant,
                  border: `1px solid ${
                    category === cat ? C.primary : C.outlineVariant
                  }`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-64 rounded-2xl animate-pulse"
                  style={{ background: C.surfaceContainerHigh }}
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16" style={{ color: C.error }}>
              {error}
            </div>
          ) : notices.length === 0 ? (
            <div
              className="text-center py-20 rounded-2xl"
              style={{
                background: C.surfaceContainerLowest,
                border: `1px dashed ${C.outlineVariant}`,
              }}
            >
              <MI name="campaign" size={48} />
              <p
                className="mt-4 font-medium"
                style={{ color: C.onSurfaceVariant }}
              >
                No notices yet
              </p>
              <p className="text-sm mt-1" style={{ color: C.outline }}>
                Be the first to post an announcement or opportunity.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {notices.map((notice) => (
                <NoticeCard
                  key={notice._id}
                  notice={notice}
                  onClick={setSelected}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {selected && (
        <NoticeDetailModal
          notice={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
          currentUserId={user?._id}
        />
      )}

      {showCreate && (
        <CreateNoticeModal
          user={user}
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            showToast("Notice published!");
            fetchNotices();
          }}
        />
      )}

      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[70] px-5 py-3 rounded-xl text-sm font-semibold shadow-lg"
          style={{
            background: toast.type === "error" ? C.error : C.primary,
            color: C.onPrimary,
          }}
        >
          {toast.message}
        </div>
      )}
    </DashboardLayout>
  );
}