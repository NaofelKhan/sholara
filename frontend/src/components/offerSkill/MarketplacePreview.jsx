import React from "react";

export default function MarketplacePreview({ formData, user }) {
const investment =
  formData.pricingModel === "Paid Service"
    ? formData.price
      ? `৳${formData.price}${
          formData.frequency
            ? `/${formData.frequency.replace("Per ", "").toLowerCase()}`
            : ""
        }`
      : "Enter price"
    : "FREE";

const investmentClass =
  investment === "FREE" ? "free" : "";

  return (
    <div className="preview-sticky">
      <div className="preview-header">
        <span className="preview-title">
          Marketplace Preview
        </span>

        <span className="live-sync">
          <span className="live-dot"></span>
          Live Sync
        </span>
      </div>

      <div className="preview-card">
        {/* Cover Image */}
        <div className="preview-image-wrapper">
          {formData.coverImagePreview ? (
            <img
              src={formData.coverImagePreview}
              alt="Skill Cover"
              className="preview-card-img"
            />
          ) : (
            <img
              src="https://images.ctfassets.net/zykafdb0ssf5/68qzkHjCboFfCsSxV2v9S6/4da75033db02c1339de2a3effb461f7a/missing.png"
              alt="Workspace"
              className="preview-card-img"
            />
          )}
        </div>

        <div className="preview-card-body">
      {/* Header */}


      {/* Author */}
      <div className="preview-author">

        <img
          src={
            user?.profilePicture ||
            "https://randomuser.me/api/portraits/men/32.jpg"
          }
          alt="Profile"
          className="preview-avatar"
        />

        <div className="preview-author-info">

          <span className="preview-author-name">
            {user?.fullName || ""}
          </span>

          <span className="preview-role">
            {formData.mentorTitle} • {formData.mentorRole}
          </span>

        </div>

        <span className="preview-rating">
          ★ 4.9
        </span>

      </div>
     
    

    {/* Title */}
    <div className="preview-skill-title">
      {formData.title || "Skill Title"}
    </div>

    {/* Description */}
    <div className="preview-desc">
      {formData.description ||
        "Add a description to see it here…"}
    </div>

          {/* Bottom Info */}
          <div className="preview-meta">
            <div className="preview-meta-left">
              <div className="preview-meta-item">
                <label>Method</label>

                <span>
                  {formData.deliveryMethod === "Online (Video Call)"
                    ? "Online"
                    : formData.deliveryMethod}
                </span>
              </div>

              <div className="preview-divider"></div>

              <div className="preview-meta-item">
                <label>Duration</label>

                <span>
                  {formData.estimatedDuration}
                </span>
              </div>
            </div>

            <div className="preview-investment">
              <label>Investment</label>

              <span className={investmentClass}>
                {investment}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Tip */}
      <div className="pro-tip">
        <div className="pro-tip-header">
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M9 18h6" />
            <path d="M10 22h4" />
            <path d="M12 2a7 7 0 0 0-4 13v3h8v-3a7 7 0 0 0-4-13z" />
          </svg>

          <div>
            <div className="pro-tip-title">
              Pro-Tip
            </div>

            <p>
              Detailed descriptions attract 40% more learner interest.
              Mention specific tools or frameworks you will use during
              the session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
