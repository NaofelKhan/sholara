import { useState } from "react";
import { createReview } from "../../api/review";
import C from "../../constants/colors";
import MI from "../MI";

const AVAILABLE_TAGS = [
  "Clear Explanations",
  "Punctual & Prepared",
  "Patient & Supportive",
  "Subject Matter Expert",
  "Practical Exercises",
  "Inspiring Mentor",
  "Active Listener",
  "Friendly & Collaborative",
];

const RATING_LABELS = {
  1: "Needs Improvement",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Outstanding & Exceptional",
};

export default function ReviewModal({ booking, currentUserId, onClose, onSuccess }) {
  const isMentor = booking.mentor?._id === currentUserId;
  const partner = isMentor ? booking.student : booking.mentor;

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError("Please provide a few words of feedback.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createReview({
        bookingId: booking._id,
        rating,
        feedback: feedback.trim(),
        tags: selectedTags,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        style={{ background: C.surfaceContainerLowest }}
      >
        {/* Header */}
        <div
          className="p-6 border-b flex items-center justify-between"
          style={{ borderColor: C.outlineVariant, background: C.surfaceContainerLow }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#ffb703] bg-[#fff8e7]"
            >
              <MI name="hotel_class" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: C.onSurface }}>
                Rate & Review Partner
              </h2>
              <p className="text-xs" style={{ color: C.onSurfaceVariant }}>
                Session: {booking.skill?.title || "Skill Exchange"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-500 hover:bg-[#eaedff] transition"
          >
            <MI name="close" size={20} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div
              className="p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2"
              style={{ background: "#fde8e8", color: C.error }}
            >
              <MI name="error" size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Partner Info Card */}
          <div
            className="p-4 rounded-2xl flex items-center gap-3"
            style={{ background: C.surfaceContainerLow }}
          >
            <img
              src={
                partner?.profilePicture ||
                "https://media.istockphoto.com/id/1288129985/tr/vekt%C3%B6r/bir-ki%C5%9Finin-yer-tutucunun-eksik-g%C3%B6r%C3%BCnt%C3%BCs%C3%BC.jpg"
              }
              alt={partner?.fullName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-200"
            />
            <div>
              <p className="font-bold text-sm" style={{ color: C.onSurface }}>
                {partner?.fullName || "Skill Partner"}
              </p>
              <p className="text-xs" style={{ color: C.onSurfaceVariant }}>
                {isMentor ? "Learner / Student" : "Skill Mentor"} • {partner?.department || "Scholara Member"}
              </p>
            </div>
          </div>

          {/* Star Rating */}
          <div className="text-center space-y-2">
            <label className="block text-sm font-bold" style={{ color: C.onSurface }}>
              How was your experience?
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1.5 transition-transform hover:scale-110 focus:outline-none"
                >
                  <span
                    className="material-symbols-outlined text-4xl"
                    style={{
                      color:
                        (hoverRating || rating) >= star
                          ? "#eab308"
                          : "#d1d5db",
                      fontVariationSettings:
                        (hoverRating || rating) >= star
                          ? "'FILL' 1"
                          : "'FILL' 0",
                    }}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
            <p className="text-sm font-semibold text-amber-600">
              {RATING_LABELS[hoverRating || rating]}
            </p>
          </div>

          {/* Praise & Highlights Tags */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
              Key Highlights (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#002045] text-white shadow-sm"
                        : "bg-[#f1f5f9] text-[#43474e] hover:bg-[#e2e8f0]"
                    }`}
                  >
                    {isSelected && <MI name="check" size={14} />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback Comments */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
              Your Review & Comments
            </label>
            <textarea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share details about what went well and how this exchange helped your learning journey..."
              className="w-full p-4 rounded-2xl text-sm border focus:ring-2 focus:ring-[#002045] outline-none resize-none transition"
              style={{
                borderColor: C.outlineVariant,
                background: C.surfaceContainerLowest,
              }}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#002045] text-white hover:bg-[#1a365d] transition shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <MI name="sync" size={18} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <MI name="send" size={18} />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
