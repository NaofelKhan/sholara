import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StudentOverview } from "@/components/dashboard/StudentOverview";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { SkillRecommendations } from "@/components/dashboard/SkillRecommendations";
import { AcademicCalendar } from "@/components/dashboard/AcademicCalendar";
import { Announcements } from "@/components/dashboard/Announcements";
import { loadDashboard } from "../controllers/DashboardController";
import { useAuth } from "../context/AuthContext";
import { Link } from "wouter";

const {
  academic,
  todayFocus,
  tasks,
  activities,
  skillMatches,
  calendarEvents,
  announcements,
} = loadDashboard();

export default function Dashboard() {
  const { user } = useAuth();

  const profile = {
    fullName: user?.fullName,
    firstName: user?.fullName?.split(" ")[0],
    profilePicture: user?.profilePicture,
    department: user?.department,
    role: user?.role,
  };

  const role = (user?.role || "student").toLowerCase();

  return (
    <DashboardLayout profile={profile}>
      <div className="p-4 sm:p-6 md:p-8 bg-[#faf8ff] min-h-screen pt-20 md:pt-8">
        {/* Role Specific Header Banner */}
        {role === "faculty" || role === "teacher" ? (
          <div className="mb-6 bg-gradient-to-r from-[#002045] to-[#1a365d] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-200 border border-blue-400/30 rounded-full text-xs font-semibold uppercase tracking-wider">
                Faculty Control Workspace
              </span>
              <h2 className="text-2xl font-bold mt-2">Welcome back, Professor {profile.firstName}!</h2>
              <p className="text-sm text-blue-100/80 mt-1">
                Manage your course workspaces, review student submissions across cohorts, and communicate with TAs.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/courses">
                <button className="px-4 py-2 bg-white text-[#002045] font-semibold text-sm rounded-lg hover:bg-blue-50 transition flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">school</span>
                  Manage Courses
                </button>
              </Link>
            </div>
          </div>
        ) : role === "ta" ? (
          <div className="mb-6 bg-gradient-to-r from-amber-900 to-amber-800 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-200 border border-amber-400/30 rounded-full text-xs font-semibold uppercase tracking-wider">
                Teaching Assistant Portal
              </span>
              <h2 className="text-2xl font-bold mt-2">Welcome back, {profile.firstName}!</h2>
              <p className="text-sm text-amber-100/80 mt-1">
                Assist faculty in course tools, review assignment submissions, record attendance, and post materials.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/courses">
                <button className="px-4 py-2 bg-white text-amber-900 font-semibold text-sm rounded-lg hover:bg-amber-50 transition flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
                  TA Course Tools
                </button>
              </Link>
            </div>
          </div>
        ) : role === "admin" ? (
          <div className="mb-6 bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-200 border border-purple-400/30 rounded-full text-xs font-semibold uppercase tracking-wider">
                Administrator Overview
              </span>
              <h2 className="text-2xl font-bold mt-2">System Administrator Hub</h2>
              <p className="text-sm text-purple-100/80 mt-1">
                Monitor system operation health, user roles, department activities, and compliance.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin">
                <button className="px-4 py-2 bg-white text-purple-950 font-semibold text-sm rounded-lg hover:bg-purple-50 transition flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                  Open Admin Portal
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <StudentOverview firstName={profile.firstName} {...todayFocus} {...academic} />
        )}

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