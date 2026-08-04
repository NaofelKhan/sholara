import MI from './MI';
import C from '../constants/colors';
import { useLocation } from "wouter";

export default function HeroBanner() {
  const [, navigate] = useLocation();

  return (
    <section
      className="relative rounded-xl overflow-hidden mb-16 h-80 flex items-center px-16"
      style={{ background: C.primaryContainer }}
    >
      <div className="relative z-10 max-w-2xl">
        <h2
          className="text-4xl font-extrabold leading-tight tracking-tight mb-4"
          style={{
            fontFamily: 'Hanken Grotesk, sans-serif',
            color: C.onPrimary,
          }}
        >
          Master Any Skill,
          <br />
          Share Your Brilliance.
        </h2>

        <p
          className="text-lg mb-8 opacity-90"
          style={{ color: C.onPrimaryContainer }}
        >
          The decentralized academic economy for knowledge exchange and
          professional growth.
        </p>

        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => navigate("/offer-skill")}
            className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold shadow-lg transition-transform hover:scale-105"
            style={{
              background: C.secondary,
              color: C.onSecondary,
            }}
          >
            <MI name="add_circle" />
            Offer a Skill
          </button>

          <button
            className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold shadow-lg transition-transform hover:scale-105"
            style={{
              background: C.surfaceContainerLowest,
              color: C.primary,
            }}
          >
            <MI name="contact_support" />
            Request a Skill
          </button>
        </div>
      </div>
    </section>
  );
}
