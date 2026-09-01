import { useState } from "react";
import { Link } from "wouter";
import ScheduleAppointmentModal from "../ScheduleAppointmentModal";

export function AcademicCalendar({ events, facultyMembers = [], onAppointmentBooked }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const faculty = facultyMembers[0] || null;

  return (
    <div className="bg-white rounded-xl p-6 border border-[#dae2fd] shadow-sm relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#131b2e]">Calendar</h2>

        <div className="flex items-center gap-3">
          {faculty && (
            <button
              onClick={() => setIsModalOpen(true)}
              data-testid="button-book-appointment"
              className="text-xs bg-[#002045] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-[#1a365d] transition"
            >
              + Book Appointment
            </button>
          )}

          <Link
            href="/calendar"
            data-testid="button-view-all-calendar"
            className="text-sm font-semibold text-[#002045] hover:underline"
          >
            View All
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {events.length === 0 ? (
          <p className="text-sm text-[#74777f]">No upcoming events.</p>
        ) : (
          events.slice(0, 4).map((event) => {
            const inner = (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d6e3ff] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#002045]">event</span>
                </div>
                <div>
                  <p className="font-semibold text-[#131b2e]">{event.title}</p>
                  <p className="text-sm text-[#74777f] mt-1">{event.time}</p>
                </div>
              </div>
            );

            return event.href ? (
              <Link
                key={event.id}
                href={event.href}
                data-testid={`card-event-${event.id}`}
                className="p-4 bg-[#f2f3ff] rounded-lg hover:bg-[#eaedff] transition-all block"
              >
                {inner}
              </Link>
            ) : (
              <div
                key={event.id}
                data-testid={`card-event-${event.id}`}
                className="p-4 bg-[#f2f3ff] rounded-lg hover:bg-[#eaedff] transition-all"
              >
                {inner}
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && faculty && (
        <ScheduleAppointmentModal
          faculty={faculty}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            if (onAppointmentBooked) onAppointmentBooked();
          }}
        />
      )}
    </div>
  );
}
