const DUMMY_AVATAR =
  'https://media.istockphoto.com/id/1288129985/tr/vekt%C3%B6r/bir-ki%C5%9Finin-yer-tutucunun-eksik-g%C3%B6r%C3%BCnt%C3%BCs%C3%BC.jpg';

export function SkillRecommendations({ matches }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-[#dae2fd] shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#131b2e]">Skill Recommendations</h2>
        <span className="px-3 py-1 rounded-full bg-[#62fae3] text-[#006b5f] text-xs font-bold">
          Recommended
        </span>
      </div>

      <div className="space-y-4">
        {matches.length === 0 ? (
          <p className="text-sm text-[#74777f]">No matches found yet.</p>
        ) : (
          matches.map((match) => (
            <div
              key={match.id}
              data-testid={`card-match-${match.id}`}
              className="p-4 bg-[#f2f3ff] rounded-xl flex items-center gap-4 hover:bg-[#eaedff] transition-all cursor-pointer"
            >
              <img
                src={match.avatarUrl || DUMMY_AVATAR}
                alt={match.name}
                className="w-12 h-12 rounded-lg object-cover"
                data-testid={`img-avatar-${match.id}`}
              />
              <div className="flex-grow">
                <p className="font-semibold text-[#131b2e]">{match.name}</p>
                <p className="text-sm text-[#74777f]">
                  Expert in: <span className="text-[#006b5f] font-medium">{match.skill}</span>
                </p>
              </div>
              <span className="material-symbols-outlined text-[#002045]">arrow_forward</span>
            </div>
          ))
        )}
      </div>

      <button
        data-testid="button-discover-matches"
        className="mt-6 w-full py-3 rounded-lg border-2 border-[#002045] text-[#002045] font-semibold hover:bg-[#002045] hover:text-white transition-all"
      >
        Discover All Matches
      </button>
    </div>
  );
}
