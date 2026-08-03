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

// --- FETCH GENERALES ---
// NOTA CTO: Eliminado el eq('isActive', true) para que el Admin Panel pueda gestionarlos.
export async function fetchServicesFromSupabase() {
  if (!supabase) return { data: null, error: new Error('Supabase no configurado.') };
  try {
    const { data, error } = await supabase.from('services').select('*');
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Error al obtener servicios') };
  }
}

export async function fetchSpecialistsFromSupabase() {
  if (!supabase) return { data: null, error: new Error('Supabase no configurado.') };
  try {
    const { data, error } = await supabase.from('specialists').select('*');
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Error al obtener especialistas') };
  }
}

// Faltaba esta función para el portafolio
export async function fetchPortfolioFromSupabase() {
  if (!supabase) return { data: null, error: new Error('Supabase no configurado.') };
  try {
    const { data, error } = await supabase.from('portfolio_items').select('*');
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Error al obtener portafolio') };
  }
}

// --- CRUD DE SERVICIOS ---
export async function saveServiceToSupabase(service: Omit<Service, 'id'>) {
  if (!supabase) return { data: null, error: new Error('Supabase no configurado') };
  const { data, error } = await supabase.from('services').insert([service]).select().single();
  return { data, error };
}

export async function updateServiceInSupabase(id: string, updates: Partial<Service>) {
  if (!supabase) return { error: new Error('Supabase no configurado') };
  const { error } = await supabase.from('services').update(updates).eq('id', id);
  return { error };
}

// --- CRUD DE ESPECIALISTAS ---
export async function saveSpecialistToSupabase(specialist: Omit<Specialist, 'id'>) {
  if (!supabase) return { data: null, error: new Error('Supabase no configurado') };
  const { data, error } = await supabase.from('specialists').insert([specialist]).select().single();
  return { data, error };
}

export async function updateSpecialistInSupabase(id: string, updates: Partial<Specialist>) {
  if (!supabase) return { error: new Error('Supabase no configurado') };
  const { error } = await supabase.from('specialists').update(updates).eq('id', id);
  return { error };
}

// --- CRUD DE PORTAFOLIO ---
export async function savePortfolioItemToSupabase(item: Omit<PortfolioItem, 'id'>) {
  if (!supabase) return { data: null, error: new Error('Supabase no configurado') };
  const { data, error } = await supabase.from('portfolio_items').insert([item]).select().single();
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