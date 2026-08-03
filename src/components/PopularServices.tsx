import React from 'react';
import { useBooking } from '../context/BookingContext';
import { Clock, Star, ArrowUpRight, Flame } from 'lucide-react';
import { Service } from '../types';

export const PopularServices: React.FC = () => {
  const { services, openBookingModal, formatBsAmount } = useBooking();

  const popularServices = services
    .filter((s) => s.popular && s.isActive !== false)
    .slice(0, 4);

  return (
    <section className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold tracking-wide uppercase">
              <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              Favoritos de Nuestras Clientas
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900">
              Tratamientos Más Populares
            </h2>
            <p className="text-zinc-600 text-base max-w-xl">
              Servicios de belleza y salud ungueal diseñados para máxima durabilidad, estética impecable y relajación total.
            </p>
          </div>

          <a
            href="#services"
            className="inline-flex items-center gap-2 text-rose-600 font-semibold text-sm hover:text-rose-700 transition-colors group cursor-pointer"
          >
            Ver Menú Completo de Servicios
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularServices.map((service: Service) => (
            <div
              key={service.id}
              className="group bg-rose-50/30 rounded-3xl p-4 border border-rose-100/80 hover:border-rose-300/80 hover:shadow-xl hover:shadow-rose-100/60 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image & Badge */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-4 bg-zinc-100 border border-rose-100/50">
                  <img
                    src={service.imageUrl || service.image || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800'}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-zinc-800 shadow-sm">
                    {service.category}
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-900/80 backdrop-blur-md text-white text-xs font-medium">
                    <Clock className="w-3 h-3 text-amber-300" />
                    {service.durationMinutes || service.duration} min
                  </div>
                </div>

                {/* Rating & Title */}
                <div className="flex items-center gap-1 text-xs text-amber-600 font-medium mb-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{service.rating || 5.0}</span>
                  <span className="text-zinc-400">({service.reviewsCount || 1} opiniones)</span>
                </div>

                <h3 className="font-serif font-bold text-lg text-zinc-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                  {service.name}
                </h3>

                <p className="text-xs text-zinc-600 mt-2 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Price & Book CTA */}
              <div className="pt-4 mt-4 border-t border-rose-100/80 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif font-bold text-xl text-zinc-900">${service.price.toFixed(2)}</span>
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold">USD</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold block">
                    ≈ {formatBsAmount(service.price)}
                  </span>
                </div>

                <button
                  onClick={() => openBookingModal(service)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500 text-white font-medium text-xs hover:bg-rose-600 active:scale-95 transition-all shadow-sm shadow-rose-200 cursor-pointer"
                >
                  Reservar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
