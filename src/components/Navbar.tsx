import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { Sparkles, Calendar, ShieldCheck, Menu, X, LogOut, LayoutDashboard, RefreshCw } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    openBookingModal, 
    isAdminLoggedIn, 
    logoutAdmin, 
    setActiveAdminTab, 
    bcvRate, 
    isBcvLoading, 
    refreshBcvRate 
  } = useBooking();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Función helper para scroll suave y cierre de menú móvil
  const handleScrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Manejador centralizado para ir al área de Admin
  const handleAdminClick = () => {
    if (isAdminLoggedIn) {
      setActiveAdminTab('appointments');
    }
    handleScrollTo('admin-panel');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-amber-50/95 backdrop-blur-md shadow-sm border-b border-rose-100/60 py-3'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-rose-400 to-amber-300 flex items-center justify-center shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 group-hover:text-rose-700 transition-colors">
                LuxeNail<span className="text-rose-500 font-sans font-light">.</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-500 text-white tracking-widest uppercase shadow-sm">
                VE
              </span>
            </div>
            <span className="text-[10px] tracking-widest uppercase text-zinc-500 font-medium -mt-0.5">
              Studio • Caracas, Las Mercedes
            </span>
          </div>
        </a>

        {/* BCV Exchange Rate Badge Ticker */}
        <div
          onClick={() => refreshBcvRate()}
          title="Tasa oficial de cambio según Banco Central de Venezuela. Haz clic para actualizar."
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-900 text-xs font-semibold shadow-sm transition-all cursor-pointer group"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Tasa BCV Hoy:</span>
          <strong className="font-serif text-sm text-emerald-950 font-bold">{bcvRate.toFixed(2)} Bs/$</strong>
          <RefreshCw className={`w-3 h-3 text-emerald-600 group-hover:rotate-180 transition-transform duration-500 ${isBcvLoading ? 'animate-spin' : ''}`} />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-zinc-700">
          <button onClick={() => handleScrollTo('services')} className="hover:text-rose-600 transition-colors cursor-pointer">
            Servicios & Precios
          </button>
          <button onClick={() => handleScrollTo('gallery')} className="hover:text-rose-600 transition-colors cursor-pointer">
            Galería
          </button>
          <button onClick={() => handleScrollTo('staff')} className="hover:text-rose-600 transition-colors cursor-pointer">
            Especialistas
          </button>
          <button onClick={() => handleScrollTo('contact')} className="hover:text-rose-600 transition-colors cursor-pointer">
            Ubicación
          </button>
        </nav>

        {/* Action Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {isAdminLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleAdminClick}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-zinc-900 text-amber-200 hover:bg-zinc-800 transition-all cursor-pointer shadow-sm"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-rose-400" />
                Panel Admin
              </button>
              <button
                onClick={logoutAdmin}
                title="Cerrar Sesión Admin"
                className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-rose-100/50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdminClick}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-rose-100/40 rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-200"
              title="Acceso para personal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
              Admin
            </button>
          )}

          <button
            onClick={() => openBookingModal()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 text-white font-medium text-sm shadow-md shadow-rose-300/50 hover:shadow-lg hover:shadow-rose-300/80 hover:from-rose-600 hover:to-rose-700 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <Calendar className="w-4 h-4" />
            Reservar Cita
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-900">
            <span>BCV:</span>
            <span>{bcvRate.toFixed(2)} Bs</span>
          </div>

          <button
            onClick={() => openBookingModal()}
            className="px-3 py-1.5 rounded-full bg-rose-500 text-white font-medium text-xs shadow-sm shadow-rose-300 cursor-pointer"
          >
            Reservar
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-700 hover:bg-rose-100/50 rounded-xl transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-lg border-b border-rose-100 px-6 py-6 space-y-4 shadow-xl">
          <button onClick={() => handleScrollTo('services')} className="block w-full text-left py-2 font-medium text-zinc-800 hover:text-rose-600">
            Servicios & Precios
          </button>
          <button onClick={() => handleScrollTo('gallery')} className="block w-full text-left py-2 font-medium text-zinc-800 hover:text-rose-600">
            Galería de Diseños
          </button>
          <button onClick={() => handleScrollTo('staff')} className="block w-full text-left py-2 font-medium text-zinc-800 hover:text-rose-600">
            Especialistas
          </button>
          <button onClick={() => handleScrollTo('contact')} className="block w-full text-left py-2 font-medium text-zinc-800 hover:text-rose-600">
            Ubicación & Contacto
          </button>

          <div className="pt-4 border-t border-rose-100 flex flex-col gap-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
              <span>Tasa oficial BCV hoy:</span>
              <strong className="font-serif text-sm font-bold">{bcvRate.toFixed(2)} Bs/$</strong>
            </div>

            {isAdminLoggedIn ? (
              <button
                onClick={handleAdminClick}
                className="w-full py-2.5 rounded-xl bg-zinc-900 text-amber-200 text-center font-medium text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-rose-400" />
                Ir al Panel Admin
              </button>
            ) : (
              <button
                onClick={handleAdminClick}
                className="w-full py-2 rounded-xl border border-zinc-200 text-zinc-600 text-center text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                Acceso Administrador
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openBookingModal();
              }}
              className="w-full py-3 rounded-full bg-rose-500 text-white font-medium text-sm shadow-md text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Reservar Cita por WhatsApp
            </button>
          </div>
        </div>
      )}
    </header>
  );
};