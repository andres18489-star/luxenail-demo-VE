import React from 'react';
import { BookingProvider } from './context/BookingContext';
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
          <AdminPanel />
        </main>
        <Footer />

        {/* Modals & Overlay Alerts */}
        <BookingModal />
        <AdminLoginModal />
        <ToastNotification />
      </div>
    </BookingProvider>
  );
}
