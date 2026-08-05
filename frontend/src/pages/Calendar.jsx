import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import C from "../constants/colors";
import MI from "../components/MI";
import { Link } from "wouter";

export default function Calendar() {
  const { user } = useAuth();

  const profile = {
    fullName: user?.fullName,
    firstName: user?.fullName?.split(" ")[0],
    profilePicture: user?.profilePicture,
    department: user?.department,
    role: user?.role,
  };

  return (
    <DashboardLayout profile={profile}>
      <main className="p-10" style={{ background: C.background }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1
              className="text-3xl font-bold mb-1"
              style={{ color: C.onSurface }}
            >
              Calendar
            </h1>
            <p style={{ color: C.onSurfaceVariant }}>
              View your upcoming sessions and academic events in one place.
            </p>
          </div>

          <div
            className="text-center py-20 rounded-2xl"
            style={{
              background: C.surfaceContainerLowest,
              border: `1px dashed ${C.outlineVariant}`,
            }}
          >
            <MI name="calendar_month" size={48} />
            <p
              className="mt-4 font-medium"
              style={{ color: C.onSurfaceVariant }}
            >
              Calendar view coming soon
            </p>
            <p className="text-sm mt-1 mb-6" style={{ color: C.outline }}>
              For now, manage your bookings from My Sessions.
            </p>
            <Link href="/my-sessions">
              <button
                className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: C.primary, color: C.onPrimary }}
              >
                Go to My Sessions
              </button>
            </Link>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}