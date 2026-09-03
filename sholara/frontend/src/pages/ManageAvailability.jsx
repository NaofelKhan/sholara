import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { createAvailability, getMyAvailability, deleteAvailability } from "../api/appointment";

const ALLOWED_ROLES = ["faculty", "teacher", "ta"];

export default function ManageAvailability() {
  const { user } = useAuth();

  const profile = {
    fullName: user?.fullName,
    firstName: user?.fullName?.split(" ")[0],
    profilePicture: user?.profilePicture,
    department: user?.department,
    role: user?.role,
  };

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "10:30",
  });

  const isAllowed = ALLOWED_ROLES.includes((user?.role || "").toLowerCase());

  const loadSlots = () => {
    setLoading(true);
    getMyAvailability()
      .then((data) => setSlots(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load your availability."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAllowed) loadSlots();
    else setLoading(false);
  }, [isAllowed]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await createAvailability(form);
      setSuccess("Slot added.");
      loadSlots();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add slot.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this open slot?")) return;
    try {
      await deleteAvailability(id);
      setSlots((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove slot.");
    }
  };

  // Group slots by date for a cleaner list
  const grouped = slots.reduce((acc, slot) => {
    (acc[slot.date] = acc[slot.date] || []).push(slot);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort();

  return (
    <DashboardLayout profile={profile}>
      <main className="p-6 sm:p-10 bg-[#faf8ff] min-h-screen">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-[#002045] mb-1">My Availability</h1>
          <p className="text-[#43474e] mb-8">
            Set the time slots students can book you for office-hour appointments.
          </p>

          {!isAllowed ? (
            <div className="bg-white rounded-2xl border border-[#dae2fd] p-8 text-center text-[#74777f]">
              This page is only available to faculty and teaching assistants.
            </div>
          ) : (
            <div className="space-y-8">
              {/* Add slot form */}
              <div className="bg-white rounded-2xl border border-[#dae2fd] p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#002045] mb-4">Add a Slot</h2>

                {error && (
                  <div className="mb-3 p-2 text-sm bg-red-100 text-red-700 rounded">{error}</div>
                )}
                {success && (
                  <div className="mb-3 p-2 text-sm bg-green-100 text-green-700 rounded">{success}</div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#43474e] mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full p-2 border border-[#c4c6cf] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#43474e] mb-1">Start</label>
                    <input
                      type="time"
                      required
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="w-full p-2 border border-[#c4c6cf] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#43474e] mb-1">End</label>
                    <input
                      type="time"
                      required
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className="w-full p-2 border border-[#c4c6cf] rounded-lg text-sm"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-[#002045] text-white rounded-lg text-sm font-semibold hover:bg-[#1a365d] transition disabled:opacity-50"
                    >
                      {submitting ? "Adding..." : "Add Slot"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing slots */}
              <div className="bg-white rounded-2xl border border-[#dae2fd] p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#002045] mb-4">Your Slots</h2>

                {loading ? (
                  <p className="text-sm text-[#74777f]">Loading...</p>
                ) : sortedDates.length === 0 ? (
                  <p className="text-sm text-[#74777f]">
                    You haven't added any availability yet. Students can't book you until you do.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {sortedDates.map((date) => (
                      <div key={date}>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#74777f] mb-2">
                          {new Date(date + "T00:00:00").toDateString()}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {grouped[date].map((slot) => (
                            <div
                              key={slot._id}
                              className="flex items-center justify-between p-3 rounded-xl border border-[#dae2fd] bg-[#faf8ff]"
                            >
                              <div>
                                <p className="text-sm font-semibold text-[#131b2e]">
                                  {slot.startTime} - {slot.endTime}
                                </p>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    slot.isBooked
                                      ? "bg-gray-200 text-gray-600"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {slot.isBooked ? "Booked" : "Open"}
                                </span>
                              </div>
                              {!slot.isBooked && (
                                <button
                                  onClick={() => handleDelete(slot._id)}
                                  className="text-red-400 hover:text-red-600 text-xs font-bold"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}