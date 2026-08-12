import MI from "../MI";
import C from "../../constants/colors";

const STATUS_STYLES = {
  pending: { bg: "#fff3cd", color: "#856404", label: "Pending" },
  confirmed: { bg: "#d4edda", color: "#155724", label: "Confirmed" },
  rescheduled: { bg: "#cce5ff", color: "#004085", label: "Rescheduled" },
  cancelled: { bg: "#f8d7da", color: "#721c24", label: "Cancelled" },
  completed: { bg: "#e2e3e5", color: "#383d41", label: "Completed" },
};

export default function SessionCard({
  booking,
  currentUserId,
  onReschedule,
  onCancel,
  onConfirm,
  onComplete,
}) {
  const isMentor = booking.mentor?._id === currentUserId;
  const other = isMentor ? booking.student : booking.mentor;
  const status = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;

  const date = new Date(booking.scheduledAt);
  const isPast = date < new Date();
  const canAct = !["cancelled", "completed"].includes(booking.status);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all hover:shadow-md"
      style={{
        background: C.surfaceContainerLowest,
        border: `1px solid ${C.outlineVariant}`,
      }}
    >
      <div className="flex flex-col sm:flex-row">
        <div
          className="sm:w-2 w-full h-1 sm:h-auto flex-shrink-0"
          style={{
            background:
              booking.status === "confirmed"
                ? C.secondary
                : booking.status === "cancelled"
                ? C.error
                : C.primaryFixedDim,
          }}
        />

        <div className="flex-1 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <h3
                className="font-semibold text-base"
                style={{ color: C.onSurface }}
              >
                {booking.skill?.title || "Skill Session"}
              </h3>
              <p
                className="text-xs mt-0.5"
                style={{ color: C.onSurfaceVariant }}
              >
                {isMentor ? "Student" : "Mentor"}: {other?.fullName || "—"}
              </p>
            </div>

            <span
              className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide"
              style={{ background: status.bg, color: status.color }}
            >
              {status.label}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm mb-4">
            <div
              className="flex items-center gap-1.5"
              style={{ color: C.onSurface }}
            >
              <MI name="calendar_today" size={16} />
              <span>
                {date.toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div
              className="flex items-center gap-1.5"
              style={{ color: C.onSurface }}
            >
              <MI name="schedule" size={16} />
              <span>
                {date.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                · {booking.duration} min
              </span>
            </div>
            <div
              className="flex items-center gap-1.5"
              style={{ color: C.onSurface }}
            >
              <MI
                name={
                  booking.sessionType === "Online" ? "videocam" : "location_on"
                }
                size={16}
              />
              <span>{booking.sessionType}</span>
            </div>
          </div>

          {booking.sessionType === "Online" && booking.meetingLink && (
            <a
              href={booking.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium mb-3 underline"
              style={{ color: C.primary }}
            >
              <MI name="link" size={14} />
              Join meeting
            </a>
          )}

          {booking.sessionType === "In-Person" && booking.location && (
            <p className="text-xs mb-3" style={{ color: C.onSurfaceVariant }}>
              <MI name="place" size={14} /> {booking.location}
            </p>
          )}

          {booking.notes && (
            <p
              className="text-xs mb-3 px-3 py-2 rounded-lg"
              style={{
                background: C.surfaceContainerLow,
                color: C.onSurfaceVariant,
              }}
            >
              Note: {booking.notes}
            </p>
          )}

          {canAct && (
            <div className="flex flex-wrap gap-2 mt-2">
              {isMentor && booking.status === "pending" && (
                <button
                  onClick={() => onConfirm(booking)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition"
                  style={{ background: C.secondary, color: C.onSecondary }}
                >
                  Confirm
                </button>
              )}

              {isMentor &&
                ["confirmed", "rescheduled"].includes(booking.status) &&
                isPast && (
                  <button
                    onClick={() => onComplete(booking)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition"
                    style={{
                      background: C.primaryFixed,
                      color: C.primaryContainer,
                    }}
                  >
                    Mark Complete
                  </button>
                )}

              <button
                onClick={() => onReschedule(booking)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition border"
                style={{
                  borderColor: C.outlineVariant,
                  color: C.primary,
                }}
              >
                Reschedule
              </button>

              <button
                onClick={() => onCancel(booking)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition"
                style={{ background: "#fce8e8", color: C.error }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}