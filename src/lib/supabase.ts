import { createClient } from '@supabase/supabase-js';
import { Appointment } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabase);
};

// Helper para validar si un string es un UUID válido de Postgres
const isValidUUID = (id?: string | null): boolean => {
  if (!id) return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(id);
};

/**
 * Mapper de la Fila Postgres (Snake Case) -> Objeto TypeScript (Camel Case)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToAppointment(row: any): Appointment {
  // Mapear status en inglés de la BD al español que usa el frontend si es necesario
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

/**
 * Inserta una cita respetando el esquema estricto de Supabase
 */
// Extraer Servicios
export async function fetchServicesFromSupabase() {
  if (!supabase) return { data: null, error: new Error('Supabase no configurado.') };
  
  try {
    const { data, error } = await supabase.from('services').select('*').eq('isActive', true);
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Error al obtener servicios') };
  }
}

// Extraer Especialistas
export async function fetchSpecialistsFromSupabase() {
  if (!supabase) return { data: null, error: new Error('Supabase no configurado.') };
  
  try {
    const { data, error } = await supabase.from('specialists').select('*').eq('isActive', true);
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Error al obtener especialistas') };
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

export async function saveAppointmentToSupabase(
  appointment: Omit<Appointment, 'id'>
): Promise<{ data: Appointment | null; error: Error | null }> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase no está configurado.') };
  }

  try {
    // Mapear el estado del frontend al valor 'CHECK' permitido por la BD en inglés
    const statusDbMap: Record<string, string> = {
      'Pendiente': 'Pending',
      'Confirmada': 'Confirmed',
      'Completada': 'Completed',
      'Cancelada': 'Cancelled'
    };

    const payload = {
      reference_code: appointment.referenceCode,
      // Llenamos las columnas requeridas (NOT NULL)
      customer_name: appointment.customerName,
      customer_phone: appointment.customerPhone,
      date: appointment.date,
      time: appointment.time,
      
      // Duplicamos en las secundarias por compatibilidad si la BD las exige
      client_name: appointment.customerName,
      client_phone: appointment.customerPhone,
      booking_date: appointment.date,
      booking_time: appointment.time,

      customer_email: appointment.customerEmail || null,
      service_name: appointment.serviceName,
      specialist_name: appointment.specialistName,
      
      // Montos
      service_price: Number(appointment.servicePrice) || 0,
      amount_usd: Number(appointment.servicePrice) || 0,
      bcv_rate_used: Number(appointment.bcvRateUsed) || 0,
      amount_bs: Number(appointment.amountBs) || 0,

      // Validación estricta de UUID para Foreign Keys
      service_id: isValidUUID(appointment.serviceId) ? appointment.serviceId : null,
      specialist_id: isValidUUID(appointment.specialistId) ? appointment.specialistId : null,

      status: statusDbMap[appointment.status] || 'Pending',
      notes: appointment.notes || ''
    };

    const { data, error } = await supabase
      .from('appointments')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Supabase Insert Error:', error.message, error.details);
      return { data: null, error: new Error(error.message) };
    }

    return { data: mapRowToAppointment(data), error: null };
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error('Error al guardar cita');
    return { data: null, error: errorObj };
  }
}

/**
 * Obtiene todas las citas desde Supabase
 */
export async function fetchAppointmentsFromSupabase(): Promise<{ data: Appointment[] | null; error: Error | null }> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase no está configurado.') };
  }

  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Fetch Error:', error.message);
      return { data: null, error: new Error(error.message) };
    }

    const appointments = (data || []).map(mapRowToAppointment);
    return { data: appointments, error: null };
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error('Error al obtener citas');
    return { data: null, error: errorObj };
  }
}

/**
 * Actualiza el estado de una cita en Supabase
 */
export async function updateAppointmentStatusInSupabase(
  appointmentId: string,
  newStatus: Appointment['status']
): Promise<{ success: boolean; error: Error | null }> {
  if (!supabase) {
    return { success: false, error: new Error('Supabase no está configurado.') };
  }

  try {
    const statusDbMap: Record<string, string> = {
      'Pendiente': 'Pending',
      'Confirmada': 'Confirmed',
      'Completada': 'Completed',
      'Cancelada': 'Cancelled'
    };

    const dbStatus = statusDbMap[newStatus] || newStatus;

    const { error } = await supabase
      .from('appointments')
      .update({ status: dbStatus })
      .eq('id', appointmentId);

    if (error) {
      console.error('Supabase Update Error:', error.message);
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error('Error al actualizar estado de la cita');
    return { success: false, error: errorObj };
  }
}

/**
 * Elimina un registro por ID de cualquier tabla en Supabase
 */
export async function deleteRecordFromSupabase(
  tableName: 'appointments' | 'services' | 'specialists' | 'portfolio_items',
  id: string
): Promise<{ success: boolean; error: Error | null }> {
  if (!supabase) {
    return { success: false, error: new Error('Supabase no está configurado.') };
  }

  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Supabase Delete Error in ${tableName}:`, error.message);
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error('Error al eliminar registro');
    return { success: false, error: errorObj };
  }
}