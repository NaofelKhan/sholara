import { Link } from "wouter";

const DUMMY_AVATAR =
  "https://media.istockphoto.com/id/1288129985/tr/vekt%C3%B6r/bir-ki%C5%9Finin-yer-tutucunun-eksik-g%C3%B6r%C3%BCnt%C3%BCs%C3%BC.jpg";

export function SkillRecommendations({ matches, loading, basedOnActivity }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-[#c7ede4] shadow-sm relative overflow-hidden">
      {/* Teal accent strip along the top — the visual signature that separates
          Skill Exchange content from the blue-toned course/calendar cards
          elsewhere on the dashboard. */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0f6e56] to-[#5dcaa5]" />

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#e1f5ee] text-[#0f6e56] flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">handshake</span>
          </span>
          <h2 className="text-xl font-semibold text-[#131b2e]">Skill Recommendations</h2>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#e1f5ee] text-[#0f6e56] text-xs font-bold">
          {basedOnActivity ? "Based on your activity" : "Recommended"}
        </span>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-[#74777f]">Finding matches...</p>
        ) : matches.length === 0 ? (
          <p className="text-sm text-[#74777f]">No matches found yet.</p>
        ) : (
          matches.map((match) => (
            <Link
              key={match.id}
              href="/skill-exchange"
              data-testid={`card-match-${match.id}`}
              className="p-4 bg-[#f2fbf8] border border-[#c7ede4] rounded-xl flex items-center gap-4 hover:bg-[#e1f5ee] hover:border-[#5dcaa5] transition-all cursor-pointer"
            >
              <div className="relative shrink-0">
                <img
                  src={match.avatarUrl || DUMMY_AVATAR}
                  alt={match.name}
                  className="w-12 h-12 rounded-lg object-cover"
                  data-testid={`img-avatar-${match.id}`}
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0f6e56] text-white flex items-center justify-center border-2 border-[#f2fbf8]">
                  <span className="material-symbols-outlined text-[11px]">bolt</span>
                </span>
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-[#131b2e] truncate">{match.name}</p>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#c7ede4] text-[#085041] shrink-0">
                    Skill Exchange
                  </span>
                </div>
                <p className="text-sm text-[#74777f] truncate">
                  Expert in: <span className="text-[#0f6e56] font-medium">{match.skill}</span>
                </p>
              </div>
              <span className="material-symbols-outlined text-[#0f6e56] shrink-0">arrow_forward</span>
            </Link>
          ))
        )}
      </div>

      <Link
        href="/skill-exchange"
        data-testid="button-discover-matches"
        className="mt-6 w-full py-3 rounded-lg border-2 border-[#0f6e56] text-[#0f6e56] font-semibold hover:bg-[#0f6e56] hover:text-white transition-all flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-[18px]">handshake</span>
        Discover All Matches
      </Link>
    </div>
  );
}