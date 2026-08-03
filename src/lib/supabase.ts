import { createClient } from '@supabase/supabase-js';
import { Appointment } from '../types';

// Retrieve environment variables for Supabase integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Supabase client instance.
 * If credentials are not provided in environment variables,
 * operations will gracefully fall back to local state.
 */
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Check whether Supabase is configured and connected
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabase);
};

/**
 * Insert a new appointment into Supabase
 * Strict requirement: insert into 'appointments' table with client_name, client_phone, service_id, booking_date, booking_time, amount_usd, bcv_rate_used, status
 */
export async function saveAppointmentToSupabase(appointment: Omit<Appointment, 'id'>): Promise<{ data: Appointment | null; error: Error | null }> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase no está configurado. Usando estado local.') };
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

    const formattedData: Appointment = {
      id: data.id || `app-${Date.now()}`,
      referenceCode: data.reference_code || appointment.referenceCode,
      serviceId: data.service_id || appointment.serviceId,
      serviceName: data.service_name || appointment.serviceName,
      servicePrice: Number(data.amount_usd || data.service_price || appointment.servicePrice),
      bcvRateUsed: Number(data.bcv_rate_used || appointment.bcvRateUsed),
      amountBs: Number(data.amount_bs || appointment.amountBs),
      specialistId: data.specialist_id || appointment.specialistId,
      specialistName: data.specialist_name || appointment.specialistName,
      date: data.booking_date || data.date || appointment.date,
      time: data.booking_time || data.time || appointment.time,
      customerName: data.client_name || data.customer_name || appointment.customerName,
      customerEmail: data.customer_email || appointment.customerEmail,
      customerPhone: data.client_phone || data.customer_phone || appointment.customerPhone,
      notes: data.notes || appointment.notes,
      status: (data.status as Appointment['status']) || appointment.status,
      createdAt: data.created_at || appointment.createdAt,
    };

    return { data: formattedData, error: null };
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error('Error inesperado al guardar la cita en Supabase');
    console.error('Unexpected Supabase Error:', errorObj);
    return { data: null, error: errorObj };
  }
}

/**
 * Fetch all appointments from Supabase
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

    const appointments: Appointment[] = (data || []).map((item) => ({
      id: String(item.id),
      referenceCode: item.reference_code || `LXN-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceId: item.service_id || 'srv-1',
      serviceName: item.service_name || 'Manicura Rusa',
      servicePrice: Number(item.amount_usd || item.service_price || 25),
      bcvRateUsed: Number(item.bcv_rate_used || 68.50),
      amountBs: Number(item.amount_bs || (Number(item.amount_usd || 25) * 68.50)),
      specialistId: item.specialist_id || 'spec-1',
      specialistName: item.specialist_name || 'Especialista',
      date: item.booking_date || item.date || new Date().toISOString().split('T')[0],
      time: item.booking_time || item.time || '10:00 AM',
      customerName: item.client_name || item.customer_name || 'Cliente',
      customerEmail: item.customer_email || '',
      customerPhone: item.client_phone || item.customer_phone || '',
      notes: item.notes || '',
      status: (item.status as Appointment['status']) || 'Pendiente',
      createdAt: item.created_at || new Date().toISOString(),
    }));

    return { data: appointments, error: null };
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error('Error al obtener citas desde Supabase');
    return { data: null, error: errorObj };
  }
}

/**
 * Update appointment status in Supabase
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
    const errorObj = err instanceof Error ? err : new Error('Error al actualizar estado en Supabase');
    return { success: false, error: errorObj };
  }
}

/**
 * Delete record from Supabase
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
