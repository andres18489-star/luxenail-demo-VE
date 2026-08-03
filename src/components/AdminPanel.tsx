import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { AppointmentStatus, Service, Specialist, PortfolioItem, ServiceCategory } from '../types';
import {
  Calendar,
  Sparkles,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus,
  Search,
  ShieldCheck,
  Database,
  LogOut,
  Edit2,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Image as ImageIcon,
  UserPlus,
  Phone,
  Briefcase,
  X
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    isAdminLoggedIn,
    openAdminModal,
    logoutAdmin,
    appointments,
    updateAppointmentStatus,
    deleteAppointment,
    services,
    addService,
    updateService,
    toggleServiceActive,
    deleteService,
    specialists,
    addSpecialist,
    updateSpecialist,
    toggleSpecialistActive,
    deleteSpecialist,
    portfolio,
    addPortfolioItem,
    deletePortfolioItem,
    activeAdminTab,
    setActiveAdminTab,
    isSupabaseActive,
    bcvRate,
    formatBsAmount,
  } = useBooking();

  const [statusFilter, setStatusFilter] = useState<'All' | AppointmentStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Service Edit State
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [srvName, setSrvName] = useState('');
  const [srvCategory, setSrvCategory] = useState<ServiceCategory>('Manicura');
  const [srvPrice, setSrvPrice] = useState<number>(25);
  const [srvDuration, setSrvDuration] = useState<number>(60);
  const [srvDesc, setSrvDesc] = useState('');
  const [srvPopular, setSrvPopular] = useState(false);
  const [srvImage, setSrvImage] = useState('');

  // Specialist Modal / Edit State
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [editingSpecId, setEditingSpecId] = useState<string | null>(null);
  const [specName, setSpecName] = useState('');
  const [specRole, setSpecRole] = useState('');
  const [specPhone, setSpecPhone] = useState('');
  const [specSpecialty, setSpecSpecialty] = useState('');
  const [specAvatar, setSpecAvatar] = useState('');
  const [specBio, setSpecBio] = useState('');

  // Portfolio Form State
  const [portTitle, setPortTitle] = useState('');
  const [portCategory, setPortCategory] = useState('Manicura');
  const [portArtist, setPortArtist] = useState('');
  const [portImageUrl, setPortImageUrl] = useState('');

  if (!isAdminLoggedIn) {
    return (
      <section id="admin-panel" className="py-16 bg-zinc-900 text-white border-t border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-rose-400 flex items-center justify-center mx-auto border border-zinc-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="font-serif font-bold text-2xl">LuxeNail Studio VE • Panel de Gestión Administrativa</h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Acceso exclusivo para el personal. Inicia sesión para administrar citas, catálogo de servicios, personal y galería del portafolio.
          </p>
          <button
            onClick={openAdminModal}
            className="px-6 py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
          >
            Iniciar Sesión como Administrador
          </button>
        </div>
      </section>
    );
  }

  // Dashboard Stats
  const totalBookings = appointments.length;
  const pendingCount = appointments.filter((a) => a.status === 'Pendiente' || a.status === 'Pending').length;
  const confirmedCount = appointments.filter((a) => a.status === 'Confirmada' || a.status === 'Confirmed').length;
  const totalEstimatedRevenueUsd = appointments
    .filter((a) => a.status !== 'Cancelada' && a.status !== 'Cancelled')
    .reduce((sum, a) => sum + a.servicePrice, 0);

  // Filter Appointments
  const filteredAppointments = appointments.filter((app) => {
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesSearch =
      app.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Handle Service Submit (Create or Update)
  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName.trim() || !srvDesc.trim()) return;

    const imageUrlValue = srvImage.trim() || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800';

    if (editingServiceId) {
      updateService(editingServiceId, {
        name: srvName,
        category: srvCategory,
        price: Number(srvPrice),
        durationMinutes: Number(srvDuration),
        description: srvDesc,
        popular: srvPopular,
        imageUrl: imageUrlValue,
        image: imageUrlValue,
      });
      setEditingServiceId(null);
    } else {
      addService({
        name: srvName,
        category: srvCategory,
        price: Number(srvPrice),
        durationMinutes: Number(srvDuration),
        description: srvDesc,
        popular: srvPopular,
        isActive: true,
        imageUrl: imageUrlValue,
        image: imageUrlValue,
      });
    }

    // Reset Form
    setSrvName('');
    setSrvDesc('');
    setSrvPrice(25);
    setSrvDuration(60);
    setSrvPopular(false);
    setSrvImage('');
  };

  const startEditService = (service: Service) => {
    setEditingServiceId(service.id);
    setSrvName(service.name);
    setSrvCategory(service.category as ServiceCategory);
    setSrvPrice(service.price);
    setSrvDuration(service.durationMinutes || service.duration || 60);
    setSrvDesc(service.description);
    setSrvPopular(Boolean(service.popular));
    setSrvImage(service.imageUrl || service.image || '');
  };

  const cancelEditService = () => {
    setEditingServiceId(null);
    setSrvName('');
    setSrvDesc('');
    setSrvPrice(25);
    setSrvDuration(60);
    setSrvPopular(false);
    setSrvImage('');
  };

  // Handle Specialist Submit
  const handleSpecSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!specName.trim()) return;

    const avatarValue = specAvatar.trim() || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400';

    if (editingSpecId) {
      updateSpecialist(editingSpecId, {
        name: specName,
        role: specRole,
        title: specRole,
        phone: specPhone,
        specialty: specSpecialty,
        avatarUrl: avatarValue,
        photo: avatarValue,
        bio: specBio,
      });
    } else {
      addSpecialist({
        name: specName,
        role: specRole || 'Master Nail Artist',
        title: specRole || 'Master Nail Artist',
        phone: specPhone || '+58 412 9876543',
        specialty: specSpecialty || 'Estructura & Manicura Rusa',
        avatarUrl: avatarValue,
        photo: avatarValue,
        bio: specBio || 'Especialista certificada comprometida con la excelencia y salud de la uña.',
        isActive: true,
      });
    }

    closeSpecModal();
  };

  const openAddSpecModal = () => {
    setEditingSpecId(null);
    setSpecName('');
    setSpecRole('Master Nail Specialist');
    setSpecPhone('+58 412 9876543');
    setSpecSpecialty('Manicura Rusa & Acrílico');
    setSpecAvatar('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400');
    setSpecBio('Especialista certificada internacionalmente.');
    setIsSpecModalOpen(true);
  };

  const openEditSpecModal = (sp: Specialist) => {
    setEditingSpecId(sp.id);
    setSpecName(sp.name);
    setSpecRole(sp.role || sp.title || '');
    setSpecPhone(sp.phone || '');
    setSpecSpecialty(sp.specialty || '');
    setSpecAvatar(sp.avatarUrl || sp.photo || '');
    setSpecBio(sp.bio || '');
    setIsSpecModalOpen(true);
  };

  const closeSpecModal = () => {
    setIsSpecModalOpen(false);
    setEditingSpecId(null);
  };

  // Handle Portfolio Submit
  const handlePortfolioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portTitle.trim() || !portImageUrl.trim()) return;

    addPortfolioItem({
      title: portTitle,
      category: portCategory,
      artist: portArtist || 'Valeria Mendoza',
      imageUrl: portImageUrl,
      image: portImageUrl,
      likes: Math.floor(Math.random() * 50) + 10,
    });

    setPortTitle('');
    setPortCategory('Manicura');
    setPortArtist('');
    setPortImageUrl('');
  };

  return (
    <section id="admin-panel" className="py-16 bg-zinc-950 text-zinc-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="font-serif font-bold text-2xl text-white">Panel de Control Administrativo & Motor CRUD</h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Administrador Activo • LuxeNail Studio VE (Las Mercedes, Caracas)
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Database Status */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
              <Database className={`w-3.5 h-3.5 ${isSupabaseActive ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span>
                Base de Datos: <strong>{isSupabaseActive ? 'Supabase Conectado' : 'Modo Local Clean Fallback'}</strong>
              </span>
            </div>

            <button
              onClick={logoutAdmin}
              className="px-3.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total de Citas</p>
              <p className="font-serif font-bold text-3xl text-white mt-1">{totalBookings}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Ingresos Estimados</p>
              <p className="font-serif font-bold text-3xl text-amber-300 mt-1">${totalEstimatedRevenueUsd.toFixed(2)} USD</p>
              <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">≈ {formatBsAmount(totalEstimatedRevenueUsd)}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Citas Pendientes</p>
              <p className="font-serif font-bold text-3xl text-rose-400 mt-1">{pendingCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Citas Confirmadas</p>
              <p className="font-serif font-bold text-3xl text-emerald-400 mt-1">{confirmedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 4 Interactive Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveAdminTab('appointments')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeAdminTab === 'appointments'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Gestión de Citas ({appointments.length})
          </button>

          <button
            onClick={() => setActiveAdminTab('services')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeAdminTab === 'services'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Catálogo de Servicios ({services.length})
          </button>

          <button
            onClick={() => setActiveAdminTab('specialists')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeAdminTab === 'specialists'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Personal y Especialistas ({specialists.length})
          </button>

          <button
            onClick={() => setActiveAdminTab('portfolio')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeAdminTab === 'portfolio'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Galería del Portafolio ({portfolio.length})
          </button>
        </div>

        {/* =========================================================================
            TAB 1: APPOINTMENTS
           ========================================================================= */}
        {activeAdminTab === 'appointments' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, código o servicio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {(['All', 'Pendiente', 'Confirmada', 'Completada', 'Cancelada'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                      statusFilter === st
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {st === 'All' ? 'Todos los Estados' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950/80 uppercase text-[10px] tracking-wider text-zinc-500 border-b border-zinc-800">
                    <tr>
                      <th className="p-4">Cód Ref</th>
                      <th className="p-4">Datos del Cliente</th>
                      <th className="p-4">Tratamiento & Especialista</th>
                      <th className="p-4">Fecha y Hora</th>
                      <th className="p-4">Precio (USD / Bs)</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-zinc-500">
                          No se encontraron citas que coincidan con los filtros.
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((app) => (
                        <tr key={app.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="p-4 font-mono font-bold text-rose-400">{app.referenceCode}</td>
                          <td className="p-4">
                            <p className="font-bold text-white text-sm">{app.customerName}</p>
                            <p className="text-zinc-400 text-[11px]">{app.customerEmail}</p>
                            <p className="text-emerald-400 text-[11px] font-semibold">{app.customerPhone}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-zinc-200">{app.serviceName}</p>
                            <p className="text-rose-300/80 text-[11px]">Artista: {app.specialistName}</p>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <p className="font-medium text-zinc-200">{app.date}</p>
                            <p className="text-zinc-400 text-[11px]">{app.time}</p>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span className="font-serif font-bold text-amber-300 block">${app.servicePrice.toFixed(2)} USD</span>
                            <span className="text-[11px] font-bold text-emerald-400 block">≈ {formatBsAmount(app.servicePrice)}</span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                app.status === 'Confirmada' || app.status === 'Confirmed'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : app.status === 'Pendiente' || app.status === 'Pending'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : app.status === 'Completada' || app.status === 'Completed'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                              }`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {app.status !== 'Confirmada' && app.status !== 'Confirmed' && (
                                <button
                                  onClick={() => updateAppointmentStatus(app.id, 'Confirmada')}
                                  title="Confirmar Cita"
                                  className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 transition-colors cursor-pointer"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              )}
                              {app.status !== 'Cancelada' && app.status !== 'Cancelled' && (
                                <button
                                  onClick={() => updateAppointmentStatus(app.id, 'Cancelada')}
                                  title="Cancelar Cita"
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors cursor-pointer"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteAppointment(app.id)}
                                title="Eliminar Registro"
                                className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-400 border border-rose-800/60 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: SERVICES CATALOG
           ========================================================================= */}
        {activeAdminTab === 'services' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form to Create/Edit Service */}
            <div className="bg-zinc-900/90 p-6 rounded-2xl border border-zinc-800 space-y-4 self-start">
              <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-400" />
                {editingServiceId ? 'Editar Servicio' : 'Agregar Nuevo Servicio'}
              </h3>
              <p className="text-xs text-zinc-400">
                Configura precios en USD (se convierten a Bs. en tiempo real con tasa BCV), fotos Unsplash y categoría.
              </p>

              <form onSubmit={handleServiceSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">Nombre del Servicio</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Uñas Esculpidas en Acrílico"
                    value={srvName}
                    onChange={(e) => setSrvName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">Categoría</label>
                    <select
                      value={srvCategory}
                      onChange={(e) => setSrvCategory(e.target.value as ServiceCategory)}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="Manicura">Manicura</option>
                      <option value="Extensiones">Extensiones</option>
                      <option value="Pedicura">Pedicura</option>
                      <option value="Arte & Diseños">Arte & Diseños</option>
                      <option value="Lashes & Brows">Lashes & Brows</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">Precio ($ USD)</label>
                    <input
                      type="number"
                      required
                      min={5}
                      value={srvPrice}
                      onChange={(e) => setSrvPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">Duración (Minutos)</label>
                  <input
                    type="number"
                    required
                    step={15}
                    value={srvDuration}
                    onChange={(e) => setSrvDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">URL de Imagen (Unsplash)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={srvImage}
                    onChange={(e) => setSrvImage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">Descripción</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Detalles y beneficios del tratamiento..."
                    value={srvDesc}
                    onChange={(e) => setSrvDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="popular-check"
                    checked={srvPopular}
                    onChange={(e) => setSrvPopular(e.target.checked)}
                    className="w-4 h-4 rounded accent-rose-500"
                  />
                  <label htmlFor="popular-check" className="text-xs text-zinc-300 font-medium cursor-pointer">
                    Destacar en sección "Tratamientos Populares"
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    {editingServiceId ? 'Guardar Cambios' : 'Publicar Servicio'}
                  </button>

                  {editingServiceId && (
                    <button
                      type="button"
                      onClick={cancelEditService}
                      className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Right Column: Existing Services List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-serif font-bold text-lg text-white">Catálogo de Servicios ({services.length})</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      srv.isActive
                        ? 'bg-zinc-900/90 border-zinc-800'
                        : 'bg-zinc-950/60 border-zinc-900 opacity-60'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="relative h-32 rounded-xl overflow-hidden bg-zinc-950">
                        <img
                          src={srv.imageUrl || srv.image || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800'}
                          alt={srv.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md text-[10px] font-bold text-rose-300 border border-rose-500/30">
                          {srv.category}
                        </span>
                        {!srv.isActive && (
                          <span className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-amber-500/90 text-zinc-950 text-[10px] font-bold">
                            Pausado
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-white">{srv.name}</h4>
                          <div className="text-right shrink-0">
                            <span className="font-serif font-bold text-rose-400 text-base block">${srv.price.toFixed(2)} USD</span>
                            <span className="text-[10px] font-bold text-emerald-400 block">≈ {formatBsAmount(srv.price)}</span>
                          </div>
                        </div>
                        <p className="text-zinc-400 text-xs line-clamp-2 mt-1">{srv.description}</p>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                      <span className="text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {srv.durationMinutes || srv.duration || 60} min
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleServiceActive(srv.id)}
                          title={srv.isActive ? 'Pausar Servicio' : 'Activar Servicio'}
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                        >
                          {srv.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>

                        <button
                          onClick={() => startEditService(srv)}
                          title="Editar Servicio"
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => deleteService(srv.id)}
                          title="Eliminar Servicio"
                          className="p-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: STAFF & SPECIALISTS
           ========================================================================= */}
        {activeAdminTab === 'specialists' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-xl text-white">Equipo de Especialistas ({specialists.length})</h3>
                <p className="text-xs text-zinc-400">Gestiona perfiles, roles y disponibilidad del personal.</p>
              </div>

              <button
                onClick={openAddSpecModal}
                className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-lg"
              >
                <UserPlus className="w-4 h-4" />
                Agregar Especialista
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specialists.map((sp) => (
                <div
                  key={sp.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    sp.isActive
                      ? 'bg-zinc-900/90 border-zinc-800'
                      : 'bg-zinc-950/60 border-zinc-900 opacity-60'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={sp.avatarUrl || sp.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'}
                        alt={sp.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-rose-400/40"
                      />
                      <div>
                        <h4 className="font-bold text-base text-white">{sp.name}</h4>
                        <p className="text-xs text-rose-300 font-medium">{sp.role || sp.title}</p>
                        <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3 text-zinc-500" />
                          {sp.phone || '+58 412 9876543'}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
                      {sp.bio || 'Especialista en LuxeNail Studio VE.'}
                    </p>

                    <div className="text-[11px] text-zinc-400 space-y-1">
                      <p><strong>Especialidad:</strong> {sp.specialty || 'General Beauty'}</p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-zinc-800 flex items-center justify-between">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        sp.isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {sp.isActive ? 'Personal Activo' : 'Pausado / Turno Libre'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSpecialistActive(sp.id)}
                        title={sp.isActive ? 'Desactivar Especialista' : 'Activar Especialista'}
                        className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                      >
                        {sp.isActive ? <UserX className="w-4 h-4 text-amber-400" /> : <UserCheck className="w-4 h-4 text-emerald-400" />}
                      </button>

                      <button
                        onClick={() => openEditSpecModal(sp)}
                        title="Editar Perfil"
                        className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteSpecialist(sp.id)}
                        title="Eliminar Especialista"
                        className="p-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Specialist Modal */}
            {isSpecModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-lg w-full space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <h4 className="font-serif font-bold text-lg text-white">
                      {editingSpecId ? 'Editar Perfil de Especialista' : 'Agregar Nueva Especialista'}
                    </h4>
                    <button onClick={closeSpecModal} className="text-zinc-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSpecSubmit} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">Nombre y Apellido</label>
                      <input
                        type="text"
                        required
                        value={specName}
                        onChange={(e) => setSpecName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">Cargo / Rol</label>
                        <input
                          type="text"
                          required
                          value={specRole}
                          onChange={(e) => setSpecRole(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">Teléfono WhatsApp</label>
                        <input
                          type="text"
                          value={specPhone}
                          onChange={(e) => setSpecPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">Especialidad</label>
                      <input
                        type="text"
                        value={specSpecialty}
                        onChange={(e) => setSpecSpecialty(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">URL de Foto de Perfil</label>
                      <input
                        type="url"
                        value={specAvatar}
                        onChange={(e) => setSpecAvatar(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">Biografía / Perfil</label>
                      <textarea
                        rows={3}
                        value={specBio}
                        onChange={(e) => setSpecBio(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider"
                      >
                        Guardar Perfil
                      </button>
                      <button
                        type="button"
                        onClick={closeSpecModal}
                        className="px-4 py-3 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 4: PORTFOLIO GALLERY
           ========================================================================= */}
        {activeAdminTab === 'portfolio' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Add Portfolio Photo */}
            <div className="bg-zinc-900/90 p-6 rounded-2xl border border-zinc-800 space-y-4 self-start">
              <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-rose-400" />
                Agregar Foto al Portafolio
              </h3>
              <p className="text-xs text-zinc-400">Publica imágenes de trabajos realizados para exhibirlos a las clientas.</p>

              <form onSubmit={handlePortfolioSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">Título del Trabajo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Glazed Chrome & Perlas"
                    value={portTitle}
                    onChange={(e) => setPortTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">Categoría</label>
                    <select
                      value={portCategory}
                      onChange={(e) => setPortCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                    >
                      <option value="Manicura">Manicura</option>
                      <option value="Extensiones">Extensiones</option>
                      <option value="Pedicura">Pedicura</option>
                      <option value="Arte & Diseños">Arte & Diseños</option>
                      <option value="Lashes & Brows">Lashes & Brows</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">Nombre de la Artista</label>
                    <input
                      type="text"
                      placeholder="Valeria Mendoza"
                      value={portArtist}
                      onChange={(e) => setPortArtist(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">URL de Imagen Unsplash</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                    value={portImageUrl}
                    onChange={(e) => setPortImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Publicar Foto
                </button>
              </form>
            </div>

            {/* Right: Portfolio Grid */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-serif font-bold text-lg text-white">Galería de Trabajos ({portfolio.length})</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {portfolio.map((item) => (
                  <div key={item.id} className="group relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
                    <img
                      src={item.imageUrl || item.image || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800'}
                      alt={item.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-3 bg-zinc-900/90 border-t border-zinc-800">
                      <p className="font-bold text-xs text-white truncate">{item.title}</p>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                        <span>{item.category}</span>
                        <button
                          onClick={() => deletePortfolioItem(item.id)}
                          className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                          title="Eliminar Foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
