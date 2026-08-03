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

// Helper para validar si un string es un UUID valido de Postgres
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
export async function saveAppointmentToSupabase(
  appointment: Omit<Appointment, 'id'>
): Promise<{ data: Appointment | null; error: Error | null }> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase no está configurado.') };
  }

  try {
    // Mapear el estado del frontend al valor 'CHECK' permitido por la BD en ingles
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

      // Validacion estricta de UUID para Foreign Keys
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