import { useState } from "react";
import ScheduleAppointmentModal from "../ScheduleAppointmentModal";

export function AcademicCalendar({ events }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock faculty member for testing
  const sampleFaculty = {
    _id: "64f1a2b3c4e5f6a7b8c9d0e1",
    name: "Dr. Alan Turing",
    department: "Computer Science",
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-[#dae2fd] shadow-sm relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#131b2e]">Calendar</h2>
        
        {/* Added action buttons here */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            data-testid="button-book-appointment"
            className="text-xs bg-[#002045] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-[#1a365d] transition"
          >
            + Book Appointment
          </button>
          
          <button 
            data-testid="button-view-all-calendar" 
            className="text-sm font-semibold text-[#002045] hover:underline"
          >
            View All
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {events.length === 0 ? (
          <p className="text-sm text-[#74777f]">No upcoming events.</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              data-testid={`card-event-${event.id}`}
              className="p-4 bg-[#f2f3ff] rounded-lg hover:bg-[#eaedff] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d6e3ff] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#002045]">event</span>
                </div>
                <div>
                  <p className="font-semibold text-[#131b2e]">{event.title}</p>
                  <p className="text-sm text-[#74777f] mt-1">{event.time}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Renders modal when '+ Book Appointment' is clicked */}
      {isModalOpen && (
        <ScheduleAppointmentModal
          faculty={sampleFaculty}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => alert("Appointment scheduled successfully!")}
        />
      )}
    </div>
  );
}