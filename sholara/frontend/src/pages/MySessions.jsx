import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import SessionCard from "../components/booking/SessionCard";
import RescheduleModal from "../components/booking/RescheduleModal";
import ReviewModal from "../components/booking/ReviewModal";
import CertificateModal from "../components/booking/CertificateModal";
import {
  getMyBookings,
  cancelBooking,
  confirmBooking,
  completeBooking,
} from "../api/booking";
import C from "../constants/colors";
import MI from "../components/MI";

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "rescheduled", label: "Rescheduled" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const ROLE_FILTERS = [
  { key: "all", label: "All Roles" },
  { key: "student", label: "As Student" },
  { key: "mentor", label: "As Mentor" },
];

export default function MySessions() {
  const { user } = useAuth();

  const profile = {
    fullName: user?.fullName,
    firstName: user?.fullName?.split(" ")[0],
    profilePicture: user?.profilePicture,
    department: user?.department,
    role: user?.role,
  };

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [certTarget, setCertTarget] = useState(null);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (roleFilter !== "all") params.role = roleFilter;

      const data = await getMyBookings(params);
      setBookings(data.bookings || []);
    } catch (err) {
      setError("Failed to load sessions.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, roleFilter]);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user, fetchBookings]);

  const handleCancel = async (booking) => {
    const reason = window.prompt("Reason for cancellation (optional):");
    if (reason === null) return;

    try {
      await cancelBooking(booking._id, reason);
      showToast("Session cancelled.");
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || "Cancel failed.", "error");
    }
  };

  const handleConfirm = async (booking) => {
    try {
      await confirmBooking(booking._id);
      showToast("Session confirmed!");
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || "Confirm failed.", "error");
    }
  };

  const handleComplete = async (booking) => {
    try {
      await completeBooking(booking._id);
      showToast("Session marked as completed. You can now rate your partner & claim your certificate!");
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || "Action failed.", "error");
    }
  };

  const handleRescheduleSuccess = () => {
    showToast("Session rescheduled.");
    fetchBookings();
  };

  const handleReviewSuccess = () => {
    showToast("Review submitted successfully! Thank you.");
    fetchBookings();
  };

  return (
    <DashboardLayout profile={profile}>
      <main className="p-6 md:p-10" style={{ background: C.background }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1
              className="text-3xl font-bold mb-1"
              style={{ color: C.onSurface }}
            >
              My Sessions
            </h1>
            <p style={{ color: C.onSurfaceVariant }}>
              Book, manage, reschedule, rate partners, or access completion certificates for your skill exchange sessions.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {ROLE_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setRoleFilter(f.key)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition"
                style={{
                  background:
                    roleFilter === f.key
                      ? C.primary
                      : C.surfaceContainerLowest,
                  color:
                    roleFilter === f.key ? C.onPrimary : C.onSurfaceVariant,
                  border: `1px solid ${
                    roleFilter === f.key ? C.primary : C.outlineVariant
                  }`,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div
            className="flex flex-wrap gap-1 mb-6 p-1 rounded-xl"
            style={{ background: C.surfaceContainer }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                style={{
                  background:
                    statusFilter === tab.key
                      ? C.surfaceContainerLowest
                      : "transparent",
                  color:
                    statusFilter === tab.key
                      ? C.primary
                      : C.onSurfaceVariant,
                  boxShadow:
                    statusFilter === tab.key
                      ? "0 1px 3px rgba(0,0,0,0.08)"
                      : "none",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-36 rounded-2xl animate-pulse"
                  style={{ background: C.surfaceContainerHigh }}
                />
              ))}
            </div>
          ) : error ? (
            <div
              className="text-center py-16 rounded-2xl"
              style={{ color: C.error }}
            >
              {error}
            </div>
          ) : bookings.length === 0 ? (
            <div
              className="text-center py-20 rounded-2xl"
              style={{
                background: C.surfaceContainerLowest,
                border: `1px dashed ${C.outlineVariant}`,
              }}
            >
              <MI name="event_busy" size={48} />
              <p
                className="mt-4 font-medium"
                style={{ color: C.onSurfaceVariant }}
              >
                No sessions found
              </p>
              <p className="text-sm mt-1" style={{ color: C.outline }}>
                Browse the Skill Exchange and book a session to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <SessionCard
                  key={booking._id}
                  booking={booking}
                  currentUserId={user?._id}
                  onReschedule={setRescheduleTarget}
                  onCancel={handleCancel}
                  onConfirm={handleConfirm}
                  onComplete={handleComplete}
                  onOpenReview={setReviewTarget}
                  onOpenCertificate={setCertTarget}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {rescheduleTarget && (
        <RescheduleModal
          booking={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onSuccess={handleRescheduleSuccess}
        />
      )}

      {reviewTarget && (
        <ReviewModal
          booking={reviewTarget}
          currentUserId={user?._id}
          onClose={() => setReviewTarget(null)}
          onSuccess={handleReviewSuccess}
        />
      )}

      {certTarget && (
        <CertificateModal
          booking={certTarget}
          onClose={() => setCertTarget(null)}
        />
      )}

      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[70] px-5 py-3 rounded-xl text-sm font-semibold shadow-lg"
          style={{
            background: toast.type === "error" ? C.error : C.primary,
            color: C.onPrimary,
          }}
        >
          {toast.message}
        </div>
      )}
    </DashboardLayout>
  );
}