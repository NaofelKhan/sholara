import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import CertificateModal from "../components/booking/CertificateModal";
import { getMyCertificates } from "../api/certificate";
import C from "../constants/colors";
import MI from "../components/MI";

export default function Certificates() {
  const { user } = useAuth();

  const profile = {
    fullName: user?.fullName,
    firstName: user?.fullName?.split(" ")[0],
    profilePicture: user?.profilePicture,
    department: user?.department,
    role: user?.role,
  };

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCert, setActiveCert] = useState(null);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        setLoading(true);
        const data = await getMyCertificates();
        setCertificates(data || []);
      } catch (err) {
        console.error("Failed to load certificates:", err);
        setError("Failed to fetch completion certificates.");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchCerts();
  }, [user]);

  return (
    <DashboardLayout profile={profile}>
      <main className="p-6 md:p-10" style={{ background: C.background }}>
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1" style={{ color: C.onSurface }}>
                Completion Certificates
              </h1>
              <p style={{ color: C.onSurfaceVariant }}>
                Official verified credentials earned from completing Scholara skill exchange programs.
              </p>
            </div>

            <Link
              href="/skill-exchange"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#002045] text-white hover:bg-[#1a365d] transition shadow-sm w-fit"
            >
              <MI name="handshake" size={18} />
              Explore Skill Exchange
            </Link>
          </div>

          {/* List of Certificates */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-3xl animate-pulse"
                  style={{ background: C.surfaceContainerHigh }}
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-600">
              <MI name="error" size={36} className="mx-auto mb-2" />
              <p>{error}</p>
            </div>
          ) : certificates.length === 0 ? (
            <div
              className="text-center py-20 rounded-3xl p-8"
              style={{
                background: C.surfaceContainerLowest,
                border: `1px dashed ${C.outlineVariant}`,
              }}
            >
              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
                style={{ background: C.surfaceContainer, color: C.outline }}
              >
                <MI name="workspace_premium" size={36} />
              </div>
              <h3 className="font-bold text-base" style={{ color: C.onSurface }}>
                No Certificates Earned Yet
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-6">
                Complete a mentorship session in the Skill Exchange and your official certificate of completion will appear here.
              </p>
              <Link
                href="/skill-exchange"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#002045] text-white hover:bg-[#1a365d] transition"
              >
                Find a Skill Mentor
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert._id}
                  className="rounded-3xl overflow-hidden border shadow-sm hover:shadow-md transition flex flex-col bg-white"
                  style={{ borderColor: C.outlineVariant }}
                >
                  {/* Decorative Banner */}
                  <div className="h-28 bg-gradient-to-br from-[#002045] via-[#1a365d] to-[#006b5f] p-4 flex items-start justify-between relative text-white">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md">
                      {cert.category || "Skill Exchange"}
                    </span>
                    <div className="w-9 h-9 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-lg">
                      <MI name="workspace_premium" size={22} />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <p className="text-[10px] font-mono text-gray-400 mb-1">
                        ID: {cert.certificateId}
                      </p>
                      <h3 className="font-bold text-lg leading-tight" style={{ color: C.onSurface }}>
                        {cert.skillTitle}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Mentor: {cert.issuer?.fullName || "Scholara Mentor"}
                      </p>
                    </div>

                    <div className="pt-4 border-t flex items-center justify-between text-xs text-gray-500" style={{ borderColor: C.outlineVariant }}>
                      <span className="flex items-center gap-1">
                        <MI name="calendar_today" size={14} />
                        {new Date(cert.issueDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-emerald-600">
                        <MI name="verified" size={15} />
                        Verified
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveCert(cert)}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#faf8ff] border text-[#002045] hover:bg-[#d6e3ff] transition flex items-center justify-center gap-2"
                      style={{ borderColor: C.outlineVariant }}
                    >
                      <MI name="visibility" size={16} />
                      View Certificate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {activeCert && (
        <CertificateModal
          certificate={activeCert}
          onClose={() => setActiveCert(null)}
        />
      )}
    </DashboardLayout>
  );
}
