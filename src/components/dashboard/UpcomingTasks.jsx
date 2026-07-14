export function UpcomingTasks({ tasks }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-[#dae2fd] shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-[#131b2e]">Upcoming Tasks</h3>
        <button data-testid="button-view-all-tasks" className="text-sm font-semibold text-[#002045] hover:underline">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-[#74777f]">No upcoming tasks.</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              data-testid={`card-task-${task.id}`}
              className={`flex items-start gap-3 p-4 rounded-lg transition-all cursor-pointer ${
                task.urgent
                  ? 'bg-[#ffdad6]/40 border-l-4 border-[#ba1a1a]'
                  : 'bg-[#f2f3ff] hover:bg-[#eaedff]'
              }`}
            >
              <div className="flex-grow">
                <p className="font-semibold text-[#131b2e] text-sm">{task.title}</p>
                <p className={`text-xs mt-1 ${task.urgent ? 'text-[#ba1a1a] font-semibold' : 'text-[#74777f]'}`}>
                  {task.due}
                </p>
              </div>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  task.urgent ? 'bg-[#ffdad6]' : 'bg-white'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${task.urgent ? 'text-[#ba1a1a]' : 'text-[#74777f]'}`}
                >
                  {task.urgent ? 'error' : 'history_edu'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
