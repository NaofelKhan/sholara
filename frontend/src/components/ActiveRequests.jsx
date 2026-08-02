import MI from './MI';
import C from '../constants/colors';
import useRequests from '../hooks/useRequests';

export default function ActiveRequests() {
  const { requests, loading } = useRequests();

  if (loading) {
    return (
      <section className="mt-4">
        <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Hanken Grotesk, sans-serif', color: C.onSurface }}>
          Active Requests
        </h2>
        <p style={{ color: C.onSurfaceVariant }}>Loading…</p>
      </section>
    );
  }

  return (
    <section className="mt-4">
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-2xl font-semibold tracking-tight"
          style={{ fontFamily: 'Hanken Grotesk, sans-serif', color: C.onSurface }}
        >
          Active Requests
        </h2>
        <a href="#" className="text-sm font-bold hover:underline" style={{ color: C.primary }}>
          View All Requests
        </a>
      </div>

      <div className="flex flex-col gap-3">
        {(Array.isArray(requests) ? requests : []).map((req) => (
          <div
            key={req._id}
            className="flex flex-wrap items-center justify-between gap-5 rounded-xl p-5 transition-colors"
            style={{ background: C.surface, border: `1px solid ${C.outlineVariant}` }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.surfaceContainer; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.surface; }}
          >
            <div className="flex items-center gap-5">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ background: req.iconBg, color: req.iconColor }}
              >
                <MI name={req.icon} size={28} />
              </div>
              <div>
                <h4 className="font-bold text-sm" style={{ color: C.onSurface }}>{req.title}</h4>
                <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
                  Posted by {req.poster} • {req.time}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.onSurfaceVariant }}>
                  Budget
                </p>
                <p className="font-bold" style={{ color: C.secondary }}>{req.budget}</p>
              </div>
              <button
                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{ border: `1px solid ${C.primary}`, color: C.primary, background: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = C.primary;
                  e.currentTarget.style.color = C.onPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = C.primary;
                }}
              >
                {req.btnLabel}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
