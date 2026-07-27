import { BENEFITS } from "../../data";

export function Benefits() {
  return (
    <section className="py-12 px-4 md:px-8 lg:px-10 border-t border-white/5">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {BENEFITS.map((b) => (
          <div key={b.label} className="flex items-center gap-3 p-4 border border-white/5 hover:border-white/15 transition-colors">
            <b.icon size={18} strokeWidth={1.5} className="text-white/50 shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide">{b.label}</p>
              <p className="text-xs text-white/30">{b.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
