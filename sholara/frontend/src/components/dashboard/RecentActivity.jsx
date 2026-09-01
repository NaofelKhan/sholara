import { Link } from "wouter";

const ICONS = {
  skill: "swap_horiz",
  grade: "check_circle",
  announcement: "campaign",
};

export function RecentActivity({ activities }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-[#dae2fd] shadow-sm">
      <h2 className="text-xl font-semibold text-[#131b2e] mb-6">Recent Activity</h2>

      <div className="space-y-6">
        {activities.length === 0 ? (
          <p className="text-sm text-[#74777f]">No recent activity.</p>
        ) : (
          activities.map((activity) => {
            const body = (
              <>
                <div className="w-10 h-10 rounded-full bg-[#d6e3ff] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#002045]">
                    {ICONS[activity.type] || "notifications"}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-[#131b2e]">
                    <span className="font-bold">{activity.actor}</span> {activity.action}
                    {activity.course && (
                      <span className="text-[#002045] font-medium"> {activity.course}</span>
                    )}
                  </p>
                  <p className="text-xs text-[#74777f] mt-1">{activity.time}</p>
                </div>
              </>
            );

            return activity.href ? (
              <Link
                key={activity.id}
                href={activity.href}
                className="flex gap-4 items-start"
                data-testid={`card-activity-${activity.id}`}
              >
                {body}
              </Link>
            ) : (
              <div key={activity.id} className="flex gap-4 items-start" data-testid={`card-activity-${activity.id}`}>
                {body}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
