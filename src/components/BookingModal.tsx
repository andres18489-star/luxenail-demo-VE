import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { BookingStep, BookingFormData } from '../types';
import { MOCK_TIME_SLOTS } from '../data/mockData';
import {
  X,
  CheckCircle2,
  Calendar as CalendarIcon,
  Clock,
  User,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Phone,
  Mail,
  FileText,
  CreditCard,
  Copy,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const BookingModal: React.FC = () => {
  const {
    isBookingModalOpen,
    closeBookingModal,
    services,
    specialists,
    selectedService,
    setSelectedService,
    selectedSpecialist,
    setSelectedSpecialist,
    createAppointment,
    currentAppointment,
    bcvRate,
    formatBsAmount,
    showToast,
  } = useBooking();

  const [step, setStep] = useState<BookingStep>(1);

  // Form State
  const [formData, setFormData] = useState<BookingFormData>({
    serviceId: services[0]?.id || '',
    specialistId: specialists[0]?.id || '',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    time: MOCK_TIME_SLOTS[1] || '10:15 AM',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill selected service / specialist if passed from context
  useEffect(() => {
    if (selectedService) {
      setFormData((prev) => ({ ...prev, serviceId: selectedService.id }));
    }
    if (selectedSpecialist) {
      setFormData((prev) => ({ ...prev, specialistId: selectedSpecialist.id }));
    }
  }, [selectedService, selectedSpecialist]);

  if (!isBookingModalOpen) return null;

  const currentServiceObj = services.find((s) => s.id === formData.serviceId) || services[0];
  const currentSpecialistObj = specialists.find((sp) => sp.id === formData.specialistId) || specialists[0];

  const handleNextStep = () => {
    if (step === 1 && !formData.serviceId) {
      setErrors({ service: 'Por favor selecciona un servicio para continuar.' });
      return;
    }
    if (step === 2 && !formData.specialistId) {
      setErrors({ specialist: 'Por favor selecciona un especialista.' });
      return;
    }
    if (step === 3 && (!formData.date || !formData.time)) {
      setErrors({ dateTime: 'Por favor elige la fecha y el turno de hora.' });
      return;
    }
    if (step === 4) {
      const newErrors: Record<string, string> = {};
      if (!formData.customerName.trim()) newErrors.customerName = 'Tu nombre y apellido son requeridos';
      if (!formData.customerPhone.trim() || formData.customerPhone.length < 7)
        newErrors.customerPhone = 'Ingresa un número de teléfono / WhatsApp válido';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Submit Form & Trigger WhatsApp
      submitBookingAndOpenWhatsApp();
      return;
    }

    setErrors({});
    setStep((prev) => (prev + 1) as BookingStep);
  };

  const handlePrevStep = () => {
    setErrors({});
    setStep((prev) => (prev - 1) as BookingStep);
  };

  const buildWhatsAppMessage = (refCode: string) => {
    const serviceName = currentServiceObj?.name || 'Servicio LuxeNail';
    const priceUsd = currentServiceObj?.price || 25;
    const priceBs = formatBsAmount(priceUsd);
    const specialistName = currentSpecialistObj?.name || 'Asignación Automática';

    let msg = `¡Hola LuxeNail Studio VE! 💅 Deseo confirmar mi cita:\n\n`;
    msg += `• *Código:* ${refCode}\n`;
    msg += `• *Cliente:* ${formData.customerName}\n`;
    msg += `• *Teléfono:* ${formData.customerPhone}\n`;
    if (formData.customerEmail) msg += `• *Correo:* ${formData.customerEmail}\n`;
    msg += `• *Servicio:* ${serviceName}\n`;
    msg += `• *Precio USD:* $${priceUsd.toFixed(2)} USD\n`;
    msg += `• *Precio Bolívares:* ${priceBs} (Tasa BCV: ${bcvRate.toFixed(2)} Bs/$)\n`;
    msg += `• *Especialista:* ${specialistName}\n`;
    msg += `• *Fecha:* ${formData.date}\n`;
    msg += `• *Hora:* ${formData.time}\n`;
    if (formData.notes) msg += `• *Notas/Diseño:* ${formData.notes}\n`;
    msg += `\n💳 *Nota:* Realizaré el pago presencialmente en el estudio al finalizar mi atención.`;

    return msg;
  };

  const submitBookingAndOpenWhatsApp = async () => {
    setIsSubmitting(true);
    try {
      // 1) Insert appointment into Supabase & Context
      const newApp = await createAppointment(formData);
      
      // 2) Construct WhatsApp redirect
      const phoneNo = '584129876543'; // Studio WhatsApp
      const waMessage = buildWhatsAppMessage(newApp.referenceCode);
      const waUrl = `https://wa.me/${phoneNo}?text=${encodeURIComponent(waMessage)}`;

      // Open WhatsApp in a new window/tab
      window.open(waUrl, '_blank');

      // 3) Advance to Step 5
      setStep(5);
    } catch (err) {
      console.error('Error al procesar la cita:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedSpecialist(null);
    closeBookingModal();
  };

  const copyRefCode = () => {
    if (currentAppointment?.referenceCode) {
      navigator.clipboard.writeText(currentAppointment.referenceCode);
      showToast('Código de cita copiado al portapapeles');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl relative border border-rose-100 my-auto"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 p-6 text-white relative">
          <button
            onClick={resetAndClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-rose-100 text-xs font-bold uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4 text-amber-200" />
            LuxeNail Studio VE • Caracas
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl">
            {step === 5 ? '¡Cita Enviada por WhatsApp!' : 'Reserva tu Cita Online'}
          </h2>

          {/* Stepper Progress Bar */}
          {step < 5 && (
            <div className="mt-6 flex items-center justify-between text-xs font-semibold text-rose-100">
              <span className={step >= 1 ? 'text-amber-200 font-bold' : ''}>1. Servicio</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              <span className={step >= 2 ? 'text-amber-200 font-bold' : ''}>2. Especialista</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              <span className={step >= 3 ? 'text-amber-200 font-bold' : ''}>3. Fecha y Hora</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              <span className={step >= 4 ? 'text-amber-200 font-bold' : ''}>4. Confirmación</span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Select Service */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-zinc-900">
                    Paso 1: Selecciona tu Tratamiento
                  </h3>
                  <span className="text-xs text-zinc-400">Precios en USD y Tasa BCV</span>
                </div>

                {errors.service && (
                  <p className="text-xs text-red-500 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.service}
                  </p>
                )}

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {services.map((srv) => (
                    <label
                      key={srv.id}
                      onClick={() => setFormData({ ...formData, serviceId: srv.id })}
                      className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                        formData.serviceId === srv.id
                          ? 'border-rose-500 bg-rose-50/60 shadow-sm ring-2 ring-rose-300'
                          : 'border-rose-100 hover:border-rose-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={srv.imageUrl || srv.image}
                          alt={srv.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-sm text-zinc-900">
                              {srv.name}
                            </span>
                            {srv.popular && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                                Popular
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-zinc-500 block">
                            {srv.category} • {srv.durationMinutes || srv.duration} min
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-serif font-bold text-base text-zinc-900 block">
                          ${srv.price.toFixed(2)} USD
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 block">
                          ≈ {formatBsAmount(srv.price)}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Select Specialist */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-zinc-900">
                    Paso 2: Elige a tu Especialista
                  </h3>
                  <span className="text-xs text-zinc-400">Preferencia opcional</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {specialists.map((sp) => (
                    <label
                      key={sp.id}
                      onClick={() => setFormData({ ...formData, specialistId: sp.id })}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        formData.specialistId === sp.id
                          ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-300 shadow-sm'
                          : 'border-rose-100 hover:border-rose-200 bg-white'
                      }`}
                    >
                      <img
                        src={sp.avatarUrl || sp.photo}
                        alt={sp.name}
                        className="w-12 h-12 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-serif font-bold text-sm text-zinc-900 truncate">
                          {sp.name}
                        </p>
                        <p className="text-[11px] text-rose-600 font-semibold truncate">
                          {sp.role || sp.title}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          ★ {sp.rating || 5.0} evaluación
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 3: Select Date & Time */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <h3 className="font-serif font-bold text-lg text-zinc-900">
                  Paso 3: Elige Fecha y Horario
                </h3>

                {/* Date Input */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1.5">
                    Fecha de la Cita
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-rose-200 text-sm font-medium focus:ring-2 focus:ring-rose-400 outline-none text-zinc-800"
                  />
                </div>

                {/* Time Slots Grid */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-2">
                    Turnos Disponibles para {formData.date}
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {MOCK_TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setFormData({ ...formData, time: slot })}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          formData.time === slot
                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                            : 'bg-rose-50/40 text-zinc-700 hover:bg-rose-100 border-rose-100'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Customer Details Form + WhatsApp Confirm (Requirement 2) */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="font-serif font-bold text-lg text-zinc-900">
                  Paso 4: Datos del Cliente & Desglose
                </h3>

                {/* Name */}
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-rose-500" />
                    Nombre y Apellido *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Mariana Páez"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium outline-none focus:ring-2 ${
                      errors.customerName ? 'border-red-400 ring-red-100' : 'border-rose-200 focus:ring-rose-300'
                    }`}
                  />
                  {errors.customerName && <p className="text-[11px] text-red-500 mt-0.5">{errors.customerName}</p>}
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      Teléfono WhatsApp (+58) *
                    </label>
                    <input
                      type="tel"
                      placeholder="Ej. 0412-1234567"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium outline-none focus:ring-2 ${
                        errors.customerPhone ? 'border-red-400 ring-red-100' : 'border-rose-200 focus:ring-rose-300'
                      }`}
                    />
                    {errors.customerPhone && <p className="text-[11px] text-red-500 mt-0.5">{errors.customerPhone}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-rose-500" />
                      Correo Electrónico (Opcional)
                    </label>
                    <input
                      type="email"
                      placeholder="mariana@gmail.com"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-rose-200 text-sm font-medium outline-none focus:ring-2 focus:ring-rose-300"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-rose-500" />
                    Preferencias o Notas de Diseño (Nail Art)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej. Prefiero forma almendrada corta, efecto aperlado o tonos nude..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-rose-200 text-sm font-medium outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>

                {/* Summary Card with Dual Pricing */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-zinc-800 space-y-2 shadow-sm">
                  <div className="flex justify-between items-center font-bold text-sm text-zinc-900 border-b border-amber-200/60 pb-2">
                    <span>{currentServiceObj?.name}</span>
                    <span className="font-serif text-base text-rose-600">${currentServiceObj?.price.toFixed(2)} USD</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-zinc-700 text-xs pt-1">
                    <p><strong>Especialista:</strong> {currentSpecialistObj?.name}</p>
                    <p><strong>Fecha y Hora:</strong> {formData.date} a las {formData.time}</p>
                    <p><strong>Tasa BCV Aplicada:</strong> {bcvRate.toFixed(2)} Bs/$</p>
                    <p className="font-bold text-emerald-800"><strong>Equivalente Bs:</strong> {formatBsAmount(currentServiceObj?.price || 0)}</p>
                  </div>

                  {/* Payment Notice */}
                  <div className="pt-2 border-t border-amber-200/60 flex items-center gap-2 text-[11px] text-zinc-600 font-medium">
                    <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Nota de Pago:</strong> El pago se efectúa presencialmente en el estudio al finalizar el servicio (Efectivo USD, Pago Móvil o Punto a Tasa BCV).</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Visual Confirmation */}
            {step === 5 && currentAppointment && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center py-2"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">
                    <span>Cita #{currentAppointment.referenceCode}</span>
                    <button
                      onClick={copyRefCode}
                      className="text-emerald-700 hover:text-emerald-950 p-0.5 cursor-pointer"
                      title="Copiar código"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-zinc-900 mt-3">
                    ¡Cita Agendada y Notificada por WhatsApp!
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1 max-w-md mx-auto">
                    Tu cita ha sido guardada con éxito en el sistema. Te atenderemos en nuestro estudio en Las Mercedes, Caracas.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-100 text-left text-xs space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-rose-200/60">
                    <div>
                      <span className="font-bold text-sm text-zinc-900 block">
                        {currentAppointment.serviceName}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Atención personalizada por {currentAppointment.specialistName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-serif font-bold text-base text-rose-600 block">
                        ${currentAppointment.servicePrice.toFixed(2)} USD
                      </span>
                      <span className="text-xs font-bold text-emerald-700 block">
                        ≈ {formatBsAmount(currentAppointment.servicePrice)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-zinc-700">
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-semibold">CLIENTE</span>
                      <strong className="text-zinc-900">{currentAppointment.customerName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-semibold">FECHA Y HORA</span>
                      <strong className="text-zinc-900">{currentAppointment.date} @ {currentAppointment.time}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-semibold">TELÉFONO</span>
                      <strong className="text-zinc-900">{currentAppointment.customerPhone}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-semibold">TASA BCV APLICADA</span>
                      <strong className="text-zinc-900">{currentAppointment.bcvRateUsed.toFixed(2)} Bs/$</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-100/60 border border-amber-200 text-[11px] text-amber-900">
                    <strong>💳 Recordatorio de Pago:</strong> El pago se efectúa en el local al terminar el servicio (Efectivo USD, Pago Móvil, Punto de Venta o Zelle).
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <a
                    href={`https://wa.me/584129876543?text=${encodeURIComponent(buildWhatsAppMessage(currentAppointment.referenceCode))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-1/2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Reabrir WhatsApp
                  </a>

                  <button
                    onClick={resetAndClose}
                    className="w-full sm:w-1/2 py-3 rounded-xl bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    Finalizar y Volver
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Modal Footer Controls */}
        {step < 5 && (
          <div className="p-4 sm:p-6 bg-rose-50/40 border-t border-rose-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:text-zinc-900 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Atrás
              </button>
            ) : (
              <div />
            )}

            {step === 4 ? (
              /* Requirement 2: Green button with WhatsApp Icon */
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleNextStep}
                className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-lg shadow-emerald-200 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
              >
                {/* SVG WhatsApp Icon */}
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                {isSubmitting ? 'Guardando Cita...' : 'Confirmar Cita por WhatsApp'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-rose-200 cursor-pointer"
              >
                <span>Continuar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
