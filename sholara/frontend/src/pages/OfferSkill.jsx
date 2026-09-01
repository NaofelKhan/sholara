import React, { useState } from "react";
import { useLocation } from "wouter";
import { createMarketplaceSkill } from "../api/marketplaceSkill";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import SkillForm from "../components/offerSkill/SkillForm";
import MarketplacePreview from "../components/offerSkill/MarketplacePreview";
import OfferToast from "../components/offerSkill/OfferToast";
import "../styles/offerSkill.css";


const defaultFormData = {
  title: "",
  coverImage: null,
  coverImagePreview: null,
  mentorTitle: "",
  mentorRole: "",
  category: "",
  difficultyLevel: "",
  description: "",
  pricingModel: "",
  price: "",
  frequency: "",
  estimatedDuration: "",
  deliveryMethod: "",
  availabilityDays: [],
  availabilityNotes: "",
};

export default function OfferSkill() {
  const [, navigate] = useLocation();
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
    payload.append("mentorTitle", formData.mentorTitle);
    payload.append("mentorRole", formData.mentorRole);
    payload.append("category", formData.category);
    payload.append("difficultyLevel", formData.difficultyLevel);
    payload.append("description", formData.description);
    payload.append("pricingModel", formData.pricingModel);
    payload.append("price", formData.price || 0);
    payload.append("frequency", formData.frequency);
    payload.append("estimatedDuration", formData.estimatedDuration);
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

  // Required fields for publishing only
  if (status === "published") {

    const requiredFields = [
      {
        key: "title",
        message: "Please enter a skill title."
      },
      {
        key: "mentorTitle",
        message: "Please enter your expertise title."
      },
      {
        key: "mentorRole",
        message: "Please enter your mentor role."
      },
      {
        key: "category",
        message: "Please select a category."
      },
      {
        key: "difficultyLevel",
        message: "Please select difficulty level."
      },
      {
        key: "description",
        message: "Please enter a description."
      },
      {
        key: "pricingModel",
        message: "Please select pricing model."
      },
      {
        key: "estimatedDuration",
        message: "Please enter estimated duration."
      },
      {
        key: "deliveryMethod",
        message: "Please select delivery method."
      },
    ];


    for (const field of requiredFields) {

      if (!formData[field.key] || !String(formData[field.key]).trim()) {

        showToast(field.message, "error");
        return;

      }

    }


    // Check availability days separately because it is an array
    if (formData.availabilityDays.length === 0) {

      showToast(
        "Please select at least one available day.",
        "error"
      );

      return;
    }


    // Paid service needs price
    if (
      formData.pricingModel === "Paid Service" &&
      !formData.price
    ) {

      showToast(
        "Please enter the service price.",
        "error"
      );

      return;
    }

  }


  setLoading(true);

  try {

    const payload = buildFormPayload(status);

    await createMarketplaceSkill(payload);


    if (status === "published") {

    showToast(
    "Skill published successfully!",
    "success"
    );

    setTimeout(() => {
    navigate("/skill-exchange");
    }, 2000);

    } else {

      showToast(
        "Skill saved as draft.",
        "success"
      );

    }


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
              onClick={() => {
                window.scrollTo(0, 0);
                navigate("/skill-exchange");
              }}
              disabled={loading}
              type="button"
            >
              Cancel
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