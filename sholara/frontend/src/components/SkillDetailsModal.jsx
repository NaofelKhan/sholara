import MI from "./MI";
import C from "../constants/colors";

export default function SkillDetailsModal({ skill, onClose, onBook }) {
  if (!skill) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "rgba(0,0,0,0.55)",
      }}
      onClick={onClose}
    >
    <div
    className="w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col shadow-2xl"
    style={{
        background: C.surface,
        maxHeight: "90vh",
    }}
    onClick={(e) => e.stopPropagation()}
    >
    {/* Header Image */}
    <div className="h-64 flex-shrink-0">
        <img
        src={
            skill.coverImage ||
            "https://via.placeholder.com/900x400?text=Skill"
        }
        alt={skill.title}
        className="w-full h-full object-cover"
        />
    </div>

    {/* Content */}
    <div className="p-6 overflow-y-auto flex-1">

          <div className="flex justify-between items-start mb-4">
            <div>
              <h2
                className="text-2xl font-bold"
                style={{ color: C.onSurface }}
              >
                {skill.title}
              </h2>

              <p
                className="mt-1"
                style={{ color: C.onSurfaceVariant }}
              >
                {skill.category}
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2"
            >
              <MI name="close" />
            </button>
          </div>

          {/* Mentor */}
          <div className="flex items-center gap-3 mb-6">

            <img
              src={
                skill.mentor?.profilePicture ||
                "https://via.placeholder.com/50"
              }
              alt={skill.mentor?.fullName}
              className="w-12 h-12 rounded-full object-cover"
            />

            <div>
            <h4
            style={{ color: C.onSurface }}
            className="font-semibold"
            >
            {skill.mentor?.fullName}
            </h4>

            <p
            style={{ color: C.onSurfaceVariant }}
            >
            {skill.mentorTitle
                ? `${skill.mentorTitle} • ${skill.mentorRole}`
                : skill.mentorRole || skill.mentor?.department}
            </p>
            </div>

          </div>

          {/* Description */}

          <h3 className="font-semibold mb-2">
            Description
          </h3>

          <p
            className="mb-6"
            style={{ color: C.onSurfaceVariant }}
          >
            {skill.description}
          </p>

          {/* Details */}

          <div className="grid grid-cols-2 gap-5">

            <Info
              label="Difficulty"
              value={skill.difficultyLevel}
            />

            <Info
              label="Duration"
              value={`${skill.estimatedDuration} min`}
            />

            <Info
              label="Delivery"
              value={skill.deliveryMethod}
            />

            <Info
              label="Pricing"
              value={
                skill.pricingModel === "Paid"
                  ? `৳ ${skill.price}`
                  : skill.pricingModel
              }
            />

            <Info
              label="Availability"
              value={
                skill.availabilityDays?.join(", ")
              }
            />

            <Info
              label="Notes"
              value={
                skill.availabilityNotes || "None"
              }
            />

          </div>

        <button
        onClick={() => onBook(skill)}
        className="mt-8 w-full py-3 rounded-xl font-semibold sticky bottom-0"
        style={{
            background: C.primary,
            color: C.onPrimary,
        }}
        >
        Book Now
        </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p
        className="text-xs uppercase"
        style={{
          color: C.onSurfaceVariant,
        }}
      >
        {label}
      </p>

      <p
        className="font-medium"
        style={{
          color: C.onSurface,
        }}
      >
        {value || "-"}
      </p>
    </div>
  );
}