import React from 'react';
import { useBooking } from '../context/BookingContext';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastNotification: React.FC = () => {
  const { toast } = useBooking();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border border-rose-200/80 bg-white/95 backdrop-blur-md text-zinc-900"
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-rose-500 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
          
          <span className="text-sm font-medium pr-2">{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
