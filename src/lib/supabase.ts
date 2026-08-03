import { createClient } from '@supabase/supabase-js';
import { Appointment } from '../types';

// Retrieve environment variables for Supabase integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Instancia del cliente de Supabase.
 */
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Verifica si Supabase está correctamente configurado
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabase);
};

/**
 * Mapper interno: Convierte registros en snake_case de la BD a la interfaz Appointment (camelCase)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToAppointment(row: any): Appointment {
  return {
    id: String(row.id),
    referenceCode: row.reference_code || '',
    serviceId: row.service_id || '',
    serviceName: row.service_name || '',
    servicePrice: Number(row.amount_usd ?? row.service_price ?? 0),
    bcvRateUsed: Number(row.bcv_rate_used ?? 0),
    amountBs: Number(row.amount_bs ?? 0),
    specialistId: row.specialist_id || '',
    specialistName: row.specialist_name || '',
    date: row.booking_date || row.date || '',
    time: row.booking_time || row.time || '',
    customerName: row.client_name || row.customer_name || '',
    customerEmail: row.customer_email || '',
    customerPhone: row.client_phone || row.customer_phone || '',
    notes: row.notes || '',
    status: (row.status as Appointment['status']) || 'Pendiente',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

/**
 * Guarda una nueva cita en Supabase
 */
export async function saveAppointmentToSupabase(
  appointment: Omit<Appointment, 'id'>
): Promise<{ data: Appointment | null; error: Error | null }> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase no está configurado.') };
  }

  try {
    const payload = {
      client_name: appointment.customerName,
      client_phone: appointment.customerPhone,
      customer_email: appointment.customerEmail || '',
      service_id: appointment.serviceId,
      service_name: appointment.serviceName,
      specialist_id: appointment.specialistId,
      specialist_name: appointment.specialistName,
      booking_date: appointment.date,
      booking_time: appointment.time,
      amount_usd: appointment.servicePrice,
      bcv_rate_used: appointment.bcvRateUsed,
      amount_bs: appointment.amountBs,
      reference_code: appointment.referenceCode,
      notes: appointment.notes || '',
      status: appointment.status || 'Pendiente',
      created_at: appointment.createdAt || new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('appointments')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Supabase Appointment Insert Error:', error.message);
      return { data: null, error: new Error(error.message) };
    }

    return { data: mapRowToAppointment(data), error: null };
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error('Error inesperado al guardar la cita');
    console.error('Unexpected Supabase Error:', errorObj);
    return { data: null, error: errorObj };
  }
}

/**
 * Obtiene todas las citas de Supabase ordenadas por fecha de creación
 */
export async function fetchAppointmentsFromSupabase(): Promise<{ data: Appointment[] | null; error: Error | null }> {
  if (!supabase) {
    return { data: null, error: new Error('El cliente de Supabase no está configurado.') };
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

    const appointments: Appointment[] = (data || []).map(mapRowToAppointment);
    return { data: appointments, error: null };
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error('Error al obtener citas desde Supabase');
    return { data: null, error: errorObj };
  }
}

/**
 * Actualiza el estado de una cita
 */
export async function updateAppointmentStatusInSupabase(
  appointmentId: string,
  newStatus: Appointment['status']
): Promise<{ success: boolean; error: Error | null }> {
  if (!supabase) {
    return { success: false, error: new Error('Supabase no está configurado.') };
  }

  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId);

    if (error) {
      console.error('Supabase Update Status Error:', error.message);
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error('Error al actualizar estado');
    return { success: false, error: errorObj };
  }
}

/**
 * Elimina un registro por ID
 */
export async function deleteRecordFromSupabase(
  tableName: 'appointments' | 'services',
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