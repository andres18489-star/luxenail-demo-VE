import React from 'react';
import { useBooking } from '../context/BookingContext';
import { Star, Sparkles, Calendar, ArrowRight, ShieldCheck, Heart, Award, Coffee, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export const Hero: React.FC = () => {
  const { openBookingModal, bcvRate, formatBsAmount, isBcvLoading, refreshBcvRate } = useBooking();

  return (
    <section className="relative pt-28 sm:pt-36 pb-20 md:pb-28 overflow-hidden bg-gradient-to-b from-rose-100/60 via-amber-50/40 to-white">
      {/* Decorative background glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-rose-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Rating & Social Proof Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2 px-4 py-2 rounded-full bg-white/90 shadow-sm border border-rose-200/60 text-xs sm:text-sm font-medium text-zinc-800"
            >
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold text-zinc-900">4.98</span>
              </div>
              <span className="text-zinc-300">|</span>
              <span className="text-zinc-700 font-medium">Más de 850+ Clientas Felices en Caracas</span>
              <Sparkles className="w-3.5 h-3.5 text-rose-500 ml-0.5" />
            </motion.div>

            {/* Live BCV Banner Ticker */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 text-xs font-medium"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>Tasa Oficial BCV del Día:</span>
              <strong className="font-serif text-sm font-bold text-emerald-900">{bcvRate.toFixed(2)} Bs/$</strong>
              <button
                onClick={() => refreshBcvRate()}
                className="text-emerald-700 hover:text-emerald-900 ml-1 p-0.5 rounded cursor-pointer"
                title="Actualizar tasa"
              >
                <RefreshCw className={`w-3 h-3 ${isBcvLoading ? 'animate-spin' : ''}`} />
              </button>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 tracking-tight leading-[1.15]"
            >
              Elegancia, Arte y Salud para tus Uñas en{' '}
              <span className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 bg-clip-text text-transparent italic">
                Caracas
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              Tu estudio boutique en Las Mercedes. Especialistas en Manicura Rusa e-file, Nivelación Kapping, Soft Gel, Acrílico Esculpido y Pedicura SPA con atención VIP en un ambiente de total relajación.
            </motion.p>

            {/* Call to Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <button
                onClick={() => openBookingModal()}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium text-base shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2.5"
              >
                <Calendar className="w-5 h-5" />
                Reservar Cita por WhatsApp
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <a
                href="#services"
                className="w-full sm:w-auto px-7 py-4 rounded-full bg-white border border-rose-200/80 text-zinc-800 hover:bg-rose-50/50 font-medium text-base transition-colors cursor-pointer text-center"
              >
                Ver Catálogo & Precios
              </a>
            </motion.div>

            {/* Feature Highlights Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-3 gap-4 pt-6 border-t border-rose-200/50 max-w-xl mx-auto lg:mx-0"
            >
              <div className="flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-rose-700">
                  <ShieldCheck className="w-4 h-4 text-rose-500" />
                  100% Esterilizado
                </div>
                <span className="text-xs text-zinc-500 mt-1">Autoclave Médico</span>
              </div>

              <div className="flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-rose-700">
                  <Heart className="w-4 h-4 text-rose-500" />
                  Salud Ungueal
                </div>
                <span className="text-xs text-zinc-500 mt-1">Geles Hipoalergénicos</span>
              </div>

              <div className="flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-rose-700">
                  <Award className="w-4 h-4 text-rose-500" />
                  Master Artists
                </div>
                <span className="text-xs text-zinc-500 mt-1">Certificación Rusa</span>
              </div>
            </motion.div>
          </div>

          {/* Right Image Collage Column */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* Main Image Frame */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] bg-rose-50"
              >
                <img
                  src="https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=900"
                  alt="Manicura Rusa LuxeNail Studio VE"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/50 via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-white/50 text-zinc-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Servicio Estrella</p>
                      <p className="font-serif font-bold text-sm">Manicura Rusa + Glazed Chrome</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-xs">$25 USD</span>
                      <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{formatBsAmount(25)}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Secondary Floating Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute -bottom-6 -left-6 z-20 p-4 rounded-2xl bg-white shadow-xl border border-rose-100 flex items-center gap-3.5 max-w-[250px]"
              >
                <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Bebidas VIP de Cortesía</p>
                  <p className="text-[11px] text-zinc-500 leading-tight">Café expreso, té aromático o copa de espumante con tu servicio.</p>
                </div>
              </motion.div>

              {/* Decorative Accent Ring */}
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full border-2 border-dashed border-rose-300/60 -z-10 animate-spin-slow" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
