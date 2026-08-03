import React from 'react';
import { useBooking } from '../context/BookingContext';
import { Specialist } from '../types';
import { Star, Award, Calendar, Sparkles } from 'lucide-react';

export const StaffSection: React.FC = () => {
  const { specialists, openBookingModal } = useBooking();

  // Filter out 'First Available' and inactive/off-duty staff for the main team showcase grid
  const teamMembers = specialists.filter((s) => s.id !== 'spec-any' && s.isActive !== false);

  return (
    <section id="staff" className="py-20 bg-amber-50/20 border-t border-rose-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold tracking-wide uppercase">
            <Award className="w-3.5 h-3.5 text-rose-500" />
            Especialistas Certificadas
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900">
            Nuestras Master Technicians
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base">
            Profesionales certificadas internacionalmente dedicadas al cuidado de la uña natural, esterilización rigurosa y acabado impecable.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((artist: Specialist) => (
            <div
              key={artist.id}
              className="bg-white rounded-3xl p-5 border border-rose-100 hover:border-rose-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Photo Frame */}
                <div className="relative rounded-2xl overflow-hidden aspect-[3/4] mb-4 bg-zinc-100 border border-rose-100/50">
                  <img
                    src={artist.avatarUrl || artist.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-amber-600 text-xs font-bold shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {artist.rating || 5.0}
                  </div>
                </div>

                {/* Details */}
                <h3 className="font-serif font-bold text-xl text-zinc-900 group-hover:text-rose-600 transition-colors">
                  {artist.name}
                </h3>

                <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mt-0.5">
                  {artist.role || artist.title}
                </p>

                <p className="text-xs text-zinc-700 font-medium mt-2 bg-rose-50/70 p-2 rounded-xl">
                  <strong>Especialidad:</strong> {artist.specialty}
                </p>

                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                  {artist.bio}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-rose-50">
                <button
                  onClick={() => openBookingModal(null, artist)}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-rose-600 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5 text-rose-300" />
                  Reservar con {artist.name.split(' ')[0]}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Any Available Specialist Banner */}
        <div className="mt-12 p-6 rounded-3xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-200 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-lg">¿Buscas un horario o fecha específica?</h4>
              <p className="text-rose-100 text-xs sm:text-sm">
                Selecciona "Cualquier Especialista Disponible" al reservar para consultar inmediatamente todas las horas libres del equipo.
              </p>
            </div>
          </div>

          <button
            onClick={() => openBookingModal(null, specialists[0])}
            className="px-6 py-3 rounded-full bg-white text-zinc-900 font-bold text-xs uppercase tracking-wider hover:bg-amber-100 transition-colors shrink-0 shadow-md cursor-pointer"
          >
            Ver Horarios Disponibles
          </button>
        </div>
      </div>
    </section>
  );
};
