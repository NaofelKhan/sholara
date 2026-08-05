import MI from "./MI";
import C from "../constants/colors";

export default function SkillCard({ skill, onBook }) {
  // Support both old template data and new MongoDB data
  const title = skill.title;

  const image =
    skill.coverImage ||
    skill.image ||
    "https://via.placeholder.com/600x300?text=Skill";

const tutor = skill.mentor
  ? {
      avatar:
        skill.mentor.profilePicture ||
        "https://via.placeholder.com/40",

      name: skill.mentor.fullName || "Unknown Mentor",

      role: skill.mentorTitle
        ? `${skill.mentorTitle} • ${skill.mentorRole}`
        : skill.mentorRole || skill.mentor.department || "Student Mentor",
    }
  : skill.tutor || {
      avatar: "https://via.placeholder.com/40",
      name: "Unknown Mentor",
      role: "Student Mentor",
    };

  const topRated = skill.topRated || false;

  // Temporary until a review system is built
  const rating = Number(skill.rating || 5.0);

  const isPaid =
  skill.pricingModel === "Paid" ||
  skill.pricingModel === "Paid Service";

const price = isPaid
  ? `৳${skill.price || 0}${
      skill.frequency
        ? `/${skill.frequency.replace("Per ", "").toLowerCase()}`
        : ""
    }`
  : "FREE";
  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col transition-all hover:-translate-y-1 group"
      style={{
        background: C.surfaceContainerLowest,
        border: `1px solid ${C.outlineVariant}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      }}
    >
      {/* Cover image */}
      <div className="h-40 overflow-hidden relative">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {topRated && (
          <div
            className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{
              background: C.secondary,
              color: C.onSecondary,
            }}
          >
            Top Rated
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <h3
            className="text-base font-semibold leading-snug"
            style={{
              color: C.onSurface,
              fontFamily: "Hanken Grotesk, sans-serif",
            }}
          >
            {title}
          </h3>

          <div
            className="flex items-center gap-1 shrink-0 ml-2"
            style={{ color: C.tertiary }}
          >
            <MI name="star" fill={1} size={18} />
            <span className="font-bold text-sm">
              {rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Mentor */}
        <div className="flex items-center gap-3 mb-5">
          <img
            src={tutor.avatar}
            alt={tutor.name}
            className="w-8 h-8 rounded-full object-cover"
          />

          <div>
            <p
              className="text-xs font-bold"
              style={{ color: C.onSurface }}
            >
              {tutor.name}
            </p>

            <p
              className="text-[11px]"
              style={{ color: C.onSurfaceVariant }}
            >
              {tutor.role}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-wider mb-0.5"
              style={{ color: C.onSurfaceVariant }}
            >
              Price
            </p>

            <p
              className="font-bold text-xl"
              style={{
                color: C.primary,
                fontFamily: "Hanken Grotesk, sans-serif",
              }}
            >
              {price}
            </p>
          </div>

          <button
        
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background: C.primaryFixed,
              color: C.primaryContainer,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = C.primary;
              e.currentTarget.style.color = C.onPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = C.primaryFixed;
              e.currentTarget.style.color = C.primaryContainer;
            }}
            onClick={(e) => {
              e.stopPropagation();
              onBook?.(skill);
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
