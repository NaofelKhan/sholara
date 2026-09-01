import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import SkillDetailsModal from "../components/SkillDetailsModal";
import BookingModal from "../components/booking/BookingModal";

import HeroBanner from "../components/HeroBanner";
import CategoryFilters from "../components/CategoryFilters";
import SkillCard from "../components/SkillCard";
import ActiveRequests from "../components/ActiveRequests";
import MatchedOpportunities from "../components/matchedOpportunities/MatchedOpportunities";
import RecommendedForYou from "../components/RecommendedForYou";

import useSkills from "../hooks/useSkills";
import C from "../constants/colors";

const initialAdvancedFilters = {
  pricing: "all", // "all" | "free" | "paid"
  maxPrice: "",
  difficulty: "all", // "all" | "Beginner" | "Intermediate" | "Advanced"
  deliveryMethod: "all", // "all" | "Online" | "In-Person"
  minRating: "all", // "all" | "4.0" | "4.5" | "5.0"
  availabilityDays: [], // ['Mon', 'Tue', ...]
  sortBy: "newest", // "newest" | "price_asc" | "price_desc" | "rating_desc"
};

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
  const [advancedFilters, setAdvancedFilters] = useState(initialAdvancedFilters);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const [selectedSkill, setSelectedSkill] = useState(null);
  const [bookingSkill, setBookingSkill] = useState(null);
  const [toast, setToast] = useState(null);

  const {
    skills,
    loading,
    error,
    deleteSkill,
  } = useSkills(activeCategory);

  const handleFilterChange = (key, value) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setAdvancedFilters(initialAdvancedFilters);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (advancedFilters.pricing !== "all") count++;
    if (advancedFilters.maxPrice && advancedFilters.pricing !== "free") count++;
    if (advancedFilters.difficulty !== "all") count++;
    if (advancedFilters.deliveryMethod !== "all") count++;
    if (advancedFilters.minRating !== "all") count++;

    if (advancedFilters.availabilityDays.length > 0) {
      count += advancedFilters.availabilityDays.length;
    }

    if (advancedFilters.sortBy !== "newest") count++;

    return count;
  }, [advancedFilters]);

  const displayedSkills = useMemo(() => {
    if (!Array.isArray(skills)) return [];

    let result = [...skills];

    // 1. Pricing Model filter
    if (advancedFilters.pricing === "free") {
      result = result.filter(
        (s) => s.pricingModel === "Free" || Number(s.price || 0) === 0
      );
    } else if (advancedFilters.pricing === "paid") {
      result = result.filter(
        (s) => s.pricingModel !== "Free" && Number(s.price || 0) > 0
      );
    }

    // 2. Max Price filter
    if (
      advancedFilters.maxPrice &&
      advancedFilters.pricing !== "free" &&
      !isNaN(Number(advancedFilters.maxPrice))
    ) {
      const max = Number(advancedFilters.maxPrice);

      result = result.filter((s) => {
        const price =
          s.pricingModel === "Free" ? 0 : Number(s.price || 0);

        return price <= max;
      });
    }

    // 3. Difficulty Level filter
    if (advancedFilters.difficulty !== "all") {
      result = result.filter(
        (s) =>
          (s.difficultyLevel || "").toLowerCase() ===
          advancedFilters.difficulty.toLowerCase()
      );
    }

    // 4. Delivery Method filter
    if (advancedFilters.deliveryMethod !== "all") {
      result = result.filter((s) =>
        (s.deliveryMethod || "")
          .toLowerCase()
          .includes(advancedFilters.deliveryMethod.toLowerCase())
      );
    }

    // 5. Min Rating filter
    if (advancedFilters.minRating !== "all") {
      const minR = Number(advancedFilters.minRating);

      result = result.filter(
        (s) => Number(s.rating || 5.0) >= minR
      );
    }

    // 6. Availability Days filter
    if (advancedFilters.availabilityDays.length > 0) {
      result = result.filter((s) => {
        const days = Array.isArray(s.availabilityDays)
          ? s.availabilityDays
          : [];

        return advancedFilters.availabilityDays.some((day) =>
          days.includes(day)
        );
      });
    }

    // 7. Sort Order
    if (advancedFilters.sortBy === "price_asc") {
      result.sort((a, b) => {
        const pA =
          a.pricingModel === "Free" ? 0 : Number(a.price || 0);

        const pB =
          b.pricingModel === "Free" ? 0 : Number(b.price || 0);

        return pA - pB;
      });
    } else if (advancedFilters.sortBy === "price_desc") {
      result.sort((a, b) => {
        const pA =
          a.pricingModel === "Free" ? 0 : Number(a.price || 0);

        const pB =
          b.pricingModel === "Free" ? 0 : Number(b.price || 0);

        return pB - pA;
      });
    } else if (advancedFilters.sortBy === "rating_desc") {
      result.sort(
        (a, b) =>
          Number(b.rating || 5.0) -
          Number(a.rating || 5.0)
      );
    }

    return result;
  }, [skills, advancedFilters]);

  const openBooking = (skill) => {
    if (!user) {
      setToast({
        message: "Please log in to book a session.",
        type: "error",
      });

      setTimeout(() => setToast(null), 3000);

      return;
    }

    setSelectedSkill(null);
    setBookingSkill(skill);
  };

  // Delete a marketplace skill owned by the logged-in user
  const handleDeleteSkill = async (skill) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${skill.title}"?`
    );

    if (!confirmed) return;

    try {
      await deleteSkill(skill._id);

      // Close details modal if the deleted skill was selected
      if (selectedSkill?._id === skill._id) {
        setSelectedSkill(null);
      }

      setToast({
        message: "Skill deleted successfully.",
        type: "success",
      });

      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Delete skill error:", err);

      setToast({
        message: "Failed to delete skill.",
        type: "error",
      });

      setTimeout(() => setToast(null), 3000);
    }
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
      <main
        className="p-6 sm:p-8 md:p-10"
        style={{ background: C.background }}
      >
        <div className="max-w-7xl mx-auto">
          <HeroBanner />

          {/* Category & Advanced Filters */}
          <CategoryFilters
            active={activeCategory}
            onSelect={setActiveCategory}
            filters={advancedFilters}
            onFilterChange={handleFilterChange}
            isAdvancedOpen={isAdvancedOpen}
            onToggleAdvanced={() =>
              setIsAdvancedOpen((prev) => !prev)
            }
            onResetFilters={handleResetFilters}
            activeFilterCount={activeFilterCount}
          />

          {/* Filter Status Line */}
          {activeFilterCount > 0 && (
            <div className="flex items-center justify-between mb-6 px-1">
              <p className="text-xs font-semibold text-[#43474e]">
                Showing{" "}
                <span className="font-bold text-[#002045]">
                  {displayedSkills.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-[#002045]">
                  {skills.length}
                </span>{" "}
                skill cards with active filters
              </p>

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#ba1a1a] hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Skill Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="rounded-xl h-72 animate-pulse"
                  style={{
                    background: C.surfaceContainerHigh,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
              {displayedSkills.map((skill) => (
                <div
                  key={skill._id}
                  onClick={() => setSelectedSkill(skill)}
                  className="cursor-pointer"
                >
                  <SkillCard
                    skill={skill}
                    onBook={openBooking}
                    onDelete={handleDeleteSkill}
                  />
                </div>
              ))}

              {displayedSkills.length === 0 && (
                <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center py-16 px-4 rounded-2xl bg-white border border-[#dae2fd]">
                  <p className="text-base font-semibold text-[#131b2e]">
                    No skills found matching your filters.
                  </p>

                  <p className="text-xs text-[#43474e] mt-1">
                    Try loosening your filter parameters or selecting
                    "All Skills".
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("All Skills");
                      handleResetFilters();
                    }}
                    className="mt-4 px-4 py-2 bg-[#002045] text-white text-xs font-bold rounded-lg hover:bg-[#1a365d] transition cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 1. Active Requests */}
          <ActiveRequests />

          {/* 2. User Matching Feature: Matched Opportunities */}
          <MatchedOpportunities
            onSelectSkill={setSelectedSkill}
            onBookSkill={openBooking}
          />

          {/* 3. Recommended For You & Requests You Could Fulfill */}
          <div className="mt-18">
            <RecommendedForYou
              onSelectSkill={setSelectedSkill}
              onBookSkill={openBooking}
            />
          </div>

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
                background:
                  toast.type === "error"
                    ? C.error
                    : C.primary,
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