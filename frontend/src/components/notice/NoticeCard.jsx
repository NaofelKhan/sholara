import MI from "../MI";
import C from "../../constants/colors";

const CATEGORY_STYLES = {
  Announcement: { bg: "#d6e3ff", color: "#002045", icon: "campaign" },
  Event: { bg: "#d1f5ee", color: "#006b5f", icon: "event" },
  Competition: { bg: "#ffddb8", color: "#311c00", icon: "emoji_events" },
  Opportunity: { bg: "#e8def8", color: "#4a4458", icon: "work" },
};

const PRIORITY_STYLES = {
  urgent: { bg: "#fce8e8", color: "#ba1a1a", label: "Urgent" },
  important: { bg: "#fff3cd", color: "#856404", label: "Important" },
  normal: null,
};

export default function NoticeCard({ notice, onClick }) {
  const cat = CATEGORY_STYLES[notice.category] || CATEGORY_STYLES.Announcement;
  const priority = PRIORITY_STYLES[notice.priority];

  const formatDate = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      onClick={() => onClick?.(notice)}
      className="rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md group"
      style={{
        background: C.surfaceContainerLowest,
        border: `1px solid ${C.outlineVariant}`,
      }}
    >
      {notice.coverImage ? (
        <div className="h-36 overflow-hidden relative">
          <img
            src={notice.coverImage}
            alt={notice.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
            style={{ background: cat.bg, color: cat.color }}
          >
            <MI name={cat.icon} size={14} />
            {notice.category}
          </div>
          {priority && (
            <div
              className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
              style={{ background: priority.bg, color: priority.color }}
            >
              {priority.label}
            </div>
          )}
        </div>
      ) : (
        <div
          className="h-16 flex items-center justify-between px-5"
          style={{ background: cat.bg }}
        >
          <div
            className="flex items-center gap-2 text-sm font-bold"
            style={{ color: cat.color }}
          >
            <MI name={cat.icon} size={20} />
            {notice.category}
          </div>
          {priority && (
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
              style={{ background: priority.bg, color: priority.color }}
            >
              {priority.label}
            </span>
          )}
        </div>
      )}

      <div className="p-5">
        <h3
          className="font-semibold text-base leading-snug mb-2 line-clamp-2"
          style={{ color: C.onSurface }}
        >
          {notice.title}
        </h3>
        <p
          className="text-sm line-clamp-2 mb-4"
          style={{ color: C.onSurfaceVariant }}
        >
          {notice.description}
        </p>
        <div
          className="flex flex-wrap gap-3 text-xs mb-3"
          style={{ color: C.onSurfaceVariant }}
        >
          {notice.eventDate && (
            <span className="flex items-center gap-1">
              <MI name="event" size={14} />
              {formatDate(notice.eventDate)}
            </span>
          )}
          {notice.deadline && (
            <span className="flex items-center gap-1">
              <MI name="timer" size={14} />
              Deadline: {formatDate(notice.deadline)}
            </span>
          )}
          {notice.location && (
            <span className="flex items-center gap-1">
              <MI name="place" size={14} />
              {notice.location}
            </span>
          )}
        </div>
        <div
          className="flex items-center justify-between pt-3 border-t"
          style={{ borderColor: C.outlineVariant }}
        >
          <div className="flex items-center gap-2">
            <img
              src={
                notice.author?.profilePicture ||
                "https://via.placeholder.com/28"
              }
              alt=""
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-xs font-medium" style={{ color: C.onSurface }}>
              {notice.author?.fullName || "Unknown"}
            </span>
          </div>
          <span className="text-[11px]" style={{ color: C.outline }}>
            {formatDate(notice.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}