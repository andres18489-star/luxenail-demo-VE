import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Service,
  Specialist,
  PortfolioItem,
  Appointment,
  BookingFormData,
} from '../types';
import {
  initialServices,
  initialSpecialists,
  initialPortfolio,
  initialAppointments,
} from '../data/mockData';
import {
  saveAppointmentToSupabase,
  fetchAppointmentsFromSupabase,
  updateAppointmentStatusInSupabase,
  deleteRecordFromSupabase,
  isSupabaseConfigured,
} from '../lib/supabase';
import { fetchBcvRate, BcvRateResponse, formatBs, calculateBs } from '../services/bcvService';

interface Toast {
  message: string;
  type: 'success' | 'info' | 'error';
}

export type AdminTab = 'appointments' | 'services' | 'specialists' | 'portfolio';

interface BookingContextType {
  services: Service[];
  specialists: Specialist[];
  appointments: Appointment[];
  portfolio: PortfolioItem[];
  selectedService: Service | null;
  setSelectedService: (service: Service | null) => void;
  selectedSpecialist: Specialist | null;
  setSelectedSpecialist: (specialist: Specialist | null) => void;
  isBookingModalOpen: boolean;
  openBookingModal: (service?: Service | null, specialist?: Specialist | null) => void;
  closeBookingModal: () => void;
  currentAppointment: Appointment | null;
  setCurrentAppointment: (app: Appointment | null) => void;
  
  // BCV Exchange Rate State
  bcvInfo: BcvRateResponse;
  bcvRate: number;
  isBcvLoading: boolean;
  refreshBcvRate: () => Promise<void>;
  formatBsAmount: (amountInUsd: number) => string;

  // Appointments CRUD
  createAppointment: (formData: BookingFormData) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;

  // Services CRUD
  addService: (newService: Omit<Service, 'id'>) => void;
  updateService: (id: string, updatedData: Partial<Service>) => void;
  toggleServiceActive: (id: string) => void;
  deleteService: (id: string) => void;

  // Specialists CRUD
  addSpecialist: (newSpec: Omit<Specialist, 'id'>) => void;
  updateSpecialist: (id: string, updatedData: Partial<Specialist>) => void;
  toggleSpecialistActive: (id: string) => void;
  deleteSpecialist: (id: string) => void;

  // Portfolio CRUD
  addPortfolioItem: (newItem: Omit<PortfolioItem, 'id'>) => void;
  deletePortfolioItem: (id: string) => void;

  isAdminLoggedIn: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  isAdminModalOpen: boolean;
  openAdminModal: () => void;
  closeAdminModal: () => void;
  activeAdminTab: AdminTab;
  setActiveAdminTab: (tab: AdminTab) => void;
  toast: Toast | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  isSupabaseActive: boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // BCV State
  const [bcvInfo, setBcvInfo] = useState<BcvRateResponse>({
    rate: 68.50,
    lastUpdated: 'Cargando...',
    isFallback: false,
    source: 'BCV Oficial',
  });
  const [isBcvLoading, setIsBcvLoading] = useState<boolean>(true);

  // Services State
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('luxenail_services');
    return saved ? JSON.parse(saved) : initialServices;
  });

  // Specialists State
  const [specialists, setSpecialists] = useState<Specialist[]>(() => {
    const saved = localStorage.getItem('luxenail_specialists');
    return saved ? JSON.parse(saved) : initialSpecialists;
  });

  // Portfolio State
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(() => {
    const saved = localStorage.getItem('luxenail_portfolio');
    return saved ? JSON.parse(saved) : initialPortfolio;
  });

  // Appointments State
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('luxenail_appointments');
    return saved ? JSON.parse(saved) : initialAppointments;
  });

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('luxenail_admin_auth') === 'true';
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('appointments');

  const [toast, setToast] = useState<Toast | null>(null);
  const isSupabaseActive = isSupabaseConfigured();

  // Load BCV Rate on mount
  const refreshBcvRate = useCallback(async () => {
    setIsBcvLoading(true);
    try {
      const rateData = await fetchBcvRate();
      setBcvInfo(rateData);
    } catch (err) {
      console.error('Error al actualizar tasa BCV:', err);
    } finally {
      setIsBcvLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBcvRate();
    // Refresh BCV rate every 15 minutes
    const interval = setInterval(refreshBcvRate, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshBcvRate]);

  // Format Helper
  const formatBsAmount = useCallback((amountInUsd: number) => {
    return formatBs(amountInUsd, bcvInfo.rate);
  }, [bcvInfo.rate]);

  // Load appointments from Supabase if configured
  useEffect(() => {
    if (isSupabaseActive) {
      fetchAppointmentsFromSupabase().then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setAppointments(data);
        }
      });
    }
  }, [isSupabaseActive]);

  // Persist state arrays to localStorage
  useEffect(() => {
    localStorage.setItem('luxenail_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('luxenail_specialists', JSON.stringify(specialists));
  }, [specialists]);

  useEffect(() => {
    localStorage.setItem('luxenail_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem('luxenail_appointments', JSON.stringify(appointments));
  }, [appointments]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const openBookingModal = (service?: Service | null, specialist?: Specialist | null) => {
    if (service) setSelectedService(service);
    if (specialist) setSelectedSpecialist(specialist);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  // APPOINTMENT CRUD
  const createAppointment = async (formData: BookingFormData): Promise<Appointment> => {
    const serviceObj = services.find((s) => s.id === formData.serviceId) || services[0];
    const specialistObj = specialists.find((sp) => sp.id === formData.specialistId) || specialists[0];

    const refNumber = Math.floor(1000 + Math.random() * 9000);
    const priceUsd = serviceObj.price;
    const currentRate = bcvInfo.rate;
    const calculatedBs = calculateBs(priceUsd, currentRate);

    const newAppointment: Appointment = {
      id: `app-${Date.now()}`,
      referenceCode: `LXN-${refNumber}`,
      serviceId: serviceObj.id,
      serviceName: serviceObj.name,
      servicePrice: priceUsd,
      bcvRateUsed: currentRate,
      amountBs: calculatedBs,
      specialistId: specialistObj.id,
      specialistName: specialistObj.name,
      date: formData.date,
      time: formData.time,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      notes: formData.notes,
      status: 'Pendiente',
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseActive) {
      const { data, error } = await saveAppointmentToSupabase(newAppointment);
      if (!error && data) {
        setAppointments((prev) => [data, ...prev]);
        setCurrentAppointment(data);
        showToast('Cita guardada en Supabase correctamente');
        return data;
      }
    }

    setAppointments((prev) => [newAppointment, ...prev]);
    setCurrentAppointment(newAppointment);
    showToast(`¡Cita ${newAppointment.referenceCode} agendada con éxito!`);
    return newAppointment;
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    if (isSupabaseActive) {
      await updateAppointmentStatusInSupabase(id, status);
    }
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status } : app))
    );
    showToast(`Estado de cita actualizado a: ${status}`);
  };

  const deleteAppointment = async (id: string) => {
    if (isSupabaseActive) {
      await deleteRecordFromSupabase('appointments', id);
    }
    setAppointments((prev) => prev.filter((app) => app.id !== id));
    showToast('Cita eliminada', 'info');
  };

  // SERVICES CRUD
  const addService = (newService: Omit<Service, 'id'>) => {
    const serviceWithId: Service = {
      ...newService,
      id: `srv-${Date.now()}`,
      isActive: newService.isActive ?? true,
      durationMinutes: newService.durationMinutes ?? newService.duration ?? 60,
      duration: newService.durationMinutes ?? newService.duration ?? 60,
      rating: newService.rating ?? 5.0,
      reviewsCount: newService.reviewsCount ?? 1,
      imageUrl: newService.imageUrl || newService.image || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800',
      image: newService.image || newService.imageUrl || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800',
    };
    setServices((prev) => [serviceWithId, ...prev]);
    showToast(`Servicio "${newService.name}" creado con éxito`);
  };

  const updateService = (id: string, updatedData: Partial<Service>) => {
    setServices((prev) =>
      prev.map((srv) => {
        if (srv.id === id) {
          const updated = { ...srv, ...updatedData };
          if (updatedData.durationMinutes !== undefined) {
            updated.duration = updatedData.durationMinutes;
          }
          if (updatedData.imageUrl) {
            updated.image = updatedData.imageUrl;
          } else if (updatedData.image) {
            updated.imageUrl = updatedData.image;
          }
          return updated;
        }
        return srv;
      })
    );
    showToast('Servicio actualizado con éxito');
  };

  const toggleServiceActive = (id: string) => {
    setServices((prev) =>
      prev.map((srv) => {
        if (srv.id === id) {
          const nextActive = !srv.isActive;
          showToast(`Servicio ${nextActive ? 'activado' : 'pausado'}`, 'info');
          return { ...srv, isActive: nextActive };
        }
        return srv;
      })
    );
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    showToast('Servicio eliminado', 'info');
  };

  // SPECIALISTS CRUD
  const addSpecialist = (newSpec: Omit<Specialist, 'id'>) => {
    const specWithId: Specialist = {
      ...newSpec,
      id: `spec-${Date.now()}`,
      isActive: newSpec.isActive ?? true,
      role: newSpec.role || newSpec.title || 'Especialista en Belleza',
      title: newSpec.title || newSpec.role || 'Especialista en Belleza',
      avatarUrl: newSpec.avatarUrl || newSpec.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      photo: newSpec.photo || newSpec.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      rating: newSpec.rating ?? 5.0,
      reviewsCount: newSpec.reviewsCount ?? 1,
      availableDays: newSpec.availableDays || ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    };
    setSpecialists((prev) => [...prev, specWithId]);
    showToast(`Especialista "${newSpec.name}" agregada con éxito`);
  };

  const updateSpecialist = (id: string, updatedData: Partial<Specialist>) => {
    setSpecialists((prev) =>
      prev.map((spec) => {
        if (spec.id === id) {
          const updated = { ...spec, ...updatedData };
          if (updatedData.role) updated.title = updatedData.role;
          if (updatedData.title) updated.role = updatedData.title;
          if (updatedData.avatarUrl) updated.photo = updatedData.avatarUrl;
          if (updatedData.photo) updated.avatarUrl = updatedData.photo;
          return updated;
        }
        return spec;
      })
    );
    showToast('Especialista actualizada con éxito');
  };

  const toggleSpecialistActive = (id: string) => {
    setSpecialists((prev) =>
      prev.map((spec) => {
        if (spec.id === id) {
          const nextActive = !spec.isActive;
          showToast(`Especialista estado: ${nextActive ? 'Activa' : 'Pausada'}`, 'info');
          return { ...spec, isActive: nextActive };
        }
        return spec;
      })
    );
  };

  const deleteSpecialist = (id: string) => {
    setSpecialists((prev) => prev.filter((sp) => sp.id !== id));
    showToast('Especialista eliminada', 'info');
  };

  // PORTFOLIO CRUD
  const addPortfolioItem = (newItem: Omit<PortfolioItem, 'id'>) => {
    const itemWithId: PortfolioItem = {
      ...newItem,
      id: `gal-${Date.now()}`,
      likes: newItem.likes ?? 0,
      image: newItem.image || newItem.imageUrl,
      imageUrl: newItem.imageUrl || newItem.image || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800',
    };
    setPortfolio((prev) => [itemWithId, ...prev]);
    showToast('Foto agregada a la galería');
  };

  const deletePortfolioItem = (id: string) => {
    setPortfolio((prev) => prev.filter((item) => item.id !== id));
    showToast('Foto eliminada de la galería', 'info');
  };

  // ADMIN AUTH
  const loginAdmin = (password: string): boolean => {
    if (password === 'admin123' || password === 'admin') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('luxenail_admin_auth', 'true');
      setIsAdminModalOpen(false);
      showToast('Acceso concedido como Administrador');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('luxenail_admin_auth');
    showToast('Sesión de administración cerrada', 'info');
  };

  const openAdminModal = () => setIsAdminModalOpen(true);
  const closeAdminModal = () => setIsAdminModalOpen(false);

  return (
    <BookingContext.Provider
      value={{
        services,
        specialists,
        appointments,
        portfolio,
        selectedService,
        setSelectedService,
        selectedSpecialist,
        setSelectedSpecialist,
        isBookingModalOpen,
        openBookingModal,
        closeBookingModal,
        currentAppointment,
        setCurrentAppointment,
        bcvInfo,
        bcvRate: bcvInfo.rate,
        isBcvLoading,
        refreshBcvRate,
        formatBsAmount,
        createAppointment,
        updateAppointmentStatus,
        deleteAppointment,
        addService,
        updateService,
        toggleServiceActive,
        deleteService,
        addSpecialist,
        updateSpecialist,
        toggleSpecialistActive,
        deleteSpecialist,
        addPortfolioItem,
        deletePortfolioItem,
        isAdminLoggedIn,
        loginAdmin,
        logoutAdmin,
        isAdminModalOpen,
        openAdminModal,
        closeAdminModal,
        activeAdminTab,
        setActiveAdminTab,
        toast,
        showToast,
        isSupabaseActive,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking debe usarse dentro de un BookingProvider');
  }
  return context;
};
