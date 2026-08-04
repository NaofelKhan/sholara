import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import SkillForm from "../components/offerSkill/SkillForm";
import MarketplacePreview from "../components/offerSkill/MarketplacePreview";
import OfferToast from "../components/offerSkill/OfferToast";
import "../styles/offerSkill.css";

const defaultFormData = {
  title: "Advanced UX Design Systems",
  coverImage: null,
  coverImagePreview: null,
  mentorRole: "Junior",
  category: "Design",
  difficultyLevel: "Beginner",
  description:
    "Learn how to build scalable design systems using Figma and modern UI principles. We will cover tokens, component libraries, and documentation handoff for developers.",
  pricingModel: "Free (Reciprocal)",
  price: "",
  frequency: "Per Hour",
  estimatedDuration: "60",
  deliveryMethod: "Online (Video Call)",
  availabilityDays: ["Mon", "Wed", "Fri", "Sat"],
  availabilityNotes: "",
};

export default function OfferSkill() {
  const { user } = useAuth();

  const profile = {
    fullName: user?.fullName,
    firstName: user?.fullName?.split(" ")[0],
    profilePicture: user?.profilePicture,
    department: user?.department,
    role: user?.role,
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      availabilityDays: prev.availabilityDays.includes(day)
        ? prev.availabilityDays.filter((d) => d !== day)
        : [...prev.availabilityDays, day],
    }));
  };

  const handleImageChange = (file) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        coverImage: file,
        coverImagePreview: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const buildFormPayload = (status) => {
    const payload = new FormData();

    payload.append("title", formData.title);
    payload.append("mentorRole", formData.mentorRole);
    payload.append("category", formData.category);
    payload.append("difficultyLevel", formData.difficultyLevel);
    payload.append("description", formData.description);
    payload.append("pricingModel", formData.pricingModel);
    payload.append("price", formData.price || 0);
    payload.append("frequency", formData.frequency);
    payload.append("estimatedDuration", formData.estimatedDuration || 60);
    payload.append("deliveryMethod", formData.deliveryMethod);
    payload.append(
      "availabilityDays",
      JSON.stringify(formData.availabilityDays)
    );
    payload.append("availabilityNotes", formData.availabilityNotes);
    payload.append("status", status);

    if (formData.coverImage instanceof File) {
      payload.append("coverImage", formData.coverImage);
    }

    return payload;
  };

  const handleSubmit = async (status) => {
    if (!formData.title.trim()) {
      showToast("Please enter a skill title.", "error");
      return;
    }

    if (!formData.description.trim()) {
      showToast("Please enter a description.", "error");
      return;
    }

    setLoading(true);

    try {
      const payload = buildFormPayload(status);

      await axios.post("/api/skills", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showToast(
        status === "published"
          ? "Skill published successfully!"
          : "Skill saved as draft.",
        "success"
      );
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Something went wrong.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
<DashboardLayout profile={profile}>
  <div className="offer-skill-page">
    <div className="offer-skill-content">
      <div className="offer-page">
        <div className="offer-form-col">
          <h1 className="page-title">Offer Your Expertise</h1>

          <p className="page-subtitle">
            Empower your peers by sharing what you know best. Whether it's
            formal academic tutoring or practical creative skills, your
            contribution builds a stronger campus ecosystem.
          </p>

          <SkillForm
            formData={formData}
            onChange={handleChange}
            onDayToggle={handleDayToggle}
            onImageChange={handleImageChange}
          />

          <div className="form-actions">
            <button
              className="btn-draft"
              onClick={() => handleSubmit("draft")}
              disabled={loading}
            >
              Save as Draft
            </button>

            <button
              className="btn-publish"
              onClick={() => handleSubmit("published")}
              disabled={loading}
            >
              {loading ? "Publishing..." : "Publish Skill"}
            </button>
          </div>
        </div>
           

        <div className="offer-preview-col">
          <MarketplacePreview
            formData={formData}
            user={user}
          />
        </div>
           </div>
    </div>

    {toast && (
      <OfferToast
        message={toast.message}
        type={toast.type}
      />
    )}
  </div>
</DashboardLayout>
  );
}