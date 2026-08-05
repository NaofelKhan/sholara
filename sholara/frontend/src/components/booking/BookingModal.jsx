import { useState } from "react";
import MI from "../MI";
import C from "../../constants/colors";
import { createBooking } from "../../api/booking";

export default function BookingModal({ skill, onClose, onSuccess }) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [sessionType, setSessionType] = useState(
    skill?.deliveryMethod?.toLowerCase().includes("person")
      ? "In-Person"
      : "Online"
  );
  const [meetingLink, setMeetingLink] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!skill) return null;

  const duration = skill.estimatedDuration || 60;

  const minDateTime = new Date(Date.now() + 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!scheduledAt) {
      setError("Please select a date and time.");
      return;
    }

    setLoading(true);
    try {
      const res = await createBooking({
        skillId: skill._id,
        scheduledAt: new Date(scheduledAt).toISOString(),
        duration,
        sessionType,
        meetingLink: sessionType === "Online" ? meetingLink : "",
        location: sessionType === "In-Person" ? location : "",
        notes,
      });

      onSuccess?.(res.booking);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to book session. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: C.surface, maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{ background: C.primary, color: C.onPrimary }}
        >
          <div>
            <h2 className="text-xl font-bold">Book a Session</h2>
            <p className="text-sm opacity-80 mt-0.5 truncate max-w-xs">
              {skill.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-white/20 transition"
          >
            <MI name="close" size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          <div className="flex items-center gap-3">
            <img
              src={
                skill.mentor?.profilePicture ||
                "https://via.placeholder.com/48"
              }
              alt={skill.mentor?.fullName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p
                className="font-semibold text-sm"
                style={{ color: C.onSurface }}
              >
                {skill.mentor?.fullName || "Mentor"}
              </p>
              <p className="text-xs" style={{ color: C.onSurfaceVariant }}>
                {duration} min · {skill.category}
              </p>
            </div>
          </div>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: C.onSurfaceVariant }}
            >
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              min={minDateTime}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition border"
              style={{
                background: C.surfaceContainerLowest,
                borderColor: C.outlineVariant,
                color: C.onSurface,
              }}
            />
          </div>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: C.onSurfaceVariant }}
            >
              Session Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {["Online", "In-Person"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSessionType(type)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all border"
                  style={{
                    background:
                      sessionType === type
                        ? C.primary
                        : C.surfaceContainerLowest,
                    color:
                      sessionType === type ? C.onPrimary : C.onSurface,
                    borderColor:
                      sessionType === type ? C.primary : C.outlineVariant,
                  }}
                >
                  <MI
                    name={type === "Online" ? "videocam" : "location_on"}
                    size={18}
                  />
                  {type}
                </button>
              ))}
            </div>
          </div>

          {sessionType === "Online" && (
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: C.onSurfaceVariant }}
              >
                Meeting Link (optional)
              </label>
              <input
                type="url"
                placeholder="https://meet.google.com/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                style={{
                  background: C.surfaceContainerLowest,
                  borderColor: C.outlineVariant,
                  color: C.onSurface,
                }}
              />
              <p className="text-[11px] mt-1" style={{ color: C.outline }}>
                You or the mentor can add this later.
              </p>
            </div>
          )}

          {sessionType === "In-Person" && (
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: C.onSurfaceVariant }}
              >
                Location
              </label>
              <input
                type="text"
                placeholder="Campus library, Room 204..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                style={{
                  background: C.surfaceContainerLowest,
                  borderColor: C.outlineVariant,
                  color: C.onSurface,
                }}
              />
            </div>
          )}

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: C.onSurfaceVariant }}
            >
              Notes for mentor (optional)
            </label>
            <textarea
              rows={3}
              placeholder="What would you like to focus on?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border resize-none"
              style={{
                background: C.surfaceContainerLowest,
                borderColor: C.outlineVariant,
                color: C.onSurface,
              }}
            />
          </div>

          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: "#fce8e8", color: C.error }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
            style={{ background: C.primary, color: C.onPrimary }}
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}