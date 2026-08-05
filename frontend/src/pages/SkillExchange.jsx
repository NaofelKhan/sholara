import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import SkillDetailsModal from "../components/SkillDetailsModal";
import BookingModal from "../components/booking/BookingModal";

import HeroBanner from "../components/HeroBanner";
import CategoryFilters from "../components/CategoryFilters";
import SkillCard from "../components/SkillCard";
import ActiveRequests from "../components/ActiveRequests";

import useSkills from "../hooks/useSkills";
import C from "../constants/colors";

export default function SkillExchange() {
  const { user } = useAuth();

  const profile = {
    fullName: user?.fullName,
    firstName: user?.fullName?.split(" ")[0],
    profilePicture: user?.profilePicture,
    department: user?.department,
    role: user?.role,
  };

  const [activeCategory, setActiveCategory] = useState("All Skills");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [bookingSkill, setBookingSkill] = useState(null);
  const [toast, setToast] = useState(null);
  const { skills, loading, error } = useSkills(activeCategory);

  const openBooking = (skill) => {
    if (!user) {
      setToast({ message: "Please log in to book a session.", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setSelectedSkill(null);
    setBookingSkill(skill);
  };

  const handleBookingSuccess = () => {
    setToast({
      message: "Session booked! Waiting for mentor confirmation.",
      type: "success",
    });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <DashboardLayout profile={profile}>
      <main className="p-10" style={{ background: C.background }}>
        <div className="max-w-7xl mx-auto">
          <HeroBanner />

          <CategoryFilters
            active={activeCategory}
            onSelect={setActiveCategory}
          />

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="rounded-xl h-72 animate-pulse"
                  style={{ background: C.surfaceContainerHigh }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
              {(Array.isArray(skills) ? skills : []).map((skill) => (
                <div
                  key={skill._id}
                  onClick={() => setSelectedSkill(skill)}
                  className="cursor-pointer"
                >
                  <SkillCard skill={skill} onBook={openBooking} />
                </div>
              ))}

              {(!skills || skills.length === 0) && (
                <p
                  className="col-span-3 text-center py-16"
                  style={{ color: C.onSurfaceVariant }}
                >
                  No skills found for this category.
                </p>
              )}
            </div>
          )}

          <ActiveRequests />

          <SkillDetailsModal
            skill={selectedSkill}
            onClose={() => setSelectedSkill(null)}
            onBook={openBooking}
          />

          {bookingSkill && (
            <BookingModal
              skill={bookingSkill}
              onClose={() => setBookingSkill(null)}
              onSuccess={handleBookingSuccess}
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
        </div>
      </main>
    </DashboardLayout>
  );
}