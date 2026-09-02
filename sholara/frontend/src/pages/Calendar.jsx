import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import C from "../constants/colors";
import MI from "../components/MI";
import { Link } from "wouter";
import { getDashboard } from "../api/dashboard";
import ScheduleAppointmentModal from "../components/ScheduleAppointmentModal";

export default function Calendar() {
  const { user } = useAuth();

  const profile = {
    fullName: user?.fullName,
    firstName: user?.fullName?.split(" ")[0],
    profilePicture: user?.profilePicture,
    department: user?.department,
    role: user?.role,
  };

  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [facultyMembers, setFacultyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadCalendar = () => {
    setLoading(true);
    getDashboard()
      .then((data) => {
        setTasks(data?.tasks || []);
        setEvents(data?.calendarEvents || []);
        setFacultyMembers(data?.facultyMembers || []);
      })
      .catch(() => {
        setTasks([]);
        setEvents([]);
        setFacultyMembers([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) loadCalendar();
  }, [user]);

  const faculty = facultyMembers[0] || null;

  return (
    <DashboardLayout profile={profile}>
      <main className="p-6 sm:p-10" style={{ background: C.background }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1" style={{ color: C.onSurface }}>
                Calendar
              </h1>
              <p style={{ color: C.onSurfaceVariant }}>
                The same assignments, sessions, and appointments shown on your dashboard.
              </p>
            </div>
            {faculty && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: C.primary, color: C.onPrimary }}
              >
                Book Appointment
              </button>
            )}
          </div>

          {loading ? (
            <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
              Loading your schedule...
            </p>
          ) : (
            <div className="space-y-8">
              <section
                className="rounded-2xl p-6"
                style={{
                  background: C.surfaceContainerLowest,
                  border: `1px solid ${C.outlineVariant}`,
                }}
              >
                <h2 className="text-lg font-semibold mb-4" style={{ color: C.onSurface }}>
                  Upcoming Tasks
                </h2>
                {tasks.length === 0 ? (
                  <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
                    No upcoming tasks.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <Link
                        key={task.id}
                        href={task.href || "/calendar"}
                        className="flex items-start justify-between gap-3 p-4 rounded-xl"
                        style={{ background: C.surfaceContainerLow }}
                      >
                        <div>
                          <p className="font-semibold text-sm" style={{ color: C.onSurface }}>
                            {task.title}
                          </p>
                          <p
                            className="text-xs mt-1"
                            style={{ color: task.urgent ? C.error : C.outline }}
                          >
                            {task.due}
                          </p>
                        </div>
                        <MI name={task.urgent ? "error" : "event"} size={20} />
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              <section
                className="rounded-2xl p-6"
                style={{
                  background: C.surfaceContainerLowest,
                  border: `1px solid ${C.outlineVariant}`,
                }}
              >
                <h2 className="text-lg font-semibold mb-4" style={{ color: C.onSurface }}>
                  Events
                </h2>
                {events.length === 0 ? (
                  <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
                    No upcoming events. Book a session from Skill Exchange or join a study group.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {events.map((event) => (
                      <Link
                        key={event.id}
                        href={event.href || "/calendar"}
                        className="flex items-center gap-3 p-4 rounded-xl"
                        style={{ background: C.surfaceContainerLow }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: C.primaryFixed }}
                        >
                          <MI name="event" size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: C.onSurface }}>
                            {event.title}
                          </p>
                          <p className="text-xs mt-1" style={{ color: C.outline }}>
                            {event.time}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              <Link href="/my-sessions">
                <button
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: C.primary, color: C.onPrimary }}
                >
                  Open My Sessions
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>

      {isModalOpen && faculty && (
        <ScheduleAppointmentModal
          faculty={faculty}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadCalendar}
        />
      )}
    </DashboardLayout>
  );
}