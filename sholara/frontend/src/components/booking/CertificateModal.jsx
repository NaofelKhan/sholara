import { useState, useEffect, useRef } from "react";
import { generateCertificate, getCertificateByBooking } from "../../api/certificate";
import C from "../../constants/colors";
import MI from "../MI";

export default function CertificateModal({ booking, certificate: initialCert, onClose }) {
  const [cert, setCert] = useState(initialCert || null);
  const [loading, setLoading] = useState(!initialCert);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    if (initialCert) {
      setCert(initialCert);
      setLoading(false);
      return;
    }

    if (booking?._id) {
      const fetchOrGenerate = async () => {
        try {
          setLoading(true);
          setError(null);
          // Try to get or generate
          const res = await generateCertificate(booking._id);
          setCert(res.certificate);
        } catch (err) {
          setError(
            err.response?.data?.message ||
              "Failed to load certificate. Please ensure the session is completed."
          );
        } finally {
          setLoading(false);
        }
      };
      fetchOrGenerate();
    }
  }, [booking, initialCert]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (!cert?.verificationCode) return;
    const url = `${window.location.origin}/certificates/verify/${cert.verificationCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[80] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col my-6"
        style={{ background: C.surfaceContainerLowest }}
      >
        {/* Header Action Bar */}
        <div
          className="p-4 border-b flex items-center justify-between no-print"
          style={{ borderColor: C.outlineVariant, background: C.surfaceContainerLow }}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b45309]">workspace_premium</span>
            <span className="font-bold text-sm" style={{ color: C.onSurface }}>
              Scholara Verified Certificate
            </span>
          </div>

          <div className="flex items-center gap-2">
            {cert && (
              <>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 hover:bg-gray-50 transition"
                  style={{ borderColor: C.outlineVariant, color: C.primary }}
                >
                  <MI name={copied ? "check" : "share"} size={16} />
                  {copied ? "Link Copied!" : "Share Link"}
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#002045] text-white hover:bg-[#1a365d] transition flex items-center gap-1.5 shadow-sm"
                >
                  <MI name="print" size={16} />
                  Print / Save PDF
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-500 hover:bg-gray-200 transition"
            >
              <MI name="close" size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body / Certificate Canvas */}
        <div className="p-6 md:p-10 flex justify-center bg-gray-100">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <MI name="sync" size={40} className="animate-spin text-blue-600 mx-auto" />
              <p className="font-semibold text-sm text-gray-600">Generating Verified Certificate...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center text-red-600 max-w-md">
              <MI name="error" size={40} className="mx-auto mb-2" />
              <p className="font-semibold text-sm">{error}</p>
            </div>
          ) : cert ? (
            <div
              ref={printRef}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 md:p-12 relative border-[8px] border-double border-[#b45309] text-center print:shadow-none print:border-8 print:w-full print:m-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, rgba(254, 243, 199, 0.25) 0%, rgba(255, 255, 255, 1) 75%)",
              }}
            >
              {/* Top Crest / Seal */}
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#d97706] via-[#b45309] to-[#78350f] text-white flex items-center justify-center shadow-lg border-2 border-amber-200">
                  <span className="material-symbols-outlined text-3xl">school</span>
                </div>
                <h4 className="mt-2 text-xs font-black tracking-[0.25em] text-[#b45309] uppercase">
                  Scholara Peer Learning & Academic Network
                </h4>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#002045] tracking-tight uppercase mb-1">
                Certificate of Completion
              </h1>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-6">
                Skill Exchange & Mentorship Program
              </p>

              <p className="text-xs italic text-gray-600 mb-2">This is proudly presented to</p>

              {/* Recipient Name */}
              <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-[#002045] border-b-2 border-[#b45309] pb-2 max-w-md mx-auto mb-4">
                {cert.recipient?.fullName || "Scholar Student"}
              </h2>

              <p className="text-xs text-gray-600 max-w-lg mx-auto leading-relaxed mb-6">
                for successfully completing the skill mentorship session and exchange program in{" "}
                <span className="font-bold text-gray-900 text-sm">
                  "{cert.skillTitle}"
                </span>{" "}
                with verified academic engagement and completion of core objectives.
              </p>

              {/* Signatures & Metadata Grid */}
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-amber-200 text-left">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Mentor / Partner</p>
                  <p className="font-serif font-bold text-sm text-gray-900">
                    {cert.issuer?.fullName || "Scholara Mentor"}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {cert.issuer?.department || "Academic Department"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Date of Issue</p>
                  <p className="font-serif font-bold text-sm text-gray-900">
                    {new Date(cert.issueDate || Date.now()).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-[11px] text-amber-700 font-semibold">Verified Credential</p>
                </div>
              </div>

              {/* Credential ID & Verification Badge */}
              <div className="mt-8 pt-4 border-t border-dashed border-gray-200 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                <span>Certificate ID: {cert.certificateId}</span>
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold font-sans">
                  CODE: {cert.verificationCode}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
