import { useState } from "react";
import MI from "../MI";
import C from "../../constants/colors";
import { rescheduleBooking } from "../../api/booking";

export default function RescheduleModal({ booking, onClose, onSuccess }) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!booking) return null;

  const minDateTime = new Date(Date.now() + 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!scheduledAt) {
      setError("Please select a new date and time.");
      return;
    }

    setLoading(true);
    try {
      const res = await rescheduleBooking(booking._id, {
        scheduledAt: new Date(scheduledAt).toISOString(),
        reason,
      });
      onSuccess?.(res.booking);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reschedule. Please try again."
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
        className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: C.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{ background: C.primary, color: C.onPrimary }}
        >
          <h2 className="text-lg font-bold">Reschedule Session</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-white/20 transition"
          >
            <MI name="close" size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
            Current:{" "}
            <strong style={{ color: C.onSurface }}>
              {new Date(booking.scheduledAt).toLocaleString()}
            </strong>
          </p>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: C.onSurfaceVariant }}
            >
              New Date & Time
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              min={minDateTime}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
              style={{
                background: C.surfaceContainerLowest,
                borderColor: C.outlineVariant,
                color: C.onSurface,
              }}
            />
          </div>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: C.onSurfaceVariant }}
            >
              Reason (optional)
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you rescheduling?"
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
              className="px-4 py-3 rounded-xl text-sm"
              style={{ background: "#fce8e8", color: C.error }}
            >
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
              style={{
                borderColor: C.outlineVariant,
                color: C.onSurface,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
              style={{ background: C.primary, color: C.onPrimary }}
            >
              {loading ? "Saving..." : "Reschedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}