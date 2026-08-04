import React, { useRef } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CATEGORIES = ["Design", "Development", "Marketing", "Business", "Music", "Photography", "Writing", "Other"];
const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const DELIVERY_METHODS = ["Online (Video Call)", "In-Person", "Hybrid"];
const FREQUENCIES = ["Per Hour", "Per Session", "Per Month"];
const ROLES = ["Junior", "Senior", "Expert"];

export default function SkillForm({ formData, onChange, onDayToggle, onImageChange }) {
  const fileInputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onImageChange(file);
  };

  return (
    <>
      {/* SKILL BASICS */}
      <div className="card">
        <div className="card-header">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="card-header-title">Skill Basics</span>
        </div>

        {/* Cover Image */}
        <div className="form-group">
          <label className="form-label">Skill Cover Image</label>
          <div
            className="upload-area"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => onImageChange(e.target.files[0])}
            />
            {formData.coverImagePreview ? (
              <img src={formData.coverImagePreview} alt="Cover preview" className="upload-preview" />
            ) : (
              <>
                <div className="upload-icon">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div className="upload-text">Drag &amp; drop or click to upload</div>
                <div className="upload-hint">Recommended: 1200×630px (PNG, JPG)</div>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="form-group">
          <label className="form-label">Title of the Skill</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Advanced UX Design Systems"
            value={formData.title}
            onChange={(e) => onChange("title", e.target.value)}
          />
        </div>

        {/* Mentor Role */}
        <div className="form-group">
          <label className="form-label">Mentor Role</label>
          <select
            className="form-control"
            value={formData.mentorRole}
            onChange={(e) => onChange("mentorRole", e.target.value)}
          >
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>

        {/* Category + Difficulty */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-control"
              value={formData.category}
              onChange={(e) => onChange("category", e.target.value)}
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Difficulty Level</label>
            <div className="difficulty-group">
              {DIFFICULTY_LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  className={`difficulty-pill${formData.difficultyLevel === lvl ? " active" : ""}`}
                  onClick={() => onChange("difficultyLevel", lvl)}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Detailed Description</label>
          <textarea
            className="form-control"
            placeholder="Describe what learners will gain, tools covered, prerequisites…"
            value={formData.description}
            onChange={(e) => onChange("description", e.target.value)}
            rows={5}
          />
        </div>
      </div>

      {/* PRICING & MODEL */}
      <div className="card">
        <div className="card-header">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="13" /><path d="M12 16h.01" />
          </svg>
          <span className="card-header-title">Pricing &amp; Model</span>
        </div>

        <div className="pricing-options">
          <label className="radio-label">
            <input
              type="radio"
              name="pricingModel"
              value="Free (Reciprocal)"
              checked={formData.pricingModel === "Free (Reciprocal)"}
              onChange={(e) => onChange("pricingModel", e.target.value)}
            />
            Free (Reciprocal)
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="pricingModel"
              value="Paid Service"
              checked={formData.pricingModel === "Paid Service"}
              onChange={(e) => onChange("pricingModel", e.target.value)}
            />
            Paid Service
          </label>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Price (₺)</label>
            <div className="price-input-wrap">
              <span className="currency">₺</span>
              <input
                type="number"
                className="form-control"
                placeholder="500"
                value={formData.price}
                disabled={formData.pricingModel === "Free (Reciprocal)"}
                onChange={(e) => onChange("price", e.target.value)}
                min="0"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Frequency</label>
            <select
              className="form-control"
              value={formData.frequency}
              disabled={formData.pricingModel === "Free (Reciprocal)"}
              onChange={(e) => onChange("frequency", e.target.value)}
            >
              {FREQUENCIES.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* SESSION DETAILS */}
      <div className="card">
        <div className="card-header">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="card-header-title">Session Details</span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Estimated Duration</label>
            <div className="duration-wrap">
              <span className="dur-icon">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </span>
              <input
                type="number"
                className="form-control"
                placeholder="60"
                value={formData.estimatedDuration}
                onChange={(e) => onChange("estimatedDuration", e.target.value)}
                min="15"
                step="15"
              />
            </div>
            <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, display: "block" }}>mins</span>
          </div>
          <div className="form-group">
            <label className="form-label">Delivery Method</label>
            <select
              className="form-control"
              value={formData.deliveryMethod}
              onChange={(e) => onChange("deliveryMethod", e.target.value)}
            >
              {DELIVERY_METHODS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* AVAILABILITY */}
      <div className="card">
        <div className="card-header">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="card-header-title">Availability</span>
        </div>

        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>
          Select days you are generally available for bookings.
        </p>

        <div className="days-grid">
          {DAYS.map((day) => (
            <button
              key={day}
              type="button"
              className={`day-chip${formData.availabilityDays.includes(day) ? " selected" : ""}`}
              onClick={() => onDayToggle(day)}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="form-group">
          <textarea
            className="form-control"
            placeholder="e.g. Mostly weekends 4pm–9pm or weeknights after 7pm…"
            value={formData.availabilityNotes}
            onChange={(e) => onChange("availabilityNotes", e.target.value)}
            rows={3}
          />
        </div>
      </div>
    </>
  );
}
