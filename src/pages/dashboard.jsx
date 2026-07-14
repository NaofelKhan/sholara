import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StudentOverview } from '@/components/dashboard/StudentOverview';
import { UpcomingTasks } from '@/components/dashboard/UpcomingTasks';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { SkillRecommendations } from '@/components/dashboard/SkillRecommendations';
import { AcademicCalendar } from '@/components/dashboard/AcademicCalendar';
import { Announcements } from '@/components/dashboard/Announcements';

// Mock data for the dashboard. Will be replaced with real API data once the
// backend is connected.
const profile = {
  name: 'Alex Rivera',
  firstName: 'Alex',
  role: 'Computer Science, Junior',
};

const academic = {
  semester: 'Fall 2024',
  gpa: 3.8,
  completion: 65,
  creditsCompleted: 92,
  totalCredits: 120,
  mentoringHours: 24,
  rank: 'Top 5%',
};

const todayFocus = {
  lecturesToday: 2,
  mentoringSessions: 1,
  focus: 'Quantum Mechanics Quiz',
};

const tasks = [
  { id: 't1', title: 'Quantum Mechanics Quiz', due: 'Due in 4 hours', urgent: true },
  { id: 't2', title: 'Ethics in AI Essay', due: 'Due tomorrow', urgent: false },
  { id: 't3', title: 'Data Visualization Project', due: 'Due in 3 days', urgent: false },
];

const activities = [
  {
    id: 'a1',
    type: 'announcement',
    actor: 'Prof. Davison',
    action: 'posted a new announcement in',
    course: 'Quantum Mechanics',
    time: '2 hours ago',
  },
  {
    id: 'a2',
    type: 'skill',
    actor: 'Maria Rodriguez',
    action: 'accepted your skill exchange request for',
    course: 'Public Speaking',
    time: '5 hours ago',
  },
  {
    id: 'a3',
    type: 'grade',
    actor: 'Prof. Chen',
    action: 'graded your submission for',
    course: 'Data Visualization Project',
    time: '1 day ago',
  },
];

const skillMatches = [
  { id: 'm1', name: 'Elena Vance', skill: 'Motion Graphics' },
  { id: 'm2', name: 'Marcus Thorne', skill: 'Public Speaking' },
];

const calendarEvents = [
  { id: 'c1', title: 'Quantum Mechanics Lecture', time: '9:00 AM' },
  { id: 'c2', title: 'Skill Exchange with Elena', time: '1:00 PM' },
  { id: 'c3', title: 'Study Group: Data Viz', time: '4:00 PM' },
];

const announcements = [
  { id: 'n1', text: 'Your Ethics in AI essay is due tomorrow.', time: '1 hour ago' },
  { id: 'n2', text: 'Marcus Thorne sent you a message.', time: '3 hours ago' },
];

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
