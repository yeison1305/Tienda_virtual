export function Footer() {
  return (
    <footer className="py-12 px-4 md:px-8 lg:px-10 border-t border-white/5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
        <div>
          <span className="tracking-[0.4em] text-sm font-black uppercase block mb-4">VOID</span>
          <p className="text-xs text-white/30 leading-relaxed">Drop culture. Piezas con propósito.</p>
        </div>
        {[
          { title: "Categorías", items: ["Jeans", "Camisetas", "Chaquetas", "Hoodies"] },
          { title: "Ayuda", items: ["Envíos", "Devoluciones", "Tallas"] },
          { title: "Síguenos", items: ["Instagram", "TikTok", "Facebook"] },
        ].map((col) => (
          <div key={col.title}>
            <p className="text-xs tracking-widest uppercase text-white/20 mb-4">{col.title}</p>
            <ul className="space-y-2">
              {col.items.map((item) => (
                <li key={item} className="text-xs text-white/40 hover:text-white cursor-pointer transition-colors">{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-white/15">© 2025 VOID</p>
        <div className="flex gap-4 text-xs text-white/15 flex-wrap justify-center">
          <span>Visa</span><span>Mastercard</span><span>PSE</span><span>Nequi</span>
        </div>
      </div>
    </footer>
  );
}
