import { Instagram } from "lucide-react";
import { INSPO_IMGS } from "../../data";

export function InspirationGrid() {
  return (
    <section className="py-20 px-4 md:px-8 lg:px-10">
      <h2 className="text-3xl md:text-4xl font-black uppercase mb-10">Inspiración</h2>
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-2 space-y-2">
        {INSPO_IMGS.map((im, i) => (
          <div key={i} className="break-inside-avoid overflow-hidden group cursor-pointer relative bg-white/5">
            <img src={im.src} alt={`Inspo ${i + 1}`}
              className="w-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Instagram size={20} className="text-white" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
