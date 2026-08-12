import MI from "../MI";
import C from "../../constants/colors";

const CATEGORY_STYLES = {
  Announcement: { bg: "#d6e3ff", color: "#002045", icon: "campaign" },
  Event: { bg: "#d1f5ee", color: "#006b5f", icon: "event" },
  Competition: { bg: "#ffddb8", color: "#311c00", icon: "emoji_events" },
  Opportunity: { bg: "#e8def8", color: "#4a4458", icon: "work" },
};

export default function NoticeDetailModal({
  notice,
  onClose,
  onDelete,
  currentUserId,
}) {
  if (!notice) return null;

  const cat = CATEGORY_STYLES[notice.category] || CATEGORY_STYLES.Announcement;
  const isAuthor = notice.author?._id === currentUserId;

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        style={{ background: C.surface, maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {notice.coverImage && (
          <div className="h-48 flex-shrink-0">
            <img
              src={notice.coverImage}
              alt={notice.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase flex items-center gap-1"
                style={{ background: cat.bg, color: cat.color }}
              >
                <MI name={cat.icon} size={14} />
                {notice.category}
              </span>
            </div>
            <button onClick={onClose} className="rounded-full p-1.5">
              <MI name="close" />
            </button>
          </div>

          <h2 className="text-2xl font-bold mb-3" style={{ color: C.onSurface }}>
            {notice.title}
          </h2>

          <div className="flex items-center gap-3 mb-6">
            <img
              src={
                notice.author?.profilePicture ||
                "https://via.placeholder.com/40"
              }
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold" style={{ color: C.onSurface }}>
                {notice.author?.fullName}
              </p>
              <p className="text-xs" style={{ color: C.onSurfaceVariant }}>
                {notice.author?.department || notice.department} ·{" "}
                {formatDate(notice.createdAt)}
              </p>
            </div>
          </div>

          <p
            className="text-sm leading-relaxed mb-6 whitespace-pre-wrap"
            style={{ color: C.onSurfaceVariant }}
          >
            {notice.description}
          </p>

          {notice.registrationLink && (
            <a
              href={notice.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full py-3 rounded-xl font-semibold text-sm text-center mb-3"
              style={{ background: C.primary, color: C.onPrimary }}
            >
              Register / Learn More
            </a>
          )}

          {isAuthor && onDelete && (
            <button
              onClick={() => onDelete(notice)}
              className="w-full py-3 rounded-xl font-semibold text-sm"
              style={{ background: "#fce8e8", color: C.error }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}