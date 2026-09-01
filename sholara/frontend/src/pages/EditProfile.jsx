import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { getMe, updateAcademicProfile } from "../api/auth";
import "../styles/editProfile.css";

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const [, navigate] = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("");

  const [formData, setFormData] = useState({
    semester: "Fall 2024",
    gpa: 3.8,
    completion: 65,
    creditsCompleted: 92,
    totalCredits: 120,
    mentoringHours: 24,
    rank: "Top 5%",
    lecturesToday: 2,
    mentoringSessions: 1,
    focus: "Coursework",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setFetching(true);
        const userData = await getMe();
        
        if (userData) {
          setFormData({
            semester: userData.semester || "Fall 2024",
            gpa: userData.gpa || 3.8,
            completion: userData.completion || 65,
            creditsCompleted: userData.creditsCompleted || 92,
            totalCredits: userData.totalCredits || 120,
            mentoringHours: userData.mentoringHours || 24,
            rank: userData.rank || "Top 5%",
            lecturesToday: userData.lecturesToday || 2,
            mentoringSessions: userData.mentoringSessions || 1,
            focus: userData.focus || "Coursework",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        showMessage("Failed to load profile data", "error");
      } finally {
        setFetching(false);
      }
    };

    fetchUserData();
  }, []);

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage(null);
      setMessageType("");
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await updateAcademicProfile(formData);
      
      if (response.user) {
        setUser(response.user);
        showMessage("Profile updated successfully!", "success");
        
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showMessage(
        error.response?.data?.message || "Failed to update profile",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const profile = {
    fullName: user?.fullName,
    firstName: user?.fullName?.split(" ")[0],
    profilePicture: user?.profilePicture,
    department: user?.department,
    role: user?.role,
  };

  if (fetching) {
    return (
      <DashboardLayout profile={profile}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002045] mx-auto"></div>
            <p className="mt-4 text-[#43474e]">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="p-4 sm:p-6 md:p-8 bg-[#faf8ff] min-h-screen pt-20 md:pt-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#002045]">Edit Academic Profile</h1>
            <p className="mt-2 text-[#43474e]">
              Update your academic information that appears on your dashboard
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                messageType === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-sm border border-[#dae2fd]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Semester */}
              <div>
                <label className="block text-sm font-medium text-[#131b2e] mb-2">
                  Current Semester
                </label>
                <input
                  type="text"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-[#dae2fd] rounded-lg focus:ring-2 focus:ring-[#002045] focus:border-transparent outline-none"
                  placeholder="e.g., Fall 2024"
                />
              </div>

              {/* GPA */}
              <div>
                <label className="block text-sm font-medium text-[#131b2e] mb-2">
                  Current GPA
                </label>
                <input
                  type="number"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="4.0"
                  className="w-full px-4 py-2 border border-[#dae2fd] rounded-lg focus:ring-2 focus:ring-[#002045] focus:border-transparent outline-none"
                  placeholder="e.g., 3.8"
                />
              </div>

              {/* Degree Completion */}
              <div>
                <label className="block text-sm font-medium text-[#131b2e] mb-2">
                  Degree Completion (%)
                </label>
                <input
                  type="number"
                  name="completion"
                  value={formData.completion}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-[#dae2fd] rounded-lg focus:ring-2 focus:ring-[#002045] focus:border-transparent outline-none"
                  placeholder="e.g., 65"
                />
              </div>

              {/* Credits Completed */}
              <div>
                <label className="block text-sm font-medium text-[#131b2e] mb-2">
                  Credits Completed
                </label>
                <input
                  type="number"
                  name="creditsCompleted"
                  value={formData.creditsCompleted}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-[#dae2fd] rounded-lg focus:ring-2 focus:ring-[#002045] focus:border-transparent outline-none"
                  placeholder="e.g., 92"
                />
              </div>

              {/* Total Credits */}
              <div>
                <label className="block text-sm font-medium text-[#131b2e] mb-2">
                  Total Credits Required
                </label>
                <input
                  type="number"
                  name="totalCredits"
                  value={formData.totalCredits}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-[#dae2fd] rounded-lg focus:ring-2 focus:ring-[#002045] focus:border-transparent outline-none"
                  placeholder="e.g., 120"
                />
              </div>

              {/* Mentoring Hours */}
              <div>
                <label className="block text-sm font-medium text-[#131b2e] mb-2">
                  Mentoring Hours
                </label>
                <input
                  type="number"
                  name="mentoringHours"
                  value={formData.mentoringHours}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-[#dae2fd] rounded-lg focus:ring-2 focus:ring-[#002045] focus:border-transparent outline-none"
                  placeholder="e.g., 24"
                />
              </div>

              {/* Rank */}
              <div>
                <label className="block text-sm font-medium text-[#131b2e] mb-2">
                  Class Rank
                </label>
                <input
                  type="text"
                  name="rank"
                  value={formData.rank}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-[#dae2fd] rounded-lg focus:ring-2 focus:ring-[#002045] focus:border-transparent outline-none"
                  placeholder="e.g., Top 5%"
                />
              </div>

              {/* Lectures Today */}
              <div>
                <label className="block text-sm font-medium text-[#131b2e] mb-2">
                  Lectures Today
                </label>
                <input
                  type="number"
                  name="lecturesToday"
                  value={formData.lecturesToday}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-[#dae2fd] rounded-lg focus:ring-2 focus:ring-[#002045] focus:border-transparent outline-none"
                  placeholder="e.g., 2"
                />
              </div>

              {/* Mentoring Sessions */}
              <div>
                <label className="block text-sm font-medium text-[#131b2e] mb-2">
                  Mentoring Sessions Today
                </label>
                <input
                  type="number"
                  name="mentoringSessions"
                  value={formData.mentoringSessions}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-[#dae2fd] rounded-lg focus:ring-2 focus:ring-[#002045] focus:border-transparent outline-none"
                  placeholder="e.g., 1"
                />
              </div>

              {/* Today's Focus */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#131b2e] mb-2">
                  Today's Focus
                </label>
                <input
                  type="text"
                  name="focus"
                  value={formData.focus}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-[#dae2fd] rounded-lg focus:ring-2 focus:ring-[#002045] focus:border-transparent outline-none"
                  placeholder="e.g., Quantum Mechanics Quiz"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-2 border border-[#dae2fd] rounded-lg text-[#43474e] font-medium hover:bg-[#f1f5f9] transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#002045] text-white rounded-lg font-medium hover:bg-[#1a365d] transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
