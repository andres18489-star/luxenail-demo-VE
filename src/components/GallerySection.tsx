import React, { useState } from 'react';
import { PortfolioItem } from '../types';
import { useBooking } from '../context/BookingContext';
import { Sparkles, Heart, Eye, X, Calendar, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const GALL_CATEGORIES = ['Todos', 'Manicura', 'Extensiones', 'Pedicura', 'Arte & Diseños', 'Lashes & Brows'];

export const GallerySection: React.FC = () => {
  const { portfolio, openBookingModal } = useBooking();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null);
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});

  const filteredItems = portfolio.filter(
    (item) => selectedCategory === 'Todos' || item.category === selectedCategory
  );

  const toggleLike = (id: string, currentLikes: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikesMap((prev) => ({
      ...prev,
      [id]: (prev[id] ?? currentLikes) + 1,
    }));
  };

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Portafolio & Diseños Reales
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900">
            Galería de Arte Ungueal
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base">
            Explora nuestros trabajos recientes: acabados en acrílico esculpido, arte a mano alzada, efecto aperlado Glazed Chrome, pedicuras rusas y miradas de impacto.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {GALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                  : 'bg-rose-50/50 text-zinc-600 hover:bg-rose-100 border border-rose-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const imgSrc = item.imageUrl || item.image || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800';
            const currentLikes = likesMap[item.id] ?? item.likes ?? 0;

            return (
              <div
                key={item.id}
                onClick={() => setActiveItem(item)}
                className="group relative rounded-3xl overflow-hidden aspect-square bg-zinc-100 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border border-rose-100/50"
              >
                <img
                  src={imgSrc}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6" />

                {/* Top Tag */}
                <div className="absolute top-4 left-4 z-10 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-zinc-900 shadow-sm">
                    {item.category}
                  </span>
                </div>

                {/* Bottom Content */}
                <div className="absolute bottom-4 left-4 right-4 z-10 text-white opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="font-serif font-bold text-lg leading-tight">{item.title}</p>
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20 text-xs text-rose-100">
                    <span className="flex items-center gap-1 font-medium">
                      <User className="w-3.5 h-3.5 text-rose-300" />
                      Por {item.artist || 'Valeria Mendoza'}
                    </span>

                    <button
                      onClick={(e) => toggleLike(item.id, item.likes ?? 0, e)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-colors cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                      <span className="font-bold text-xs">{currentLikes}</span>
                    </button>
                  </div>
                </div>

                {/* Quick View Icon */}
                <div className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl relative border border-rose-100"
            >
              <button
                onClick={() => setActiveItem(null)}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="aspect-square bg-zinc-100">
                  <img
                    src={activeItem.imageUrl || activeItem.image}
                    alt={activeItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider">
                      {activeItem.category}
                    </span>

                    <h3 className="font-serif font-bold text-2xl text-zinc-900 leading-tight">
                      {activeItem.title}
                    </h3>

                    <div className="space-y-1 text-xs text-zinc-600">
                      <p>
                        <strong>Artista:</strong> {activeItem.artist || 'Valeria Mendoza'}
                      </p>
                      <p>
                        <strong>Técnica:</strong> Manicura Rusa e-file, Estructura Nivelada y Acabado de Alta Precisión.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-500 pt-2">
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                      <span>Me gusta de <strong>{(likesMap[activeItem.id] ?? activeItem.likes ?? 0)}</strong> clientas</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-rose-100">
                    <button
                      onClick={() => {
                        setActiveItem(null);
                        openBookingModal();
                      }}
                      className="w-full py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      Reservar Estilo Similar
                    </button>

                    <button
                      onClick={() => setActiveItem(null)}
                      className="w-full py-2 text-xs text-zinc-500 hover:text-zinc-800 text-center font-medium cursor-pointer"
                    >
                      Cerrar Vista Previa
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
