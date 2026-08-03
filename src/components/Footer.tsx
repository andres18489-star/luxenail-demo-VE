import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { Sparkles, Instagram, Facebook, Heart, Send } from 'lucide-react';

export const Footer: React.FC = () => {
  const { showToast } = useBooking();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    showToast('¡Suscrito al Club VIP! Recibirás promociones y nuevas tendencias de arte ungueal.', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-zinc-950 text-zinc-300 pt-16 pb-12 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-400 to-amber-200 flex items-center justify-center text-zinc-950 font-bold shadow-md">
                <Sparkles className="w-5 h-5 text-zinc-900" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                LuxeNail<span className="text-rose-500 font-sans font-light"> VE</span>
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              El estudio de uñas y estética líder en Las Mercedes, Caracas. Especializados en manicura rusa e-file, extensiones de gel esculpido y diseños de tendencia mundial.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-zinc-900 hover:bg-rose-500 hover:text-white flex items-center justify-center text-zinc-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-zinc-900 hover:bg-rose-500 hover:text-white flex items-center justify-center text-zinc-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider">Explorar</h4>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <a href="#services" className="hover:text-rose-400 transition-colors">
                  Servicios y Precios BCV
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-rose-400 transition-colors">
                  Galeria de Diseños
                </a>
              </li>
              <li>
                <a href="#staff" className="hover:text-rose-400 transition-colors">
                  Especialistas Master
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-rose-400 transition-colors">
                  Ubicación Las Mercedes
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider">Estudio</h4>
            <p className="text-zinc-400">Av. Principal de Las Mercedes, Torre Financiera Caracas, Piso 2, Caracas 1080, Venezuela</p>
            <p className="text-zinc-400 font-bold text-emerald-400">WhatsApp: +58 412 9876543</p>
            <p className="text-zinc-400">contacto@luxenail.ve</p>
          </div>

          {/* VIP Newsletter */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider">Luxe Club VIP</h4>
            <p className="text-zinc-400">
              Suscríbete para recibir lanzamientos de temporada y acceso a cupos prioritarios.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Tu correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold transition-colors cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} LuxeNail Studio VE • Caracas, Venezuela. Todos los derechos reservados.</p>
          <div className="flex items-center gap-1 text-zinc-500">
            <span>Diseñado con</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>para Caracas</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
