import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StudentOverview } from "@/components/dashboard/StudentOverview";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { SkillRecommendations } from "@/components/dashboard/SkillRecommendations";
import { AcademicCalendar } from "@/components/dashboard/AcademicCalendar";
import { Announcements } from "@/components/dashboard/Announcements";
import { useAuth } from "../context/AuthContext";
import { Link } from "wouter";
import { getRecommendedSkills } from "../api/recommendation";
import { getDashboard } from "../api/dashboard";

export default function Dashboard() {
  const { user } = useAuth();

  const [skillMatches, setSkillMatches] = useState([]);
  const [skillMatchesLoading, setSkillMatchesLoading] = useState(true);
  const [skillMatchesBasedOnActivity, setSkillMatchesBasedOnActivity] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [facultyMembers, setFacultyMembers] = useState([]);

  const loadDashboardData = () => {
    getDashboard()
      .then((data) => {
        setTasks(data?.tasks || []);
        setActivities(data?.activities || []);
        setCalendarEvents(data?.calendarEvents || []);
        setAnnouncements(data?.announcements || []);
        setFacultyMembers(data?.facultyMembers || []);
      })
      .catch(() => {
        setTasks([]);
        setActivities([]);
        setCalendarEvents([]);
        setAnnouncements([]);
        setFacultyMembers([]);
      });
  };

  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    setSkillMatchesLoading(true);

    getRecommendedSkills()
      .then((res) => {
        const mapped = (res?.skills || []).slice(0, 2).map((skill) => ({
          id: skill._id,
          name: skill.mentor?.fullName || "Scholara Mentor",
          skill: skill.title,
          avatarUrl: skill.mentor?.profilePicture,
        }));

        setSkillMatches(mapped);
        setSkillMatchesBasedOnActivity(!!res?.basedOnActivity);
      })
      .catch(() => setSkillMatches([]))
      .finally(() => setSkillMatchesLoading(false));
  }, [user]);

  const profile = {
    fullName: user?.fullName,
    firstName: user?.fullName?.split(" ")[0],
    profilePicture: user?.profilePicture,
    department: user?.department,
    role: user?.role,
  };

  const role = (user?.role || "student").toLowerCase();

  const academic = {
    semester: user?.semester || "Fall 2024",
    gpa: user?.gpa || 3.8,
    completion: user?.completion || 65,
    creditsCompleted: user?.creditsCompleted || 92,
    totalCredits: user?.totalCredits || 120,
    mentoringHours: user?.mentoringHours || 24,
    rank: user?.rank || "Top 5%",
  };

  const todayFocus = {
    lecturesToday: user?.lecturesToday || 2,
    mentoringSessions: user?.mentoringSessions || 1,
    focus: user?.focus || "Coursework",
  };

  // Show only the top 3 upcoming tasks
  const upcomingTasks = tasks.slice(0, 2);

  // Sort calendar events by their closest available date
  // and show only the closest 2 events
  const upcomingCalendarEvents = [...calendarEvents]
    .sort((a, b) => {
      const dateA = new Date(
        a?.date ||
        a?.startDate ||
        a?.dueDate ||
        a?.eventDate ||
        a?.start ||
        0
      );

      const dateB = new Date(
        b?.date ||
        b?.startDate ||
        b?.dueDate ||
        b?.eventDate ||
        b?.start ||
        0
      );

      return dateA - dateB;
    })
    .slice(0, 2);

  return (
    <DashboardLayout profile={profile}>
      <div className="p-4 sm:p-6 md:p-8 bg-[#faf8ff] min-h-screen pt-20 md:pt-8">
        {role === "faculty" || role === "teacher" ? (
          <div className="mb-6 bg-gradient-to-r from-[#002045] to-[#1a365d] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-200 border border-blue-400/30 rounded-full text-xs font-semibold uppercase tracking-wider">
                Faculty Control Workspace
              </span>

              <h2 className="text-2xl font-bold mt-2">
                Welcome back, Professor {profile.firstName}!
              </h2>

              <p className="text-sm text-blue-100/80 mt-1">
                Manage your course workspaces, review student submissions across cohorts, and communicate with TAs.
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/courses">
                <button className="px-4 py-2 bg-white text-[#002045] font-semibold text-sm rounded-lg hover:bg-blue-50 transition flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    school
                  </span>
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

              <h2 className="text-2xl font-bold mt-2">
                Welcome back, {profile.firstName}!
              </h2>

              <p className="text-sm text-amber-100/80 mt-1">
                Assist faculty in course tools, review assignment submissions, record attendance, and post materials.
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/courses">
                <button className="px-4 py-2 bg-white text-amber-900 font-semibold text-sm rounded-lg hover:bg-amber-50 transition flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    assignment_turned_in
                  </span>
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

              <h2 className="text-2xl font-bold mt-2">
                System Administrator Hub
              </h2>

              <p className="text-sm text-purple-100/80 mt-1">
                Monitor system operation health, user roles, department activities, and compliance.
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/admin">
                <button className="px-4 py-2 bg-white text-purple-950 font-semibold text-sm rounded-lg hover:bg-purple-50 transition flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    admin_panel_settings
                  </span>
                  Open Admin Portal
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <StudentOverview
            firstName={profile.firstName}
            {...todayFocus}
            {...academic}
          />
        )}

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <RecentActivity activities={activities} />
          </div>

          <div className="col-span-12 lg:col-span-4">
            <UpcomingTasks tasks={upcomingTasks} />
          </div>

          <div className="col-span-12 lg:col-span-7">
            <SkillRecommendations
              matches={skillMatches.slice(0, 2)}
              loading={skillMatchesLoading}
              basedOnActivity={skillMatchesBasedOnActivity}
            />
          </div>

          <div className="col-span-12 lg:col-span-5">
            <AcademicCalendar
              events={upcomingCalendarEvents}
              facultyMembers={facultyMembers}
              onAppointmentBooked={loadDashboardData}
            />
          </div>

          <div className="col-span-12">
            <Announcements announcements={announcements} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
