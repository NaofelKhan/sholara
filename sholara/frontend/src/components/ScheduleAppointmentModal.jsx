import React, { useState, useEffect } from "react";
import { getFacultySlots, bookAppointment } from "../api/appointment";

const ScheduleAppointmentModal = ({ faculty, onClose, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getFacultySlots(faculty._id, selectedDate);
        setSlots(Array.isArray(data) ? data : []);
        setSelectedSlotId("");
      } catch (err) {
        setError("Failed to load available time slots.");
      } finally {
        setLoading(false);
      }
    };

    if (faculty && selectedDate) {
      fetchSlots();
    }
  }, [faculty, selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlotId) {
      setError("Please select a time slot.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await bookAppointment({
        facultyId: faculty._id,
        slotId: selectedSlotId,
        reason,
      });

      setSuccessMsg("Appointment scheduled successfully!");
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Error booking appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Schedule Appointment</h2>
        <p className="text-sm text-gray-600 mb-4">
          Faculty Member:{" "}
          <span className="font-semibold">{faculty?.name || faculty?.fullName}</span>
        </p>

        {error && (
          <div className="mb-3 p-2 text-sm bg-red-100 text-red-700 rounded">{error}</div>
        )}

        {successMsg && (
          <div className="mb-3 p-2 text-sm bg-green-100 text-green-700 rounded">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Available Time Slots
            </label>
            {loading ? (
              <p className="text-sm text-gray-500">Loading slots...</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-amber-600">No open slots on this date.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
                {slots.map((slot) => (
                  <button
                    key={slot._id}
                    type="button"
                    onClick={() => setSelectedSlotId(slot._id)}
                    className={`p-2 text-xs font-medium rounded border transition-colors ${
                      selectedSlotId === slot._id
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {slot.startTime} - {slot.endTime}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Topic / Reason for Appointment
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly state the topic for discussion..."
              rows={3}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedSlotId}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Booking..." : "Confirm Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleAppointmentModal;
