import { Link } from "wouter";

export function Announcements({ announcements }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-[#dae2fd] shadow-sm">
      <h2 className="text-xl font-semibold text-[#131b2e] mb-5">Announcements</h2>

      <div className="space-y-5">
        {announcements.length === 0 ? (
          <p className="text-sm text-[#74777f]">You're all caught up.</p>
        ) : (
          announcements.map((note) => {
            const inner = (
              <>
                <div className="w-10 h-10 rounded-full bg-[#eaedff] flex items-center justify-center text-lg">
                  🔔
                </div>
                <div>
                  <p className="text-sm text-[#131b2e]">{note.text}</p>
                  <p className="text-xs text-[#74777f] mt-1">{note.time}</p>
                </div>
              </>
            );

            return note.href ? (
              <Link
                key={note.id}
                href={note.href}
                className="flex gap-4"
                data-testid={`card-announcement-${note.id}`}
              >
                {inner}
              </Link>
            ) : (
              <div key={note.id} className="flex gap-4" data-testid={`card-announcement-${note.id}`}>
                {inner}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
