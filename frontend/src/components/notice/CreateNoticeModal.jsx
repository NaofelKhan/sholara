import { useState } from "react";
import MI from "../MI";
import C from "../../constants/colors";
import { createNotice } from "../../api/notice";

const CATEGORIES = ["Announcement", "Event", "Competition", "Opportunity"];
const PRIORITIES = [
  { value: "normal", label: "Normal" },
  { value: "important", label: "Important" },
  { value: "urgent", label: "Urgent" },
];

const inputStyle = {
  width: "100%",
  padding: "10px 16px",
  borderRadius: "12px",
  fontSize: "14px",
  outline: "none",
  border: "1px solid #c4c6cf",
  background: "#ffffff",
  color: "#131b2e",
};

export default function CreateNoticeModal({ onClose, onSuccess, user }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Announcement",
    department: user?.department || "All Departments",
    university: user?.university || "",
    eventDate: "",
    deadline: "",
    location: "",
    registrationLink: "",
    priority: "normal",
    tags: "",
  });
  const [coverImage, setCoverImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleImage = (file) => {
    if (!file) return;
    setCoverImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }
    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === "tags") {
          const tagList = val
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
          payload.append("tags", JSON.stringify(tagList));
        } else if (val) {
          payload.append(key, val);
        }
      });
      if (coverImage) payload.append("coverImage", coverImage);

      const res = await createNotice(payload);
      onSuccess?.(res.notice);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to publish notice.");
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
        className="w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: C.surface, maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{ background: C.primary, color: C.onPrimary }}
        >
          <h2 className="text-lg font-bold">Post a Notice</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/20">
            <MI name="close" size={22} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto space-y-4"
          style={{ maxHeight: "calc(92vh - 72px)" }}
        >
          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: C.onSurfaceVariant }}>
              Cover Image (optional)
            </label>
            <div
              className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer"
              style={{ borderColor: C.outlineVariant }}
              onClick={() => document.getElementById("notice-cover").click()}
            >
              <input
                id="notice-cover"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImage(e.target.files[0])}
              />
              {preview ? (
                <img src={preview} alt="" className="h-32 mx-auto object-cover rounded-lg" />
              ) : (
                <p className="text-sm" style={{ color: C.outline }}>Click to upload</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: C.onSurfaceVariant }}>Title *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} required style={inputStyle} />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: C.onSurfaceVariant }}>Description *</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} required rows={4} style={{ ...inputStyle, resize: "none" }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: C.onSurfaceVariant }}>Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} style={inputStyle}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: C.onSurfaceVariant }}>Priority</label>
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)} style={inputStyle}>
                {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: C.onSurfaceVariant }}>Event Date</label>
              <input type="datetime-local" value={form.eventDate} onChange={(e) => set("eventDate", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: C.onSurfaceVariant }}>Deadline</label>
              <input type="datetime-local" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: C.onSurfaceVariant }}>Location</label>
            <input value={form.location} onChange={(e) => set("location", e.target.value)} style={inputStyle} placeholder="Campus / Online" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: C.onSurfaceVariant }}>Registration Link</label>
            <input type="url" value={form.registrationLink} onChange={(e) => set("registrationLink", e.target.value)} style={inputStyle} placeholder="https://..." />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "#fce8e8", color: C.error }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-60"
            style={{ background: C.primary, color: C.onPrimary }}
          >
            {loading ? "Publishing..." : "Publish Notice"}
          </button>
        </form>
      </div>
    </div>
  );
}