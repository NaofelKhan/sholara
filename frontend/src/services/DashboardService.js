export function getDashboardData() {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  return {
    profile: {},

    academic: {
      semester: 'Fall 2024',
      gpa: 3.8,
      completion: 65,
      creditsCompleted: 92,
      totalCredits: 120,
      mentoringHours: 24,
      rank: 'Top 5%',
    },

    todayFocus: {
      lecturesToday: 2,
      mentoringSessions: 1,
      focus: 'Quantum Mechanics Quiz',
    },

    tasks: [
      {
        id: 't1',
        title: 'Quantum Mechanics Quiz',
        due: 'Due in 4 hours',
        urgent: true,
      },
      {
        id: 't2',
        title: 'Ethics in AI Essay',
        due: 'Due tomorrow',
        urgent: false,
      },
      {
        id: 't3',
        title: 'Data Visualization Project',
        due: 'Due in 3 days',
        urgent: false,
      },
    ],

    activities: [
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
    ],

    skillMatches: [
      {
        id: 'm1',
        name: 'Elena Vance',
        skill: 'Motion Graphics',
      },
      {
        id: 'm2',
        name: 'Marcus Thorne',
        skill: 'Public Speaking',
      },
    ],

    calendarEvents: [
      {
        id: 'c1',
        title: 'Quantum Mechanics Lecture',
        time: '9:00 AM',
      },
      {
        id: 'c2',
        title: 'Skill Exchange with Elena',
        time: '1:00 PM',
      },
      {
        id: 'c3',
        title: 'Study Group: Data Viz',
        time: '4:00 PM',
      },
    ],

    announcements: [
      {
        id: 'n1',
        text: 'Your Ethics in AI essay is due tomorrow.',
        time: '1 hour ago',
      },
      {
        id: 'n2',
        text: 'Marcus Thorne sent you a message.',
        time: '3 hours ago',
      },
    ],
  };
}