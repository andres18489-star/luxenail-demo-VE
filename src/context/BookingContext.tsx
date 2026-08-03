import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Service,
  Specialist,
  PortfolioItem,
  Appointment,
  BookingFormData,
} from '../types';

// Unificado y limpio:
import {
  saveServiceToSupabase,
  updateServiceInSupabase,
  saveSpecialistToSupabase,
  updateSpecialistInSupabase,
  savePortfolioItemToSupabase,
  saveAppointmentToSupabase,
  fetchAppointmentsFromSupabase,
  updateAppointmentStatusInSupabase,
  deleteRecordFromSupabase,
  isSupabaseConfigured,
  fetchServicesFromSupabase,
  fetchSpecialistsFromSupabase,
  fetchPortfolioFromSupabase
} from '../lib/supabase';

import { fetchBcvRate, BcvRateResponse, formatBs, calculateBs } from '../services/bcvService';
import { syncMockDataToSupabase } from '../services/seedService';

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
  isLoadingData: boolean;
  selectedService: Service | null;
  setSelectedService: (service: Service | null) => void;
  selectedSpecialist: Specialist | null;
  setSelectedSpecialist: (specialist: Specialist | null) => void;
  isBookingModalOpen: boolean;
  openBookingModal: (service?: Service | null, specialist?: Specialist | null) => void;
  closeBookingModal: () => void;
  currentAppointment: Appointment | null;
  setCurrentAppointment: (app: Appointment | null) => void;
  
  bcvInfo: BcvRateResponse;
  bcvRate: number;
  isBcvLoading: boolean;
  refreshBcvRate: () => Promise<void>;
  formatBsAmount: (amountInUsd: number) => string;

  createAppointment: (formData: BookingFormData) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;

  addService: (newService: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: string, updatedData: Partial<Service>) => Promise<void>;
  toggleServiceActive: (id: string) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  addSpecialist: (newSpec: Omit<Specialist, 'id'>) => Promise<void>;
  updateSpecialist: (id: string, updatedData: Partial<Specialist>) => Promise<void>;
  toggleSpecialistActive: (id: string) => Promise<void>;
  deleteSpecialist: (id: string) => Promise<void>;

  addPortfolioItem: (newItem: Omit<PortfolioItem, 'id'>) => Promise<void>;
  deletePortfolioItem: (id: string) => Promise<void>;

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
  const [bcvInfo, setBcvInfo] = useState<BcvRateResponse>({
    rate: 68.50,
    lastUpdated: 'Cargando...',
    isFallback: false,
    source: 'BCV Oficial',
  });
  const [isBcvLoading, setIsBcvLoading] = useState<boolean>(true);

  const [services, setServices] = useState<Service[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

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

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

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
    const interval = setInterval(refreshBcvRate, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshBcvRate]);

  const formatBsAmount = useCallback((amountInUsd: number) => {
    return formatBs(amountInUsd, bcvInfo.rate);
  }, [bcvInfo.rate]);

  useEffect(() => {
    const initSupabaseData = async () => {
      if (!isSupabaseActive) {
        setIsLoadingData(false);
        return;
      }
      
      try {
        setIsLoadingData(true);
        await syncMockDataToSupabase();

        const [appRes, servRes, specRes, portRes] = await Promise.all([
          fetchAppointmentsFromSupabase(),
          fetchServicesFromSupabase(),
          fetchSpecialistsFromSupabase(),
          fetchPortfolioFromSupabase()
        ]);

        if (appRes.data) setAppointments(appRes.data);
        if (servRes.data) setServices(servRes.data);
        if (specRes.data) setSpecialists(specRes.data);
        if (portRes.data) setPortfolio(portRes.data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        showToast("Error de conexión con la base de datos", "error");
      } finally {
        setIsLoadingData(false);
      }
    };

    initSupabaseData();
  }, [isSupabaseActive, showToast]);

  const openBookingModal = (service?: Service | null, specialist?: Specialist | null) => {
    if (service) setSelectedService(service);
    if (specialist) setSelectedSpecialist(specialist);
    setIsBookingModalOpen(true);
  };
  const closeBookingModal = () => setIsBookingModalOpen(false);

  // --- APPOINTMENTS ---
  const createAppointment = async (formData: BookingFormData): Promise<Appointment> => {
    const serviceObj = services.find((s) => s.id === formData.serviceId) || services[0];
    const specialistObj = specialists.find((sp) => sp.id === formData.specialistId) || specialists[0];

    const refNumber = Math.floor(1000 + Math.random() * 9000);
    const newAppointment: Appointment = {
      id: `app-${Date.now()}`,
      referenceCode: `LXN-${refNumber}`,
      serviceId: serviceObj.id,
      serviceName: serviceObj.name,
      servicePrice: serviceObj.price,
      bcvRateUsed: bcvInfo.rate,
      amountBs: calculateBs(serviceObj.price, bcvInfo.rate),
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
      if (error) {
        showToast('Error al guardar cita', 'error');
        throw error;
      }
      if (data) {
        setAppointments((prev) => [data, ...prev]);
        setCurrentAppointment(data);
        showToast('Cita guardada correctamente');
        return data;
      }
    }

    setAppointments((prev) => [newAppointment, ...prev]);
    setCurrentAppointment(newAppointment);
    showToast(`¡Cita agendada con éxito!`);
    return newAppointment;
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    if (isSupabaseActive) await updateAppointmentStatusInSupabase(id, status);
    setAppointments((prev) => prev.map((app) => (app.id === id ? { ...app, status } : app)));
    showToast(`Estado actualizado a: ${status}`);
  };

  const deleteAppointment = async (id: string) => {
    if (isSupabaseActive) await deleteRecordFromSupabase('appointments', id);
    setAppointments((prev) => prev.filter((app) => app.id !== id));
    showToast('Cita eliminada', 'info');
  };

  // --- SERVICES CRUD ---
  const addService = async (newService: Omit<Service, 'id'>) => {
    if (isSupabaseActive) {
      const { data, error } = await saveServiceToSupabase(newService);
      if (error || !data) return showToast('Error al crear servicio', 'error');
      setServices((prev) => [data as Service, ...prev]);
    } else {
      setServices((prev) => [{ ...newService, id: `srv-${Date.now()}` } as Service, ...prev]);
    }
    showToast(`Servicio "${newService.name}" creado`);
  };

  const updateService = async (id: string, updatedData: Partial<Service>) => {
    if (isSupabaseActive) await updateServiceInSupabase(id, updatedData);
    setServices((prev) => prev.map((srv) => srv.id === id ? { ...srv, ...updatedData } : srv));
    showToast('Servicio actualizado');
  };

  const toggleServiceActive = async (id: string) => {
    const service = services.find(s => s.id === id);
    if (!service) return;
    const nextActive = !service.isActive;
    if (isSupabaseActive) await updateServiceInSupabase(id, { isActive: nextActive });
    
    setServices((prev) => prev.map((srv) => srv.id === id ? { ...srv, isActive: nextActive } : srv));
    showToast(`Servicio ${nextActive ? 'activado' : 'pausado'}`, 'info');
  };

  const deleteService = async (id: string) => {
    if (isSupabaseActive) await deleteRecordFromSupabase('services', id);
    setServices((prev) => prev.filter((s) => s.id !== id));
    showToast('Servicio eliminado', 'info');
  };

  // --- SPECIALISTS CRUD ---
  const addSpecialist = async (newSpec: Omit<Specialist, 'id'>) => {
    if (isSupabaseActive) {
      const { data, error } = await saveSpecialistToSupabase(newSpec);
      if (error || !data) return showToast('Error al crear especialista', 'error');
      setSpecialists((prev) => [...prev, data as Specialist]);
    } else {
      setSpecialists((prev) => [...prev, { ...newSpec, id: `spec-${Date.now()}` } as Specialist]);
    }
    showToast(`Especialista "${newSpec.name}" agregada`);
  };

  const updateSpecialist = async (id: string, updatedData: Partial<Specialist>) => {
    if (isSupabaseActive) await updateSpecialistInSupabase(id, updatedData);
    setSpecialists((prev) => prev.map((spec) => spec.id === id ? { ...spec, ...updatedData } : spec));
    showToast('Especialista actualizada');
  };

  const toggleSpecialistActive = async (id: string) => {
    const spec = specialists.find(s => s.id === id);
    if (!spec) return;
    const nextActive = !spec.isActive;
    if (isSupabaseActive) await updateSpecialistInSupabase(id, { isActive: nextActive });

    setSpecialists((prev) => prev.map((sp) => sp.id === id ? { ...sp, isActive: nextActive } : sp));
    showToast(`Especialista ${nextActive ? 'Activa' : 'Pausada'}`, 'info');
  };

  const deleteSpecialist = async (id: string) => {
    if (isSupabaseActive) await deleteRecordFromSupabase('specialists', id);
    setSpecialists((prev) => prev.filter((sp) => sp.id !== id));
    showToast('Especialista eliminada', 'info');
  };

  // --- PORTFOLIO CRUD ---
  const addPortfolioItem = async (newItem: Omit<PortfolioItem, 'id'>) => {
    if (isSupabaseActive) {
      const { data, error } = await savePortfolioItemToSupabase(newItem);
      if (error || !data) return showToast('Error al agregar foto', 'error');
      setPortfolio((prev) => [data as PortfolioItem, ...prev]);
    } else {
      setPortfolio((prev) => [{ ...newItem, id: `gal-${Date.now()}` } as PortfolioItem, ...prev]);
    }
    showToast('Foto agregada a la galería');
  };

  const deletePortfolioItem = async (id: string) => {
    if (isSupabaseActive) await deleteRecordFromSupabase('portfolio_items', id);
    setPortfolio((prev) => prev.filter((item) => item.id !== id));
    showToast('Foto eliminada', 'info');
  };

  // --- ADMIN AUTH ---
  const loginAdmin = (password: string): boolean => {
    if (password === 'admin123' || password === 'admin') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('luxenail_admin_auth', 'true');
      setIsAdminModalOpen(false);
      showToast('Acceso concedido');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('luxenail_admin_auth');
    showToast('Sesión cerrada', 'info');
  };

  const openAdminModal = () => setIsAdminModalOpen(true);
  const closeAdminModal = () => setIsAdminModalOpen(false);

  return (
    <BookingContext.Provider
      value={{
        services, specialists, appointments, portfolio, isLoadingData,
        selectedService, setSelectedService, selectedSpecialist, setSelectedSpecialist,
        isBookingModalOpen, openBookingModal, closeBookingModal, currentAppointment, setCurrentAppointment,
        bcvInfo, bcvRate: bcvInfo.rate, isBcvLoading, refreshBcvRate, formatBsAmount,
        createAppointment, updateAppointmentStatus, deleteAppointment,
        addService, updateService, toggleServiceActive, deleteService,
        addSpecialist, updateSpecialist, toggleSpecialistActive, deleteSpecialist,
        addPortfolioItem, deletePortfolioItem,
        isAdminLoggedIn, loginAdmin, logoutAdmin, isAdminModalOpen, openAdminModal, closeAdminModal,
        activeAdminTab, setActiveAdminTab, toast, showToast, isSupabaseActive,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking debe usarse dentro de un BookingProvider');
  return context;
};