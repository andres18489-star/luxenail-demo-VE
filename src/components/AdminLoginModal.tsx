import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { ShieldCheck, Lock, X, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const AdminLoginModal: React.FC = () => {
  const { isAdminModalOpen, closeAdminModal, loginAdmin, setActiveAdminTab } = useBooking();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isAdminModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(password);
    if (!success) {
      setError('Invalid admin credentials. Use "admin" or "admin123"');
    } else {
      setPassword('');
      setError('');
      setActiveAdminTab('dashboard');
      setTimeout(() => {
        const adminElem = document.getElementById('admin-panel');
        if (adminElem) adminElem.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl relative border border-rose-100 p-6 sm:p-8"
      >
        <button
          onClick={closeAdminModal}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-amber-200 flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6 text-rose-400" />
          </div>

          <h3 className="font-serif font-bold text-2xl text-zinc-900">
            LuxeNail Studio Staff Portal
          </h3>

          <p className="text-xs text-zinc-500">
            Enter your admin password to view incoming appointments, change booking statuses, and manage salon services.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block mb-1.5">
              Admin Access Key
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Enter password (e.g. admin123)"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-rose-200 text-sm font-medium focus:ring-2 focus:ring-rose-400 outline-none text-zinc-800"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span><strong>Demo Passcode:</strong> Enter <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-900">admin123</code> or <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-900">admin</code></span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
          >
            Authenticate & Access Panel
          </button>
        </form>
      </motion.div>
    </div>
  );
};
