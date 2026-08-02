import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StudentOverview } from '@/components/dashboard/StudentOverview';
import { UpcomingTasks } from '@/components/dashboard/UpcomingTasks';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { SkillRecommendations } from '@/components/dashboard/SkillRecommendations';
import { AcademicCalendar } from '@/components/dashboard/AcademicCalendar';
import { Announcements } from '@/components/dashboard/Announcements';
import { loadDashboard } from "../controllers/DashboardController";

// Mock data for the dashboard. Will be replaced with real API data once the
// backend is connected.
const {
  profile,
  academic,
  todayFocus,
  tasks,
  activities,
  skillMatches,
  calendarEvents,
  announcements,
} = loadDashboard();

export default function Dashboard() {
  return (
    <DashboardLayout profile={profile}>
      <div className="p-8 bg-[#faf8ff] min-h-screen">
        <StudentOverview firstName={profile.firstName} {...todayFocus} {...academic} />

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <RecentActivity activities={activities} />
          </div>

          <div className="col-span-12 lg:col-span-4">
            <UpcomingTasks tasks={tasks} />
          </div>

          <div className="col-span-12 lg:col-span-7">
            <SkillRecommendations matches={skillMatches} />
          </div>

          <div className="col-span-12 lg:col-span-5">
            <AcademicCalendar events={calendarEvents} />
          </div>

          <div className="col-span-12">
            <Announcements announcements={announcements} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}