import { useState, useEffect, useCallback } from "react";
import {
  getCoursePolls,
  createPoll,
  submitPollResponse,
  togglePollStatus,
  deletePoll,
} from "../../api/poll";
import C from "../../constants/colors";
import MI from "../MI";

export default function CoursePollsSection({ courseId, canManage, currentUserId }) {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pollForm, setPollForm] = useState({
    title: "",
    description: "",
    pollType: "single_choice",
    options: ["", ""],
    isAnonymous: false,
  });
  const [creating, setCreating] = useState(false);

  // Student voting states: map of pollId -> selected options / textAnswer
  const [selectedChoices, setSelectedChoices] = useState({});
  const [textAnswers, setTextAnswers] = useState({});
  const [submittingPollId, setSubmittingPollId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchPolls = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCoursePolls(courseId);
      setPolls(data || []);

      // Pre-fill student choices if already responded
      const initialChoices = {};
      const initialTexts = {};
      (data || []).forEach((p) => {
        if (p.myResponse) {
          if (p.myResponse.selectedOptions?.length > 0) {
            initialChoices[p._id] = p.myResponse.selectedOptions;
          }
          if (p.myResponse.textAnswer) {
            initialTexts[p._id] = p.myResponse.textAnswer;
          }
        }
      });
      setSelectedChoices(initialChoices);
      setTextAnswers(initialTexts);
    } catch (err) {
      console.error("Failed to load polls:", err);
      setError("Failed to load polls & surveys.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) fetchPolls();
  }, [courseId, fetchPolls]);

  // Option list helpers for create form
  const handleAddOption = () => {
    setPollForm((prev) => ({ ...prev, options: [...prev.options, ""] }));
  };

  const handleRemoveOption = (index) => {
    if (pollForm.options.length <= 2) return;
    setPollForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleOptionChange = (index, value) => {
    setPollForm((prev) => {
      const updated = [...prev.options];
      updated[index] = value;
      return { ...prev, options: updated };
    });
  };

  const handleCreatePollSubmit = async (e) => {
    e.preventDefault();
    if (!pollForm.title.trim()) return;

    if (pollForm.pollType !== "text_feedback") {
      const validOptions = pollForm.options.filter((o) => o.trim());
      if (validOptions.length < 2) {
        alert("Please provide at least 2 choice options.");
        return;
      }
    }

    try {
      setCreating(true);
      await createPoll(courseId, {
        ...pollForm,
        options: pollForm.options.filter((o) => o.trim()),
      });
      setShowCreateModal(false);
      setPollForm({
        title: "",
        description: "",
        pollType: "single_choice",
        options: ["", ""],
        isAnonymous: false,
      });
      showToast("Poll / Survey published successfully!");
      fetchPolls();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create poll.");
    } finally {
      setCreating(false);
    }
  };

  const handleChoiceSelect = (pollId, pollType, optionIndex) => {
    if (pollType === "single_choice") {
      setSelectedChoices((prev) => ({ ...prev, [pollId]: [optionIndex] }));
    } else {
      setSelectedChoices((prev) => {
        const current = prev[pollId] || [];
        const updated = current.includes(optionIndex)
          ? current.filter((i) => i !== optionIndex)
          : [...current, optionIndex];
        return { ...prev, [pollId]: updated };
      });
    }
  };

  const handleVoteSubmit = async (poll) => {
    try {
      setSubmittingPollId(poll._id);
      const payload = {};
      if (poll.pollType === "text_feedback") {
        payload.textAnswer = textAnswers[poll._id] || "";
      } else {
        payload.selectedOptions = selectedChoices[poll._id] || [];
      }

      await submitPollResponse(courseId, poll._id, payload);
      showToast("Your response was submitted!");
      fetchPolls();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit response.");
    } finally {
      setSubmittingPollId(null);
    }
  };

  const handleToggleStatus = async (pollId) => {
    try {
      await togglePollStatus(courseId, pollId);
      fetchPolls();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (pollId) => {
    if (!window.confirm("Are you sure you want to delete this poll?")) return;
    try {
      await deletePoll(courseId, pollId);
      setPolls((prev) => prev.filter((p) => p._id !== pollId));
      showToast("Poll deleted.");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div
        className="p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          background: C.surfaceContainerLowest,
          borderColor: C.outlineVariant,
        }}
      >
        <div>
          <h2 className="text-xl font-bold" style={{ color: C.onSurface }}>
            Course Polls & Surveys
          </h2>
          <p className="text-xs mt-0.5" style={{ color: C.onSurfaceVariant }}>
            Participate in interactive class polls, topic preferences, and course feedback surveys.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#002045] text-white hover:bg-[#1a365d] transition flex items-center gap-2 shadow-sm w-fit"
          >
            <MI name="add" size={18} />
            Create Poll / Survey
          </button>
        )}
      </div>

      {/* Polls Stream */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl animate-pulse"
              style={{ background: C.surfaceContainerHigh }}
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600 font-semibold">{error}</div>
      ) : polls.length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl p-8 border border-dashed"
          style={{
            background: C.surfaceContainerLowest,
            borderColor: C.outlineVariant,
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: C.surfaceContainer, color: C.outline }}
          >
            <MI name="poll" size={32} />
          </div>
          <h3 className="font-bold text-sm" style={{ color: C.onSurface }}>
            No Polls or Surveys Yet
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            {canManage
              ? "Publish a poll to gather student feedback, check attendance preferences, or test comprehension."
              : "When faculty members post course polls or surveys, they will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {polls.map((poll) => {
            const hasVoted = poll.hasResponded;
            const totalVotes = (poll.options || []).reduce(
              (acc, opt) => acc + (opt.votes?.length || 0),
              0
            );

            return (
              <div
                key={poll._id}
                className="p-6 rounded-3xl border bg-white shadow-sm transition space-y-5"
                style={{ borderColor: C.outlineVariant }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          poll.isActive
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-gray-100 text-gray-700 border border-gray-300"
                        }`}
                      >
                        {poll.isActive ? "Active Poll" : "Closed"}
                      </span>

                      <span className="text-xs text-gray-400">
                        {poll.pollType === "single_choice"
                          ? "Single Choice"
                          : poll.pollType === "multiple_choice"
                          ? "Multiple Choice"
                          : "Feedback Survey"}
                      </span>

                      {poll.isAnonymous && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                          <MI name="visibility_off" size={12} />
                          Anonymous
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold" style={{ color: C.onSurface }}>
                      {poll.title}
                    </h3>
                    {poll.description && (
                      <p className="text-xs text-gray-600 leading-relaxed">{poll.description}</p>
                    )}
                  </div>

                  {/* Actions for Faculty */}
                  {canManage && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(poll._id)}
                        className="px-3 py-1 rounded-xl text-xs font-semibold border hover:bg-gray-50 transition"
                        style={{ borderColor: C.outlineVariant }}
                      >
                        {poll.isActive ? "Close Poll" : "Re-open"}
                      </button>

                      <button
                        onClick={() => handleDelete(poll._id)}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 transition"
                        title="Delete Poll"
                      >
                        <MI name="delete" size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Poll Body */}
                {poll.pollType === "text_feedback" ? (
                  // Open Feedback Survey
                  <div className="space-y-4 pt-2">
                    {/* Student input if poll active */}
                    {poll.isActive && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase">
                          {hasVoted ? "Your Submitted Feedback" : "Your Feedback Response"}
                        </label>
                        <textarea
                          rows={3}
                          value={textAnswers[poll._id] || ""}
                          onChange={(e) =>
                            setTextAnswers((prev) => ({ ...prev, [poll._id]: e.target.value }))
                          }
                          placeholder="Type your response or thoughts here..."
                          className="w-full p-3 rounded-2xl text-xs border focus:ring-2 focus:ring-[#002045] outline-none"
                          style={{ borderColor: C.outlineVariant }}
                        />
                        <button
                          onClick={() => handleVoteSubmit(poll)}
                          disabled={
                            submittingPollId === poll._id || !textAnswers[poll._id]?.trim()
                          }
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#002045] text-white hover:bg-[#1a365d] transition shadow-sm disabled:opacity-40"
                        >
                          {hasVoted ? "Update Feedback" : "Submit Feedback"}
                        </button>
                      </div>
                    )}

                    {/* Faculty/Admin view of submitted text feedback */}
                    {canManage && poll.responses?.length > 0 && (
                      <div className="space-y-2 pt-3 border-t">
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Received Responses ({poll.responses.length})
                        </p>
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {poll.responses.map((resp, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-gray-50 border text-xs space-y-1"
                              style={{ borderColor: C.outlineVariant }}
                            >
                              <div className="flex items-center justify-between text-[11px] text-gray-500">
                                <span className="font-semibold text-gray-800">
                                  {poll.isAnonymous
                                    ? "Anonymous Student"
                                    : resp.student?.fullName || "Student"}
                                </span>
                                <span>{new Date(resp.submittedAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-gray-700 leading-relaxed">{resp.textAnswer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Choice Poll (Single or Multiple)
                  <div className="space-y-3 pt-1">
                    {poll.options.map((opt, idx) => {
                      const isSelected =
                        selectedChoices[poll._id]?.includes(idx) ||
                        poll.myResponse?.selectedOptions?.includes(idx);
                      const voteCount = opt.votes?.length || 0;
                      const percentage =
                        totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (poll.isActive) {
                              handleChoiceSelect(poll._id, poll.pollType, idx);
                            }
                          }}
                          className={`p-3.5 rounded-2xl border transition relative overflow-hidden ${
                            poll.isActive ? "cursor-pointer hover:border-[#002045]" : ""
                          } ${
                            isSelected
                              ? "border-[#002045] bg-[#f2f6ff] ring-1 ring-[#002045]"
                              : "bg-white"
                          }`}
                          style={{ borderColor: isSelected ? C.primary : C.outlineVariant }}
                        >
                          {/* Animated Progress Bar (visible if voted or for faculty or if closed) */}
                          {(hasVoted || canManage || !poll.isActive) && (
                            <div
                              className="absolute top-0 bottom-0 left-0 bg-[#d6e3ff]/60 transition-all duration-500 -z-0"
                              style={{ width: `${percentage}%` }}
                            />
                          )}

                          <div className="relative z-10 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {/* Radio/Checkbox indicator */}
                              <div
                                className={`w-5 h-5 rounded-${
                                  poll.pollType === "single_choice" ? "full" : "md"
                                } border flex items-center justify-center transition ${
                                  isSelected
                                    ? "bg-[#002045] border-[#002045] text-white"
                                    : "border-gray-300 bg-white"
                                }`}
                              >
                                {isSelected && (
                                  <MI
                                    name={
                                      poll.pollType === "single_choice"
                                        ? "circle"
                                        : "check"
                                    }
                                    size={poll.pollType === "single_choice" ? 8 : 14}
                                  />
                                )}
                              </div>

                              <span
                                className={`text-xs ${
                                  isSelected ? "font-bold text-[#002045]" : "text-gray-800"
                                }`}
                              >
                                {opt.text}
                              </span>
                            </div>

                            {/* Percentage & Vote Count */}
                            {(hasVoted || canManage || !poll.isActive) && (
                              <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                                <span>{percentage}%</span>
                                <span className="text-[10px] text-gray-400 font-normal">
                                  ({voteCount} vote{voteCount !== 1 ? "s" : ""})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Vote Submit Action Button */}
                    {poll.isActive && (
                      <div className="pt-2 flex items-center justify-between">
                        <button
                          onClick={() => handleVoteSubmit(poll)}
                          disabled={
                            submittingPollId === poll._id ||
                            !selectedChoices[poll._id] ||
                            selectedChoices[poll._id].length === 0
                          }
                          className="px-5 py-2 rounded-xl text-xs font-bold bg-[#002045] text-white hover:bg-[#1a365d] transition shadow-sm disabled:opacity-40"
                        >
                          {submittingPollId === poll._id
                            ? "Submitting..."
                            : hasVoted
                            ? "Update Vote"
                            : "Submit Vote"}
                        </button>

                        <span className="text-xs text-gray-400">
                          {totalVotes} total vote{totalVotes !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer details */}
                <div
                  className="pt-3 border-t flex items-center justify-between text-[11px] text-gray-400"
                  style={{ borderColor: C.outlineVariant }}
                >
                  <span>
                    Created by {poll.createdBy?.fullName || "Faculty"} •{" "}
                    {new Date(poll.createdAt).toLocaleDateString()}
                  </span>
                  {hasVoted && (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <MI name="check_circle" size={14} />
                      Response Recorded
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Poll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div
            className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            style={{ background: C.surfaceContainerLowest }}
          >
            <div
              className="p-6 border-b flex items-center justify-between"
              style={{ borderColor: C.outlineVariant, background: C.surfaceContainerLow }}
            >
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#002045] text-white flex items-center justify-center">
                  <MI name="poll" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base" style={{ color: C.onSurface }}>
                    Create Course Poll / Survey
                  </h3>
                  <p className="text-xs text-gray-500">Engage your enrolled students</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-gray-500 hover:bg-gray-200"
              >
                <MI name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePollSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Poll / Survey Title *
                </label>
                <input
                  type="text"
                  required
                  value={pollForm.title}
                  onChange={(e) => setPollForm({ ...pollForm, title: e.target.value })}
                  placeholder="e.g., Preferred Final Review Session Day"
                  className="w-full p-3 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-[#002045]"
                  style={{ borderColor: C.outlineVariant }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Description / Context (Optional)
                </label>
                <textarea
                  rows={2}
                  value={pollForm.description}
                  onChange={(e) => setPollForm({ ...pollForm, description: e.target.value })}
                  placeholder="Briefly explain the survey or question..."
                  className="w-full p-3 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-[#002045]"
                  style={{ borderColor: C.outlineVariant }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Poll Format
                </label>
                <select
                  value={pollForm.pollType}
                  onChange={(e) => setPollForm({ ...pollForm, pollType: e.target.value })}
                  className="w-full p-3 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-[#002045] bg-white"
                  style={{ borderColor: C.outlineVariant }}
                >
                  <option value="single_choice">Single Choice (1 Option)</option>
                  <option value="multiple_choice">Multiple Choice (Select Many)</option>
                  <option value="text_feedback">Open Text Feedback / Survey</option>
                </select>
              </div>

              {/* Dynamic Option Inputs for Choice Polls */}
              {pollForm.pollType !== "text_feedback" && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase">
                    Answer Options *
                  </label>
                  {pollForm.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1 p-2.5 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-[#002045]"
                        style={{ borderColor: C.outlineVariant }}
                      />
                      {pollForm.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(i)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg"
                        >
                          <MI name="delete" size={16} />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-xs font-bold text-[#002045] hover:underline flex items-center gap-1 mt-1"
                  >
                    <MI name="add" size={16} />
                    Add Option
                  </button>
                </div>
              )}

              {/* Anonymous responses toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={pollForm.isAnonymous}
                    onChange={(e) =>
                      setPollForm({ ...pollForm, isAnonymous: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#002045] focus:ring-[#002045]"
                  />
                  <span>Allow Anonymous Responses (hides student names)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#002045] text-white hover:bg-[#1a365d] transition shadow-sm disabled:opacity-50"
                >
                  {creating ? "Publishing..." : "Publish Poll"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div
          className="fixed bottom-6 right-6 z-[90] px-5 py-3 rounded-2xl text-xs font-bold shadow-xl animate-in fade-in"
          style={{ background: C.primary, color: C.onPrimary }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
