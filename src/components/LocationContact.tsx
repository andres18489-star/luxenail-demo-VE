import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Sparkles,
  Send,
  Coffee,
  ShieldCheck,
  CreditCard,
  Building,
  ExternalLink
} from 'lucide-react';

export const LocationContact: React.FC = () => {
  const { showToast, bcvRate, formatBsAmount } = useBooking();
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim()) return;
    showToast('¡Consulta enviada! Te responderemos por WhatsApp o correo a la brevedad.');
    setInquiryName('');
    setInquiryEmail('');
    setInquiryMessage('');
  };

  const STUDIO_ADDRESS = "Av. Principal de Las Mercedes, Torre Financiera Caracas, Piso 2, Caracas 1080, Venezuela";

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold tracking-wide uppercase">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            Ubicación VIP en Caracas
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900">
            Visita LuxeNail Studio VE
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base">
            Ubicados en el corazón financiero de Las Mercedes, Caracas. Contamos con estacionamiento privado con vigilancia, seguridad VIP y servicio de atención personalizada.
          </p>
        </div>

        {/* NOTA DE PAGO EN SALÓN (REQUISITO 3) */}
        <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-zinc-900 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Nota de Pago en Salón
              </div>
              <h3 className="font-serif text-2xl font-bold text-amber-100">
                Pago Presencial al Finalizar tu Servicio
              </h3>
              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                Para tu máxima comodidad, el pago se efectúa directamente en el estudio al terminar la atención. Aceptamos múltiples modalidades a la <strong>Tasa Oficial del Banco Central de Venezuela (BCV)</strong>:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                  <span className="text-xs font-bold block text-emerald-300">💵 Efectivo USD</span>
                  <span className="text-[10px] text-zinc-300">Billetes en buen estado</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                  <span className="text-xs font-bold block text-emerald-300">📲 Pago Móvil</span>
                  <span className="text-[10px] text-zinc-300">A tasa oficial BCV</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                  <span className="text-xs font-bold block text-emerald-300">💳 Punto de Venta</span>
                  <span className="text-[10px] text-zinc-300">Débito y Crédito</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                  <span className="text-xs font-bold block text-emerald-300">⚡ Zelle</span>
                  <span className="text-[10px] text-zinc-300">Aprobación inmediata</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-center lg:text-right shrink-0 w-full lg:w-auto">
              <span className="text-xs text-emerald-300 block font-semibold">Tasa Oficial BCV Aplicada:</span>
              <span className="font-serif text-3xl font-extrabold text-white block my-1">{bcvRate.toFixed(2)} Bs/$</span>
              <span className="text-[11px] text-emerald-400 font-medium block">Ejemplo: $25 USD = {formatBsAmount(25)}</span>
            </div>
          </div>
        </div>

        {/* Amenities Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <Coffee className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-sm text-zinc-900">Barra de Cortesía</h4>
            <p className="text-xs text-zinc-500">Espreso italiano, té de rosas y copa de espumante</p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-sm text-zinc-900">Esterilización Rusa</h4>
            <p className="text-xs text-zinc-500">Empaque individual con indicador químico de grado médico</p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-sm text-zinc-900">Instalaciones VIP</h4>
            <p className="text-xs text-zinc-500">Sillones spa ergonómicos y ambiente privado climatizado</p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-sm text-zinc-900">Estacionamiento</h4>
            <p className="text-xs text-zinc-500">Valet parking y vigilancia privada en Torre Financiera</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Hours & Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-amber-50/40 p-6 rounded-3xl border border-rose-100 space-y-4">
              <h3 className="font-serif font-bold text-xl text-zinc-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose-500" />
                Horarios de Atención
              </h3>

              <div className="space-y-3 text-sm divide-y divide-rose-100">
                <div className="flex justify-between items-center pt-2">
                  <span className="font-medium text-zinc-700">Lunes a Viernes</span>
                  <span className="font-serif font-bold text-rose-600">9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-medium text-zinc-700">Sábados</span>
                  <span className="font-serif font-bold text-rose-600">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-medium text-zinc-700">Domingos</span>
                  <span className="text-xs font-semibold text-zinc-400 uppercase">Solo Citas Privadas</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm text-zinc-700 bg-white p-6 rounded-3xl border border-rose-100">
              <h3 className="font-serif font-bold text-lg text-zinc-900 mb-2">Contacto & Dirección</h3>
              <p className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-1" />
                <span>{STUDIO_ADDRESS}</span>
              </p>
              <p className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-rose-500 shrink-0" />
                <a href="https://wa.me/584129876543" target="_blank" rel="noopener noreferrer" className="hover:text-rose-600 font-bold text-emerald-700">
                  WhatsApp: +58 412 9876543
                </a>
              </p>
              <p className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-rose-500 shrink-0" />
                <a href="mailto:contacto@luxenail.ve" className="hover:text-rose-600 font-medium">
                  contacto@luxenail.ve
                </a>
              </p>
            </div>
          </div>

          {/* Right Column: Google Maps & Contact Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Google Maps Embed / Simulation Container */}
            <div className="relative rounded-3xl overflow-hidden aspect-[16/9] bg-zinc-900 border border-rose-100 shadow-md group">
              <iframe
                title="Ubicación LuxeNail Studio VE en Caracas"
                src="https://maps.google.com/maps?q=Las%20Mercedes%20Caracas%20Venezuela&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full grayscale opacity-85 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
              />

              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl flex items-center justify-between text-zinc-900 border border-white/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm">LuxeNail Studio Las Mercedes</h4>
                    <p className="text-xs text-zinc-500">Torre Financiera Caracas, Piso 2</p>
                  </div>
                </div>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(STUDIO_ADDRESS)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 text-amber-200 text-xs font-bold hover:bg-rose-600 hover:text-white transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <span>Cómo Llegar</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Quick Inquiry Form */}
            <div className="bg-rose-50/40 p-6 rounded-3xl border border-rose-100 space-y-4">
              <h3 className="font-serif font-bold text-lg text-zinc-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" />
                Atención Corporativa o Paquetes de Novias
              </h3>

              <form onSubmit={handleInquirySubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Tu Nombre y Apellido"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-white border border-rose-200 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Correo o Teléfono WhatsApp"
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-white border border-rose-200 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>

                <textarea
                  rows={2}
                  required
                  placeholder="Escribe tu mensaje o consulta personalizada..."
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-rose-200 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                />

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-zinc-900 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar Consulta
                </button>
              </form>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
