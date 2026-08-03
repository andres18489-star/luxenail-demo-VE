export type ServiceCategory =
  | 'Manicura'
  | 'Extensiones'
  | 'Pedicura'
  | 'Arte & Diseños'
  | 'Lashes & Brows';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number; // Price in USD
  durationMinutes: number;
  category: ServiceCategory | string;
  imageUrl?: string;
  image?: string; // alias for imageUrl
  isActive: boolean;
  popular?: boolean;
  rating?: number;
  reviewsCount?: number;
  duration?: number; // legacy duration alias
}

export interface Specialist {
  id: string;
  name: string;
  role: string;
  phone?: string;
  avatarUrl?: string;
  photo?: string; // alias for avatarUrl
  isActive: boolean;
  title?: string; // alias for role
  specialty?: string;
  rating?: number;
  reviewsCount?: number;
  bio?: string;
  availableDays?: string[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  imageUrl: string;
  image?: string; // alias for imageUrl
  category: string;
  artist?: string;
  likes?: number;
}

export type GalleryItem = PortfolioItem;

export type AppointmentStatus = 'Pendiente' | 'Confirmada' | 'Completada' | 'Cancelada';

export interface Appointment {
  id: string;
  referenceCode: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number; // Price in USD
  bcvRateUsed: number; // BCV exchange rate at time of booking
  amountBs: number; // Calculated price in Bolívares
  specialistId: string;
  specialistName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export type BookingStep = 1 | 2 | 3 | 4 | 5;

export interface BookingFormData {
  serviceId: string;
  specialistId: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
}
