function StatCard({ title, value }) {
  return (
    <div className="bg-[#f2f3ff] rounded-lg p-4">
      <p className="text-xs uppercase tracking-wider text-[#74777f] font-semibold">{title}</p>
      <p className="mt-2 text-2xl font-bold text-[#002045]" data-testid={`text-stat-${title.toLowerCase()}`}>
        {value}
      </p>
    </div>
  );
}

export function StudentOverview({
  firstName,
  lecturesToday,
  mentoringSessions,
  focus,
  semester,
  gpa,
  completion,
  creditsCompleted,
  totalCredits,
  mentoringHours,
  rank,
}) {
  return (
    <section className="mb-6">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-semibold text-[#131b2e]" data-testid="text-welcome-heading">
            Welcome back, {firstName}.
          </h2>
          <p className="mt-3 text-lg text-[#43474e] max-w-[600px]" data-testid="text-welcome-summary">
            You have {lecturesToday} lecture{lecturesToday !== 1 ? 's' : ''} today and{' '}
            {mentoringSessions} peer-to-peer mentoring session{mentoringSessions !== 1 ? 's' : ''}.
            Ready to grow?
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm border border-[#dae2fd] min-w-[260px]">
          <div className="w-10 h-10 bg-[#62fae3] rounded-lg flex items-center justify-center text-[#006b5f]">
            <span className="material-symbols-outlined">event_note</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[#74777f] font-semibold">Today's Focus</p>
            <p className="mt-1 font-semibold text-[#131b2e]" data-testid="text-today-focus">
              {focus}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-[#dae2fd] shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold text-[#131b2e]">Academic Progress</h3>
            <p className="text-sm text-[#43474e] mt-1">{semester}</p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-bold text-[#002045]" data-testid="text-gpa">
              {gpa}
            </span>
            <p className="text-xs uppercase tracking-wider font-semibold text-[#74777f]">Current GPA</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-[#131b2e]">Degree Completion</span>
            <span className="text-sm font-semibold text-[#006b5f]" data-testid="text-completion-percent">
              {completion}%
            </span>
          </div>
          <div className="w-full h-2 bg-[#dae2fd] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#006b5f] rounded-full transition-all duration-700"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Credits" value={`${creditsCompleted}/${totalCredits}`} />
          <StatCard title="Mentoring" value={`${mentoringHours} hrs`} />
          <StatCard title="Ranking" value={rank} />
        </div>
      </div>
    </section>
  );
}
