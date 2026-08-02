import MI from './MI';
import C from '../constants/colors';

const CATEGORIES = [
  'All Skills',
  'UI/UX Design',
  'Python Tutoring',
  'Public Speaking',
  'Data Science',
  'Copywriting',
];

export default function CategoryFilters({ active, onSelect }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = active === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelect(cat)}
              className="px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-colors"
              style={
                isActive
                  ? { background: C.primary, color: C.onPrimary }
                  : { background: C.surfaceContainerHigh, color: C.onSurfaceVariant }
              }
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = C.primaryFixed; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = C.surfaceContainerHigh; }}
            >
              {cat}
            </button>
          );
        })}
      </div>
      <button
        className="flex items-center gap-1.5 text-sm font-medium transition-colors"
        style={{ color: C.onSurfaceVariant }}
        onMouseEnter={(e) => { e.currentTarget.style.color = C.primary; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = C.onSurfaceVariant; }}
      >
        <MI name="tune" size={20} />
        Advanced Filters
      </button>
    </div>
  );
}
