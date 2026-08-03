import { useState } from 'react';
import { X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterOptions {
  sizes: string[];
  colors: { value: string; label: string }[];
  priceRange: { min: number; max: number };
}

interface FilterState {
  sizes: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
  sort: string;
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  options: FilterOptions;
  filters: FilterState;
  onChange: (filters: Partial<FilterState>) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Más nuevos' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name_asc', label: 'Nombre: A-Z' },
  { value: 'name_desc', label: 'Nombre: Z-A' },
];

const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

export function FilterSidebar({ 
  isOpen, 
  onClose, 
  options, 
  filters, 
  onChange, 
  onClear, 
  hasActiveFilters 
}: FilterSidebarProps) {
  const [expanded, setExpanded] = useState({ size: true, color: true, price: true, sort: true });

  const toggleSize = (size: string) => {
    onChange({ 
      sizes: filters.sizes.includes(size) 
        ? filters.sizes.filter(s => s !== size) 
        : [...filters.sizes, size] 
    });
  };

  const toggleColor = (color: string) => {
    onChange({ 
      colors: filters.colors.includes(color) 
        ? filters.colors.filter(c => c !== color) 
        : [...filters.colors, color] 
    });
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose} 
          aria-hidden="true"
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0a0a0a] border-r border-white/5 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="complementary"
        aria-label="Filtros"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <h2 className="text-lg font-bold uppercase tracking-wider">Filtros</h2>
            <button 
              onClick={onClose} 
              className="lg:hidden p-2 text-white/40 hover:text-white transition-colors"
              aria-label="Cerrar filtros"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {hasActiveFilters && (
              <button 
                onClick={onClear}
                className="w-full text-left text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
              >
                <X size={12} />
                Limpiar todos los filtros
              </button>
            )}

            {/* Tallas */}
            <fieldset className="space-y-3">
              <legend className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(s => ({ ...s, size: !s.size }))}>
                <span className="text-xs tracking-widest uppercase text-white/40">Tallas</span>
                <span className={expanded.size ? 'rotate-180' : ''}><ChevronDown size={14} className="text-white/40 transition-transform" /></span>
              </legend>
              {expanded.size && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {options.sizes.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        filters.sizes.includes(size)
                          ? 'bg-white text-black border-white'
                          : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </fieldset>

            {/* Colores */}
            <fieldset className="space-y-3">
              <legend className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(s => ({ ...s, color: !s.color }))}>
                <span className="text-xs tracking-widest uppercase text-white/40">Colores</span>
                <span className={expanded.color ? 'rotate-180' : ''}><ChevronDown size={14} className="text-white/40 transition-transform" /></span>
              </legend>
              {expanded.color && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {options.colors.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => toggleColor(c.value)}
                      className={`relative w-8 h-8 rounded-full border-2 transition-all ${
                        filters.colors.includes(c.value)
                          ? 'border-white scale-110'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      style={{ background: c.value }}
                      aria-pressed={filters.colors.includes(c.value)}
                      aria-label={c.label}
                    >
                      {filters.colors.includes(c.value) && (
                        <span className="absolute inset-0 flex items-center justify-center text-white text-[10px]">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </fieldset>

            {/* Precio */}
            <fieldset className="space-y-3">
              <legend className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(s => ({ ...s, price: !s.price }))}>
                <span className="text-xs tracking-widest uppercase text-white/40">Precio</span>
                <span className={expanded.price ? 'rotate-180' : ''}><ChevronDown size={14} className="text-white/40 transition-transform" /></span>
              </legend>
              {expanded.price && (
                <div className="space-y-3 mt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Mín</label>
                      <input
                        type="number"
                        value={filters.minPrice || ''}
                        onChange={e => onChange({ minPrice: parseInt(e.target.value) || options.priceRange.min })}
                        className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg"
                        placeholder={fmt(options.priceRange.min)}
                        min={options.priceRange.min}
                        max={options.priceRange.max}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Máx</label>
                      <input
                        type="number"
                        value={filters.maxPrice || ''}
                        onChange={e => onChange({ maxPrice: parseInt(e.target.value) || options.priceRange.max })}
                        className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg"
                        placeholder={fmt(options.priceRange.max)}
                        min={options.priceRange.min}
                        max={options.priceRange.max}
                      />
                    </div>
                  </div>
                </div>
              )}
            </fieldset>

            {/* Ordenar */}
            <fieldset className="space-y-3">
              <legend className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(s => ({ ...s, sort: !s.sort }))}>
                <span className="text-xs tracking-widest uppercase text-white/40">Ordenar</span>
                <span className={expanded.sort ? 'rotate-180' : ''}><ChevronDown size={14} className="text-white/40 transition-transform" /></span>
              </legend>
              {expanded.sort && (
                <select
                  value={filters.sort}
                  onChange={e => onChange({ sort: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 rounded-lg appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              )}
            </fieldset>
          </div>

          <div className="p-4 border-t border-white/5 lg:hidden">
            <button 
              onClick={onClose}
              className="w-full bg-white/5 text-white py-3 text-xs tracking-[0.15em] uppercase font-bold hover:bg-white/10 transition-colors rounded-lg"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}