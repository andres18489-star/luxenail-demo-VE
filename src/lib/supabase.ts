import { createClient } from '@supabase/supabase-js';
import { Appointment, Service, Specialist, PortfolioItem } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabase);
};

const isValidUUID = (id?: string | null): boolean => {
  if (!id) return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(id);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToAppointment(row: any): Appointment {
  const statusMap: Record<string, Appointment['status']> = {
    'Pending': 'Pendiente',
    'Confirmed': 'Confirmada',
    'Completed': 'Completada',
    'Cancelled': 'Cancelada'
  };

  return {
    id: String(row.id),
    referenceCode: row.reference_code || '',
    serviceId: row.service_id || '',
    serviceName: row.service_name || '',
    servicePrice: Number(row.service_price ?? row.amount_usd ?? 0),
    bcvRateUsed: Number(row.bcv_rate_used ?? 0),
    amountBs: Number(row.amount_bs ?? 0),
    specialistId: row.specialist_id || '',
    specialistName: row.specialist_name || '',
    date: row.date || row.booking_date || '',
    time: row.time || row.booking_time || '',
    customerName: row.customer_name || row.client_name || '',
    customerEmail: row.customer_email || '',
    customerPhone: row.customer_phone || row.client_phone || '',
    notes: row.notes || '',
    status: statusMap[row.status] || (row.status as Appointment['status']) || 'Pendiente',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

// --- FETCH GENERALES (CORREGIDOS CON MAPEO) ---

export async function fetchServicesFromSupabase() {
  if (!supabase) return { data: null, error: new Error('Supabase no configurado.') };
  try {
    const { data, error } = await supabase.from('services').select('*');
    if (error) throw error;
    
    // Imagen por defecto en caso de que en Supabase la columna valga NULL, undefined o ""
    const DEFAULT_SERVICE_IMAGE = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800';

    const mappedData = (data || []).map(row => {
      // Evaluamos todas las posibles columnas o variaciones de nombre
      const resolvedImage = row.image || row.image_url || row.imageUrl || DEFAULT_SERVICE_IMAGE;

      return {
        ...row,
        durationMinutes: row.duration_minutes ?? row.durationMinutes ?? 60,
        reviewsCount: row.reviews_count ?? row.reviewsCount ?? 0,
        isActive: row.is_active ?? row.isActive ?? true,
        // Garantizamos que ambas propiedades tengan un string válido con la URL
        imageUrl: resolvedImage,
        image: resolvedImage
      };
    });
    
    return { data: mappedData, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Error al obtener servicios') };
  }
}

export async function fetchSpecialistsFromSupabase() {
  if (!supabase) return { data: null, error: new Error('Supabase no configurado.') };
  try {
    const { data, error } = await supabase.from('specialists').select('*');
    if (error) throw error;
    
    // Mapeamos avatar_url a avatarUrl
    const mappedData = (data || []).map(row => ({
      ...row,
      avatarUrl: row.avatar_url,
      avatar: row.avatar_url, // Respaldo por si el front usa solo 'avatar'
      availableDays: row.available_days,
      reviewsCount: row.reviews_count,
      isActive: row.is_active
    }));
    
    return { data: mappedData, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Error al obtener especialistas') };
  }
}

export async function fetchPortfolioFromSupabase() {
  if (!supabase) return { data: null, error: new Error('Supabase no configurado.') };
  try {
    const { data, error } = await supabase.from('portfolio_items').select('*');
    if (error) throw error;
    
    // Mapeamos image_url a imageUrl
    const mappedData = (data || []).map(row => ({
      ...row,
      imageUrl: row.image_url,
      image: row.image_url // Respaldo por si el front usa solo 'image'
    }));
    
    return { data: mappedData, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Error al obtener portafolio') };
  }
}

// --- CRUD DE SERVICIOS ---
export async function saveServiceToSupabase(service: Omit<Service, 'id'>) {
  if (!supabase) return { data: null, error: new Error('Supabase no configurado') };
  
  const payload = {
    name: service.name,
    description: service.description,
    price: service.price,
    duration_minutes: (service as any).durationMinutes,
    category: service.category,
    is_active: service.isActive ?? true,
    popular: service.popular ?? false,
    image: (service as any).image || (service as any).imageUrl,
    rating: service.rating ?? 5.0,
    reviews_count: (service as any).reviewsCount ?? 1
  };
  
  const { data, error } = await supabase.from('services').insert([payload]).select().single();
  return { data, error };
}

export async function updateServiceInSupabase(id: string, updates: Partial<Service>) {
  if (!supabase) return { error: new Error('Supabase no configurado') };
  
  const payload: any = { ...updates };
  if ((updates as any).durationMinutes !== undefined) payload.duration_minutes = (updates as any).durationMinutes;
  if (updates.isActive !== undefined) payload.is_active = updates.isActive;
  if ((updates as any).reviewsCount !== undefined) payload.reviews_count = (updates as any).reviewsCount;
  if ((updates as any).imageUrl !== undefined) payload.image = (updates as any).imageUrl;
  
  const { error } = await supabase.from('services').update(payload).eq('id', id);
  return { error };
}

// --- CRUD DE ESPECIALISTAS ---
export async function saveSpecialistToSupabase(specialist: Omit<Specialist, 'id'>) {
  if (!supabase) return { data: null, error: new Error('Supabase no configurado') };
  
  const payload = {
    name: specialist.name,
    role: specialist.role,
    phone: specialist.phone,
    avatar_url: (specialist as any).avatarUrl || (specialist as any).avatar,
    is_active: specialist.isActive ?? true,
    specialty: specialist.specialty,
    rating: specialist.rating ?? 5.0,
    reviews_count: (specialist as any).reviewsCount ?? 1,
    bio: specialist.bio,
    available_days: (specialist as any).availableDays
  };
  
  const { data, error } = await supabase.from('specialists').insert([payload]).select().single();
  return { data, error };
}

export async function updateSpecialistInSupabase(id: string, updates: Partial<Specialist>) {
  if (!supabase) return { error: new Error('Supabase no configurado') };
  
  const payload: any = { ...updates };
  if ((updates as any).avatarUrl !== undefined) payload.avatar_url = (updates as any).avatarUrl;
  if (updates.isActive !== undefined) payload.is_active = updates.isActive;
  if ((updates as any).reviewsCount !== undefined) payload.reviews_count = (updates as any).reviewsCount;
  if ((updates as any).availableDays !== undefined) payload.available_days = (updates as any).availableDays;
  
  const { error } = await supabase.from('specialists').update(payload).eq('id', id);
  return { error };
}

// --- CRUD DE PORTAFOLIO ---
export async function savePortfolioItemToSupabase(item: Omit<PortfolioItem, 'id'>) {
  if (!supabase) return { data: null, error: new Error('Supabase no configurado') };
  
  const payload = {
    title: item.title,
    image_url: (item as any).imageUrl || (item as any).image,
    category: item.category,
    artist: item.artist,
    likes: item.likes ?? 0
  };
  
  const { data, error } = await supabase.from('portfolio_items').insert([payload]).select().single();
  return { data, error };
}

// --- APPOINTMENTS CRUD ---
export async function saveAppointmentToSupabase(appointment: Omit<Appointment, 'id'>): Promise<{ data: Appointment | null; error: Error | null }> {
  if (!supabase) return { data: null, error: new Error('Supabase no está configurado.') };

  try {
    const statusDbMap: Record<string, string> = {
      'Pendiente': 'Pending',
      'Confirmada': 'Confirmed',
      'Completada': 'Completed',
      'Cancelada': 'Cancelled'
    };

    const payload = {
      reference_code: appointment.referenceCode,
      customer_name: appointment.customerName,
      customer_phone: appointment.customerPhone,
      date: appointment.date,
      time: appointment.time,
      client_name: appointment.customerName,
      client_phone: appointment.customerPhone,
      booking_date: appointment.date,
      booking_time: appointment.time,
      customer_email: appointment.customerEmail || null,
      service_name: appointment.serviceName,
      specialist_name: appointment.specialistName,
      service_price: Number(appointment.servicePrice) || 0,
      amount_usd: Number(appointment.servicePrice) || 0,
      bcv_rate_used: Number(appointment.bcvRateUsed) || 0,
      amount_bs: Number(appointment.amountBs) || 0,
      service_id: isValidUUID(appointment.serviceId) ? appointment.serviceId : null,
      specialist_id: isValidUUID(appointment.specialistId) ? appointment.specialistId : null,
      status: statusDbMap[appointment.status] || 'Pending',
      notes: appointment.notes || ''
    };

    const { data, error } = await supabase.from('appointments').insert([payload]).select().single();

    if (error) throw new Error(error.message);
    return { data: mapRowToAppointment(data), error: null };
  } catch (err: unknown) {
    return { data: null, error: err instanceof Error ? err : new Error('Error al guardar cita') };
  }
}

export async function fetchAppointmentsFromSupabase(): Promise<{ data: Appointment[] | null; error: Error | null }> {
  if (!supabase) return { data: null, error: new Error('Supabase no está configurado.') };
  try {
    const { data, error } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return { data: (data || []).map(mapRowToAppointment), error: null };
  } catch (err: unknown) {
    return { data: null, error: err instanceof Error ? err : new Error('Error al obtener citas') };
  }
}

export async function updateAppointmentStatusInSupabase(appointmentId: string, newStatus: Appointment['status']): Promise<{ success: boolean; error: Error | null }> {
  if (!supabase) return { success: false, error: new Error('Supabase no está configurado.') };
  try {
    const statusDbMap: Record<string, string> = {
      'Pendiente': 'Pending',
      'Confirmada': 'Confirmed',
      'Completada': 'Completed',
      'Cancelada': 'Cancelled'
    };
    const dbStatus = statusDbMap[newStatus] || newStatus;

    const { error } = await supabase.from('appointments').update({ status: dbStatus }).eq('id', appointmentId);
    if (error) throw new Error(error.message);
    return { success: true, error: null };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err : new Error('Error al actualizar estado') };
  }
}

export async function deleteRecordFromSupabase(tableName: 'appointments' | 'services' | 'specialists' | 'portfolio_items', id: string): Promise<{ success: boolean; error: Error | null }> {
  if (!supabase) return { success: false, error: new Error('Supabase no está configurado.') };
  try {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true, error: null };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err : new Error('Error al eliminar registro') };
  }
}