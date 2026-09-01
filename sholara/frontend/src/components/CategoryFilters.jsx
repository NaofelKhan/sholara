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

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CategoryFilters({
  active,
  onSelect,
  filters,
  onFilterChange,
  isAdvancedOpen,
  onToggleAdvanced,
  onResetFilters,
  activeFilterCount = 0,
}) {
  const toggleDay = (day) => {
    if (!filters) return;
    const current = filters.availabilityDays || [];
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    onFilterChange?.('availabilityDays', updated);
  };

  return (
    <div className="mb-8">
      {/* Category Pills & Advanced Filters Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
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
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = C.primaryFixed;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = C.surfaceContainerHigh;
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onToggleAdvanced}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all border cursor-pointer ${
            isAdvancedOpen || activeFilterCount > 0
              ? 'bg-[#002045] text-white border-[#002045]'
              : 'text-[#43474e] border-[#c4c6cf] hover:border-[#002045] hover:text-[#002045] bg-white'
          }`}
        >
          <MI name="tune" size={18} />
          <span>Advanced Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-amber-400 text-slate-900 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {activeFilterCount}
            </span>
          )}
          <MI name={isAdvancedOpen ? 'expand_less' : 'expand_more'} size={18} />
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {isAdvancedOpen && filters && (
        <div
          className="mt-4 p-5 rounded-2xl border shadow-sm transition-all"
          style={{
            background: C.surface,
            borderColor: C.outlineVariant,
          }}
        >
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#dae2fd]">
            <div className="flex items-center gap-2 text-sm font-bold" style={{ color: C.onSurface }}>
              <MI name="filter_alt" size={18} />
              <span>Refine Skill Cards</span>
            </div>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs font-bold text-[#ba1a1a] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <MI name="restart_alt" size={14} />
                Reset All Filters ({activeFilterCount})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pricing Model */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.onSurfaceVariant }}>
                Pricing
              </label>
              <select
                value={filters.pricing || 'all'}
                onChange={(e) => onFilterChange?.('pricing', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border outline-none bg-white font-medium cursor-pointer"
                style={{ borderColor: C.outlineVariant, color: C.onSurface }}
              >
                <option value="all">All (Free & Paid)</option>
                <option value="free">Free Only</option>
                <option value="paid">Paid Service Only</option>
              </select>
            </div>

            {/* Max Budget (when not Free only) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.onSurfaceVariant }}>
                Max Price (৳)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                placeholder="e.g. 500"
                disabled={filters.pricing === 'free'}
                value={filters.maxPrice || ''}
                onChange={(e) => onFilterChange?.('maxPrice', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border outline-none bg-white font-medium disabled:opacity-50 disabled:bg-gray-100"
                style={{ borderColor: C.outlineVariant, color: C.onSurface }}
              />
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.onSurfaceVariant }}>
                Difficulty
              </label>
              <select
                value={filters.difficulty || 'all'}
                onChange={(e) => onFilterChange?.('difficulty', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border outline-none bg-white font-medium cursor-pointer"
                style={{ borderColor: C.outlineVariant, color: C.onSurface }}
              >
                <option value="all">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Delivery Method */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.onSurfaceVariant }}>
                Delivery Method
              </label>
              <select
                value={filters.deliveryMethod || 'all'}
                onChange={(e) => onFilterChange?.('deliveryMethod', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border outline-none bg-white font-medium cursor-pointer"
                style={{ borderColor: C.outlineVariant, color: C.onSurface }}
              >
                <option value="all">All Methods</option>
                <option value="Online">Online (Video Call)</option>
                <option value="In-Person">In-Person</option>
              </select>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.onSurfaceVariant }}>
                Min Rating
              </label>
              <select
                value={filters.minRating || 'all'}
                onChange={(e) => onFilterChange?.('minRating', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border outline-none bg-white font-medium cursor-pointer"
                style={{ borderColor: C.outlineVariant, color: C.onSurface }}
              >
                <option value="all">Any Rating</option>
                <option value="4.0">★ 4.0 & above</option>
                <option value="4.5">★ 4.5 & above</option>
                <option value="5.0">★ 5.0 only</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.onSurfaceVariant }}>
                Sort By
              </label>
              <select
                value={filters.sortBy || 'newest'}
                onChange={(e) => onFilterChange?.('sortBy', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border outline-none bg-white font-medium cursor-pointer"
                style={{ borderColor: C.outlineVariant, color: C.onSurface }}
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Rating: Highest First</option>
              </select>
            </div>

            {/* Availability Days */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.onSurfaceVariant }}>
                Availability Days
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map((d) => {
                  const isSelected = (filters.availabilityDays || []).includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-[#002045] text-white border-[#002045]'
                          : 'bg-white text-[#43474e] border-[#dae2fd] hover:bg-[#eaedff]'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
