import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { Search, Clock, Sparkles, Check, ChevronRight, Star } from 'lucide-react';

const CATEGORIES = [
  'Todos',
  'Manicura',
  'Extensiones',
  'Pedicura',
  'Arte & Diseños',
  'Lashes & Brows',
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800';

const normalizeText = (text: string) => {
  return (text || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

export const FullServices: React.FC = () => {
  const { services, openBookingModal, formatBsAmount } = useBooking();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const activeServices = services.filter((s) => s.isActive !== false);

  const filteredServices = activeServices.filter((service) => {
    // 1. Filtrado por Búsqueda Manual (Input de Texto)
    const normQuery = normalizeText(searchQuery);
    const matchesSearch =
      !normQuery ||
      normalizeText(service.name).includes(normQuery) ||
      normalizeText(service.description).includes(normQuery);

    if (!matchesSearch) return false;

    // 2. Filtrado por Categoría
    if (selectedCategory === 'Todos') return true;

    const normSelected = normalizeText(selectedCategory);
    const normServiceCat = normalizeText(service.category || (service as any).categoria || '');
    const normName = normalizeText(service.name);
    const normDesc = normalizeText(service.description);

    // Coincidencia directa de la categoría registrada
    const isDirectMatch =
      normServiceCat === normSelected ||
      normServiceCat.includes(normSelected) ||
      normSelected.includes(normServiceCat);

    if (isDirectMatch) return true;

    // Fallbacks inteligentes según el botón seleccionado en caso de que en la BD la categoría esté guardada con otro nombre
    if (normSelected.includes('manicura')) {
      return normName.includes('manicura') || normDesc.includes('manicura') || normName.includes('uñas') || normName.includes('gel');
    }
    if (normSelected.includes('pedicura')) {
      return normName.includes('pedicura') || normDesc.includes('pedicura') || normName.includes('pies');
    }
    if (normSelected.includes('extension') || normSelected.includes('extensi')) {
      return normName.includes('extension') || normName.includes('soft gel') || normName.includes('acrilico') || normName.includes('polygel');
    }
    if (normSelected.includes('arte') || normSelected.includes('diseno')) {
      return normName.includes('arte') || normName.includes('diseño') || normName.includes('nail art') || normDesc.includes('diseño');
    }
    if (normSelected.includes('lashes') || normSelected.includes('brows')) {
      return normName.includes('pestañ') || normName.includes('ceja') || normName.includes('lash') || normName.includes('brow');
    }

    return false;
  });

  return (
    <section id="services" className="py-20 bg-amber-50/30 border-y border-rose-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Catálogo Completo & Precios Transparentes
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900">
            Nuestros Servicios de Belleza & Salud
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base">
            Todos nuestros tratamientos incluyen manicura combinada e-file de precisión, hidratación profunda con aceites orgánicos y esmaltado en gel de alta resistencia.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-zinc-900 text-white shadow-md'
                    : 'bg-white text-zinc-600 hover:bg-rose-100/50 border border-rose-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar servicio (ej. Soft Gel)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-rose-200/80 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-400 text-zinc-800 placeholder-zinc-400 shadow-sm"
            />
          </div>
        </div>

        {/* List Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-rose-100">
            <p className="text-zinc-500 text-sm font-medium">No se encontraron servicios disponibles para este filtro.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todos');
              }}
              className="mt-3 text-xs font-semibold text-rose-600 underline cursor-pointer"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-3xl p-5 border border-rose-100 hover:border-rose-300/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative rounded-2xl overflow-hidden aspect-[16/9] mb-4 bg-zinc-100 border border-rose-100/60">
                    <img
                      src={service.imageUrl || service.image || FALLBACK_IMAGE}
                      alt={service.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute top-3 left-3 z-10">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                        {service.category || 'Servicio'}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                      {service.popular && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-200/80 shadow-sm">
                          ★ Destacado
                        </span>
                      )}
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900/85 backdrop-blur-md text-white text-xs font-medium shadow-sm">
                        <Clock className="w-3 h-3 text-amber-300" />
                        {service.durationMinutes || (service as any).duration || 60}m
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-serif font-bold text-xl text-zinc-900 group-hover:text-rose-600 transition-colors">
                      {service.name}
                    </h3>

                    <div className="text-right shrink-0">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="font-serif font-bold text-2xl text-zinc-900">${service.price.toFixed(2)}</span>
                        <span className="text-[10px] text-zinc-400 uppercase font-semibold">USD</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 block bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 mt-0.5">
                        ≈ {formatBsAmount(service.price)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                    {service.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 font-medium">
                    <span className="flex items-center gap-1 text-zinc-700 font-semibold bg-zinc-100 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      {service.durationMinutes || (service as any).duration || 60} minutos
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Garantía de Retención
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-rose-50 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <strong className="text-zinc-800 font-bold">{service.rating || 5.0}</strong>
                    <span className="text-zinc-400">({(service as any).reviewsCount || 1} opiniones)</span>
                  </div>

                  <button
                    onClick={() => openBookingModal(service)}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-rose-600 text-white font-medium text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    Seleccionar & Reservar
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};