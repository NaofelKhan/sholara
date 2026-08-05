import { useState } from "react";

import {
  createSkillRequest,
  saveSkillRequestDraft,
} from "../api/skillRequest";

import "../styles/SkillRequestForm.css";


const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const CATEGORIES = [
  'Programming',
  'Design',
  'Mathematics',
  'Science',
  'Language',
  'Music',
  'Business',
  'Other',
];
const FREQUENCIES = [
  'Per Hour',
  'Per Session',
  'Per Week',
  'Per Month',
  'Fixed',
];

const initialState = {
  skillTitle: '',
  learningObjectives: '',
  skillCategory: '',
  difficultyLevel: 'Beginner',
  availability: [],
  scheduleNotes: '',
  estimatedBudget: '',
  frequency: 'Per Hour',
  estimatedDuration: '',
};

const SkillRequestForm = ({showToast}) => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState(null);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter((d) => d !== day)
        : [...prev.availability, day],
    }));
  };

  const setDifficulty = (level) => {
    setForm((prev) => ({ ...prev, difficultyLevel: level }));
  };

const submit = async (status) => {

  if (status === "posted") {

    const requiredFields = [
      {
        key: "skillTitle",
        message: "Please enter a skill title."
      },
      {
        key: "learningObjectives",
        message: "Please enter learning objectives."
      },
      {
        key: "skillCategory",
        message: "Please select a skill category."
      },
      {
        key: "difficultyLevel",
        message: "Please select difficulty level."
      },
      {
        key: "estimatedDuration",
        message: "Please enter estimated learning duration."
      }
    ];


    for (const field of requiredFields) {

      if (
        !form[field.key] ||
        !String(form[field.key]).trim()
      ) {

        showToast(field.message, "error");
        return;

      }

    }


    if (form.availability.length === 0) {

      showToast(
        "Please select at least one available day.",
        "error"
      );

      return;
    }

  }


  setLoading(true);
  setActionType(status);


  try {

    const payload = {
      ...form,
      estimatedBudget: form.estimatedBudget
        ? Number(form.estimatedBudget)
        : undefined,
      status,
    };


    if (status === "draft") {

      await saveSkillRequestDraft(payload);

    } else {

      await createSkillRequest(payload);

    }


    showToast(
      status === "draft"
        ? "Your skill request has been saved as a draft!"
        : "Your skill request has been posted successfully!",
      "success"
    );


    if (status === "posted") {
      setForm(initialState);
    }


  } catch(error) {

    const errors = error.response?.data?.errors;


    showToast(
      errors
        ? errors.join(", ")
        : error.response?.data?.message ||
          "Something went wrong. Please try again.",
      "error"
    );


  } finally {

    setLoading(false);

  }
};

  return (
    <div className="skill-request-form">


      {/* ───── Skill Title ───── */}
      <section className="form-card">
        <label className="field-label" htmlFor="skillTitle">
          Skill Title
        </label>
        <input
          id="skillTitle"
          name="skillTitle"
          type="text"
          className="form-input"
          placeholder="e.g., Master React Fundamentals"
          value={form.skillTitle}
          onChange={handleChange}
        />
      </section>

      {/* ───── Learning Objectives ───── */}
      <section className="form-card">
        <div className="section-header">
          <span className="section-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="2" x2="12" y2="9" />
              <line x1="12" y1="15" x2="12" y2="22" />
              <line x1="2" y1="12" x2="9" y2="12" />
              <line x1="15" y1="12" x2="22" y2="12" />
            </svg>
          </span>
          <h2 className="section-title">LEARNING OBJECTIVES</h2>
        </div>

        <p className="field-sublabel">What do you want to achieve?</p>
        <textarea
          name="learningObjectives"
          className="form-textarea"
          placeholder="e.g., I want to learn how to set up a basic React project and understand state management..."
          value={form.learningObjectives}
          onChange={handleChange}
          rows={5}
        />

        <div className="two-col">
          {/* Skill Category */}
          <div className="field-group">
            <label className="field-label" htmlFor="skillCategory">
              Skill Category
            </label>
            <div className="select-wrapper">
              <select
                id="skillCategory"
                name="skillCategory"
                className="form-select"
                value={form.skillCategory}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <span className="select-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
          </div>

          {/* Difficulty Level */}
          <div className="field-group">
            <label className="field-label">Difficulty Level</label>
            <div className="difficulty-group">
              {DIFFICULTY_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`difficulty-btn ${form.difficultyLevel === level ? 'active' : ''}`}
                  onClick={() => setDifficulty(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── Preferred Schedule ───── */}
      <section className="form-card">
        <div className="section-header">
          <span className="section-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
          <h2 className="section-title">PREFERRED SCHEDULE</h2>
        </div>

        <label className="field-label">Availability</label>
        <div className="days-group">
          {DAYS.map((day) => (
            <button
              key={day}
              type="button"
              className={`day-btn ${form.availability.includes(day) ? 'active' : ''}`}
              onClick={() => toggleDay(day)}
            >
              {day}
            </button>
          ))}
        </div>

        <textarea
          name="scheduleNotes"
          className="form-textarea"
          placeholder="e.g. Mostly weekends 4pm-9pm or weeknights after 7pm..."
          value={form.scheduleNotes}
          onChange={handleChange}
          rows={3}
          style={{ marginTop: '16px' }}
        />
      </section>

      {/* ───── Budget & Duration ───── */}
      <section className="form-card">
        <div className="section-header">
          <span className="section-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </span>
          <h2 className="section-title">BUDGET &amp; DURATION</h2>
        </div>

        <div className="two-col">
          {/* Estimated Budget */}
          <div className="field-group">
            <label className="field-label" htmlFor="estimatedBudget">
              Estimated Budget ($)
            </label>
            <div className="input-prefix-wrapper">
              <span className="input-prefix">৳</span>
              <input
                id="estimatedBudget"
                name="estimatedBudget"
                type="number"
                min="0"
                className="form-input with-prefix"
                placeholder="500"
                value={form.estimatedBudget}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Frequency */}
          <div className="field-group">
            <label className="field-label" htmlFor="frequency">
              Frequency
            </label>
            <div className="select-wrapper">
              <select
                id="frequency"
                name="frequency"
                className="form-select"
                value={form.frequency}
                onChange={handleChange}
              >
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <span className="select-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* Estimated Duration */}
        <div className="field-group" style={{ marginTop: '16px' }}>
          <label className="field-label" htmlFor="estimatedDuration">
            Estimated Learning Duration
          </label>
          <div className="input-prefix-wrapper">
            <span className="input-prefix">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            <input
              id="estimatedDuration"
              name="estimatedDuration"
              type="text"
              className="form-input with-prefix"
              placeholder="e.g. 4 Weeks"
              value={form.estimatedDuration}
              onChange={handleChange}
            />
          </div>
        </div>
      </section>

      {/* ───── Action Buttons ───── */}
      <div className="form-actions">
        <button
          type="button"
          className="btn-draft"
          onClick={() => submit('draft')}
          disabled={loading}
        >
          {loading && actionType === "draft"
  ? "Saving..."
  : "Save as Draft"}
        </button>
        <button
          type="button"
          className="btn-post"
          onClick={() => submit('posted')}
          disabled={loading}
        >
          {loading && actionType === "posted"
  ? "Posting..."
  : "Post Request"}
        </button>
      </div>
    </div>
  );
};

export default SkillRequestForm;