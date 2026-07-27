import { REVIEWS } from "../../data";
import { StarRow } from "../shared/StarRow";

export function Reviews() {
  return (
    <section className="py-20 px-4 md:px-8 lg:px-10 bg-[#0F0F0F]">
      <h2 className="text-3xl md:text-4xl font-black uppercase mb-10">Reviews</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REVIEWS.map((r) => (
          <div key={r.name} className="p-6 border border-white/5 hover:border-white/10 transition-colors">
            <StarRow />
            <p className="text-sm leading-relaxed mt-4 mb-6 text-white/60">&ldquo;{r.text}&rdquo;</p>
            <div className="flex items-center gap-3">
              <img src={r.img} alt={r.name} className="w-8 h-8 rounded-full object-cover opacity-60" />
              <div>
                <p className="text-xs font-bold uppercase">{r.name}</p>
                <p className="text-xs text-white/30">{r.product}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
