import React from 'react';
import { BookingProvider } from './context/BookingContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './context/ProtectedRoute';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PopularServices } from './components/PopularServices';
import { FullServices } from './components/FullServices';
import { GallerySection } from './components/GallerySection';
import { StaffSection } from './components/StaffSection';
import { LocationContact } from './components/LocationContact';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ToastNotification } from './components/ToastNotification';

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-rose-200 selection:text-rose-900">
          <Navbar />
          <main>
            <Hero />
            <PopularServices />
            <FullServices />
            <GallerySection />
            <StaffSection />
            <LocationContact />
            
            {/* El AdminPanel queda resguardado con Supabase Auth */}
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          </main>
          <Footer />

          {/* Modales y Notificaciones */}
          <BookingModal />
          <AdminLoginModal />
          <ToastNotification />
        </div>
      </BookingProvider>
    </AuthProvider>
  );
}